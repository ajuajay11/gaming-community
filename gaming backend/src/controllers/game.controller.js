const { User, Game } = require("../models");
const { apiResponse } = require("../utils");
const {
  uploadToS3,
  deleteManyFromS3,
  collectImageKeys,
} = require("../services/uploadToS3");
const { syncAchievementsForUser } = require("../services/achievementService");

function buildListingUpdate(body) {
  const $set = {};
  if (body.title !== undefined) $set.title = body.title;
  if (body.description !== undefined) $set.description = body.description;
  if (body.gameName !== undefined) $set["game.name"] = body.gameName;
  if (body.gameCategory !== undefined) $set["game.category"] = body.gameCategory;
  if (body.priceAmount !== undefined) $set["price.amount"] = body.priceAmount;
  if (body.currency !== undefined) $set["price.currency"] = body.currency;
  if (body.negotiable !== undefined) $set["price.negotiable"] = body.negotiable;
  if (body.status !== undefined) $set.status = body.status;
  if (body.details !== undefined) $set.details = body.details;
  return $set;
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
        files.map((file) => uploadToS3(file))
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
      const { status, gameCategory, page, limit, sort } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (gameCategory) filter["game.category"] = gameCategory;

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
      const game = await Game.findById(req.params.id);
      if (!game) {
        return apiResponse.failure(res, "Listing not found", 404);
      }
      return apiResponse.success(res, { game }, "Game fetched successfully", 200);
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

  async deleteGame(req, res, next) {
    try {
      const game = await Game.findById(req.params.id);
      if (!game) {
        return apiResponse.failure(res, "Listing not found", 404);
      }
      if (String(game.seller) !== String(req.userId)) {
        return apiResponse.failure(res, "You can only delete your own listings", 403);
      }
      await deleteManyFromS3(collectImageKeys(game.images));
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
