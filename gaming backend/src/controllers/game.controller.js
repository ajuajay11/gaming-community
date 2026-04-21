const { User, Game, Profile } = require("../models");
const { KYC_STATUS } = require("../constants/userStatus");
const { apiResponse } = require("../utils");
const {
  uploadToAzure,
  deleteManyFromAzure,
  collectImageKeys,
} = require("../services/azureBlob");
const { syncAchievementsForUser } = require("../services/achievementService");
const { buildListingUpdate } = require("../utils/gameListingUpdate");

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function imageKeyForListing(img) {
  if (!img) return null;
  if (typeof img === "object" && img.key) return img.key;
  const keys = collectImageKeys([img]);
  return keys[0] || null;
}

const sortByQuery = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { "price.amount": 1 },
  price_desc: { "price.amount": -1 },
};

const gameController = {
  async gameUpload(req, res, next) {
    try {
      const files = req.files || [];
      if (!files.length) {
        return apiResponse.failure(res, "No media files provided", 400);
      }
      const mediaItems = await Promise.all(
        files.map((file) => uploadToAzure(file))
      );
      const user = await User.findById(req.userId);
      if (!user) {
        return apiResponse.failure(res, "User not found", 404);
      }
      const payload = {
        seller: user._id,
        game: {
          name: req.body.gameName,
          category: req.body.gameCategory,
        },
        title: req.body.title,
        description: req.body.description,
        price: {
          amount: Number(req.body.priceAmount),
          currency: req.body.currency || "USD",
          negotiable: Boolean(req.body.negotiable),
        },
        images: mediaItems.map((r) => ({ url: r.url, key: r.key })),
      };
      if (req.body.details) {
        payload.details = req.body.details;
      }
      const game = await Game.create(payload);
      await syncAchievementsForUser(user._id);
      return apiResponse.success(
        res,
        { game },
        "Game uploaded successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  },
  async getGames(req, res, next) {
    try {
      const {
        status,
        gameCategory,
        gameName,
        search,
        page,
        limit,
        sort,
      } = req.query;
      // Default to `active` listings for public browse; authenticated callers
      // can still pass any explicit `status` to see their own sold/pending ones.
      const filter = { status: status || "active" };
      if (gameCategory) filter["game.category"] = gameCategory;
      if (gameName) {
        filter["game.name"] = new RegExp(`^${escapeRegex(gameName)}$`, "i");
      }
      if (search) {
        const rx = new RegExp(escapeRegex(search), "i");
        filter.$or = [{ title: rx }, { "game.name": rx }];
      }

      const skip = (page - 1) * limit;
      const [games, total] = await Promise.all([
        Game.find(filter)
          .sort(sortByQuery[sort] || sortByQuery.newest)
          .skip(skip)
          .limit(limit)
          .lean(),
        Game.countDocuments(filter),
      ]);

      return apiResponse.success(
        res,
        { games, page, limit, total },
        "Games fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  },
  async getGame(req, res, next) {
    try {
      const id = req.params.id;
      let game;

      if (req.userId) {
        const viewer = await User.findById(req.userId).select("kycStatus").lean();
        const viewerKycApproved = viewer?.kycStatus === KYC_STATUS.APPROVED;

        game = await Game.findById(id)
          .populate({
            path: "seller",
            select: "email phone role lastSeenAt",
          })
          .lean();

        if (!game) {
          return apiResponse.failure(res, "Listing not found", 404);
        }

        if (game.seller && typeof game.seller === "object") {
          if (!viewerKycApproved) {
            delete game.seller.email;
            delete game.seller.phone;
            game.seller.contactRequiresKyc = true;
          } else {
            const prof = await Profile.findOne({ user: game.seller._id })
              .select("whatsapp")
              .lean();
            game.seller.whatsapp = prof?.whatsapp || undefined;
          }
        }
      } else {
        game = await Game.findById(id).lean();
        if (!game) {
          return apiResponse.failure(res, "Listing not found", 404);
        }
        game.seller = null;
      }

      Game.updateOne({ _id: game._id }, { $inc: { views: 1 } }).catch(() => {});

      return apiResponse.success(res, { game }, "Game fetched successfully", 200);
    } catch (error) {
      next(error);
    }
  },
  async getTrending(req, res, next) {
    try {
      const { limit } = req.query;
      const games = await Game.aggregate([
        { $match: { status: "active" } },
        {
          $group: {
            _id: "$game.name",
            listingsCount: { $sum: 1 },
            totalViews: { $sum: { $ifNull: ["$views", 0] } },
            sampleImage: { $first: { $arrayElemAt: ["$images", 0] } },
            categories: { $addToSet: "$game.category" },
          },
        },
        { $sort: { totalViews: -1, listingsCount: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            name: "$_id",
            listingsCount: 1,
            totalViews: 1,
            sampleImage: 1,
            categories: 1,
          },
        },
      ]);
      return apiResponse.success(
        res,
        { games },
        "Trending games fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  },
  async getCatalog(req, res, next) {
    try {
      const { limit, search } = req.query;
      const match = { status: "active" };
      if (search) {
        match["game.name"] = new RegExp(escapeRegex(search), "i");
      }
      const games = await Game.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$game.name",
            listingsCount: { $sum: 1 },
            sampleImage: { $first: { $arrayElemAt: ["$images", 0] } },
            minPrice: { $min: "$price.amount" },
            maxPrice: { $max: "$price.amount" },
            categories: { $addToSet: "$game.category" },
          },
        },
        { $sort: { listingsCount: -1, _id: 1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            name: "$_id",
            listingsCount: 1,
            sampleImage: 1,
            minPrice: 1,
            maxPrice: 1,
            categories: 1,
          },
        },
      ]);
      return apiResponse.success(
        res,
        { games },
        "Game catalog fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  },
  async updateGame(req, res, next) {
    try {
      const game = await Game.findById(req.params.id);
      if (!game) {
        return apiResponse.failure(res, "Listing not found", 404);
      }
      if (String(game.seller) !== String(req.userId)) {
        return apiResponse.failure(res, "You can only edit your own listings", 403);
      }
      if (req.body.status === "sold") {
        return apiResponse.failure(
          res,
          "Use POST /game/purchase/:id to complete a sale",
          400
        );
      }

      const ct = req.headers["content-type"] || "";
      const isMultipart = ct.includes("multipart/form-data");
      const files = req.files || [];

      if (isMultipart) {
        const removedKeys = [...new Set(req.body.removedImageKeys || [])];
        const allowed = new Set(collectImageKeys(game.images));
        for (const k of removedKeys) {
          if (!allowed.has(k)) {
            return apiResponse.failure(
              res,
              "One or more removedImageKeys do not belong to this listing",
              400
            );
          }
        }
        const removeSet = new Set(removedKeys);
        const filteredImages = (game.images || []).filter((img) => {
          const k = imageKeyForListing(img);
          if (!k) return true;
          return !removeSet.has(k);
        });
        if (filteredImages.length + files.length > 20) {
          return apiResponse.failure(
            res,
            "Maximum 20 images per listing",
            400
          );
        }
        if (filteredImages.length + files.length < 1) {
          return apiResponse.failure(
            res,
            "Listing must have at least one image",
            400
          );
        }

        const newItems =
          files.length > 0
            ? await Promise.all(files.map((file) => uploadToAzure(file)))
            : [];
        if (removedKeys.length) {
          await deleteManyFromAzure(removedKeys);
        }

        const $set = buildListingUpdate(req.body);
        $set.images = [
          ...filteredImages,
          ...newItems.map((r) => ({ url: r.url, key: r.key })),
        ];
        const updated = await Game.findByIdAndUpdate(
          req.params.id,
          { $set },
          { new: true, runValidators: true }
        );
        return apiResponse.success(
          res,
          { game: updated },
          "Game updated successfully",
          200
        );
      }

      const $set = buildListingUpdate(req.body);
      const updated = await Game.findByIdAndUpdate(
        req.params.id,
        { $set },
        { new: true, runValidators: true }
      );
      return apiResponse.success(res, { game: updated }, "Game updated successfully", 200);
    } catch (error) {
      next(error);
    }
  },
  async purchaseListing(req, res, next) {
    try {
      const listing = await Game.findById(req.params.id);
      if (!listing) {
        return apiResponse.failure(res, "Listing not found", 404);
      }
      if (listing.status !== "active") {
        return apiResponse.failure(
          res,
          "Listing is not available for purchase",
          400
        );
      }
      if (String(listing.seller) === String(req.userId)) {
        return apiResponse.failure(
          res,
          "You cannot purchase your own listing",
          400
        );
      }
      const updated = await Game.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            status: "sold",
            buyer: req.userId,
            soldAt: new Date(),
          },
        },
        { new: true, runValidators: true }
      );
      await syncAchievementsForUser(listing.seller);
      await syncAchievementsForUser(req.userId);
      return apiResponse.success(
        res,
        { game: updated },
        "Purchase completed",
        200
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Authenticated seller dashboard: every listing the caller owns, across all
   * statuses (active / pending / sold / removed). Intentionally skips the
   * public "active"-only default in `getGames`.
   */
  async getMyListings(req, res, next) {
    try {
      const { status, page = 1, limit = 20, sort } = req.query;
      const filter = { seller: req.userId };
      if (status) filter.status = status;
      const skip = (page - 1) * limit;
      const [games, total] = await Promise.all([
        Game.find(filter)
          .sort(sortByQuery[sort] || sortByQuery.newest)
          .skip(skip)
          .limit(limit)
          .lean(),
        Game.countDocuments(filter),
      ]);
      return apiResponse.success(
        res,
        { games, page, limit, total },
        "My listings",
        200
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Authenticated buyer history: listings the caller has bought.
   * Populates seller contact because the buyer is entitled to follow up.
   */
  async getMyPurchases(req, res, next) {
    try {
      const { page = 1, limit = 20, sort } = req.query;
      const filter = { buyer: req.userId, status: "sold" };
      const skip = (page - 1) * limit;
      const [games, total] = await Promise.all([
        Game.find(filter)
          .populate({ path: "seller", select: "email phone role lastSeenAt" })
          .sort(sortByQuery[sort] || sortByQuery.newest)
          .skip(skip)
          .limit(limit)
          .lean(),
        Game.countDocuments(filter),
      ]);
      return apiResponse.success(
        res,
        { games, page, limit, total },
        "My purchases",
        200
      );
    } catch (error) {
      next(error);
    }
  },

  async deleteGame(req, res, next) {
    try {
      const game = await Game.findById(req.params.id);
      if (!game) {
        return apiResponse.failure(res, "Listing not found", 404);
      }
      if (String(game.seller) !== String(req.userId)) {
        return apiResponse.failure(res, "You can only delete your own listings", 403);
      }
      await deleteManyFromAzure(collectImageKeys(game.images));
      await Game.findByIdAndDelete(req.params.id);
      return apiResponse.success(
        res,
        { message: "Game deleted successfully" },
        "Game deleted successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = gameController;
