 const requireAuth = require("./auth");
require("dotenv").config();

module.exports = {
  validateRequest: require("./validateRequest"),
  validateParams: require("./validateParams"),
  validateQuery: require("./validateQuery"),
  requireAuth: requireAuth,
  uploadMiddleware: require("./upload"),
};
