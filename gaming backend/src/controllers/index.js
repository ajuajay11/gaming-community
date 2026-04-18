// Export controllers here, e.g.
// module.exports.authController = require("./auth.controller");

module.exports = {
  authController: require("./auth.controller"),
  profileController: require("./profile.controller"),
  kycController: require("./kyc.controller"),
  gameController: require("./game.controller"),
  achievementController: require("./achievement.controller"),
};