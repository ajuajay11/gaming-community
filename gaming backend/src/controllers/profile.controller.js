const { User, Profile } = require("../models");
const { apiResponse } = require("../utils");

/** KYC status codes — surface summary only, not legal fields (those stay on KYC record). */
function kycSummaryFromUser(kycStatus) {
  return { kycStatus: kycStatus ?? 0 };
}

const profileController = {
  /**
   * Current user’s profile + lightweight KYC summary (no duplicate identity fields).
   */
  async getMyProfile(req, res, next) {
    try {
      const user = await User.findById(req.userId).select(
        "email phone role status kycStatus emailVerifiedAt phoneVerifiedAt createdAt"
      );
      if (!user) {
        return apiResponse.failure(res, "User not found", 404);
      }

      let profile = await Profile.findOne({ user: req.userId }).lean();
      if (!profile) {
        profile = await Profile.create({ user: req.userId }).then((p) => p.toObject());
      }

      return apiResponse.success(
        res,
        {
          user: {
            id: user._id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            emailVerifiedAt: user.emailVerifiedAt,
            phoneVerifiedAt: user.phoneVerifiedAt,
            createdAt: user.createdAt,
          },
          kycSummary: kycSummaryFromUser(user.kycStatus),
          profile: {
            displayName: profile.displayName,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            username: profile.username,
            locale: profile.locale,
            updatedAt: profile.updatedAt,
          },
        },
        "Profile loaded",
        200
      );
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return apiResponse.failure(res, "User not found", 404);
      }

      const body = { ...req.body };
      if (body.username !== undefined) {
        const taken = await Profile.findOne({
          username: body.username,
          user: { $ne: req.userId },
        });
        if (taken) {
          return apiResponse.failure(res, "Username already taken", 409);
        }
      }

      const profile = await Profile.findOneAndUpdate(
        { user: req.userId },
        { $set: body },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );

      return apiResponse.success(
        res,
        {
          profile: {
            displayName: profile.displayName,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            username: profile.username,
            locale: profile.locale,
            updatedAt: profile.updatedAt,
          },
        },
        "Profile updated",
        200
      );
    } catch (err) {
      if (err.code === 11000) {
        return apiResponse.failure(res, "Username already taken", 409);
      }
      next(err);
    }
  },

  /**
   * Another user’s public profile (no email/phone).
   */
  async getPublicProfile(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).select("role status kycStatus createdAt");
      if (!user) {
        return apiResponse.failure(res, "User not found", 404);
      }

      const profile = await Profile.findOne({ user: userId }).lean();

      return apiResponse.success(
        res,
        {
          user: {
            id: user._id,
            role: user.role,
            createdAt: user.createdAt,
          },
          kycSummary: kycSummaryFromUser(user.kycStatus),
          profile: profile
            ? {
                displayName: profile.displayName,
                bio: profile.bio,
                avatarUrl: profile.avatarUrl,
                username: profile.username,
              }
            : null,
        },
        "Public profile",
        200
      );
    } catch (err) {
      next(err);
    }
  },
};

module.exports = profileController;
