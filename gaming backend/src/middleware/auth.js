const { verifyToken, apiResponse } = require("../utils");
const { User } = require("../models");
 
async function requireAuth(req, res, next) {
  try {
    console.log("requireAuth", req.cookies);
    const token = req.cookies?.token;
    if (!token) {
        return apiResponse.failure(res, "Unauthorized please login again", 401);
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;

    // Refresh "online" status (fire-and-forget; don't block response)
    User.updateOne({ _id: decoded.userId }, { $set: { lastSeenAt: new Date() } }).catch(() => {});

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireAuth;