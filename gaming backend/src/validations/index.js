// Export request validation schemas here, e.g.
// module.exports.authValidations = require("./auth.validations");

module.exports = {
  authValidations: require("./auth.validation"),
  profileValidations: require("./profile.validation"),
  kycValidations: require("./kyc.validation"),
  gameValidations: require("./game.validations"),
};