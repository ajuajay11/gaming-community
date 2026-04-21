 const requireAuth = require("./auth");
const optionalAuth = require("./optionalAuth");
require("dotenv").config();

module.exports = {
  validateRequest: require("./validateRequest"),
  validateParams: require("./validateParams"),
  validateQuery: require("./validateQuery"),
  requireAuth: requireAuth,
  optionalAuth: optionalAuth,
  requireKyc: require("./requireKyc"),
  uploadMiddleware: require("./upload"),
  optionalMultipartGameUpdate: require("./gameUpdateRequest").optionalMultipartGameUpdate,
  validateGameUpdate: require("./gameUpdateRequest").validateGameUpdate,
};
