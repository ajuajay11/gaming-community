const { Game, UserAchievement } = require("../models");
const { ACHIEVEMENT_DEFINITIONS } = require("../constants/achievements");

async function getMetrics(userId) {
  const id = userId;
  const [listings_created, sales, purchases] = await Promise.all([
    Game.countDocuments({ seller: id }),
    Game.countDocuments({ seller: id, status: "sold" }),
    Game.countDocuments({ buyer: id, status: "sold" }),
  ]);
  return { listings_created, sales, purchases };
}

function metricValueForDefinition(metrics, def) {
  return metrics[def.metric] ?? 0;
}

/**
 * Insert unlock rows for any definitions whose threshold is now met.
 */
async function syncAchievementsForUser(userId) {
  const metrics = await getMetrics(userId);
  const ops = [];
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    const value = metricValueForDefinition(metrics, def);
    if (value >= def.threshold) {
      ops.push(
        UserAchievement.updateOne(
          { user: userId, achievementKey: def.key },
          { $setOnInsert: { unlockedAt: new Date() } },
          { upsert: true }
        )
      );
    }
  }
  await Promise.all(ops);
  return getMetrics(userId);
}

/**
 * Build response payload: definitions + unlock status + progress toward each metric.
 */
async function getAchievementsPayloadForUser(userId) {
  const metrics = await getMetrics(userId);
  const unlocked = await UserAchievement.find({ user: userId }).lean();
  const unlockedMap = new Map(
    unlocked.map((u) => [u.achievementKey, u.unlockedAt])
  );

  const items = ACHIEVEMENT_DEFINITIONS.map((def) => {
    const current = metricValueForDefinition(metrics, def);
    const isUnlocked = current >= def.threshold;
    const unlockedAt = unlockedMap.get(def.key) || null;
    return {
      key: def.key,
      title: def.title,
      description: def.description,
      role: def.role,
      metric: def.metric,
      threshold: def.threshold,
      progress: {
        current,
        target: def.threshold,
      },
      unlocked: isUnlocked,
      unlockedAt,
    };
  });

  return { metrics, achievements: items };
}

module.exports = {
  getMetrics,
  syncAchievementsForUser,
  getAchievementsPayloadForUser,
};
