const { apiResponse } = require("../utils");
const {
  ACHIEVEMENT_DEFINITIONS,
} = require("../constants/achievements");
const {
  getAchievementsPayloadForUser,
  syncAchievementsForUser,
} = require("../services/achievementService");

const achievementController = {
  /** Public catalog of achievement definitions (no user state). */
  async getDefinitions(req, res, next) {
    try {
      return apiResponse.success(
        res,
        { achievements: ACHIEVEMENT_DEFINITIONS },
        "Achievement definitions",
        200
      );
    } catch (err) {
      next(err);
    }
  },

  /** Current user: metrics + per-achievement progress and unlock timestamps. */
  async getMyAchievements(req, res, next) {
    try {
      await syncAchievementsForUser(req.userId);
      const payload = await getAchievementsPayloadForUser(req.userId);
      return apiResponse.success(
        res,
        payload,
        "Achievements loaded",
        200
      );
    } catch (err) {
      next(err);
    }
  },
};

module.exports = achievementController;
