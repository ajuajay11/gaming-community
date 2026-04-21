const {
  verifyToken,
  apiResponse,
  clearAuthCookies,
  isSessionTokenValid,
} = require("../utils");
const { User } = require("../models");

/**
 * Gate a route behind a valid JWT cookie.
 *
 * When the token is missing, expired, or tampered with, we ALSO clear the
 * `token` + `auth` cookies so the browser stops advertising a phantom
 * session. Without this, the frontend keeps thinking the user is logged in
 * (because the non-httpOnly `auth=true` hint cookie lingers) and loops
 * between protected pages and `/login` until the cookie finally expires.
 */
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      clearAuthCookies(res);
      return apiResponse.failure(res, "Unauthorized, please login again", 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (_verifyErr) {
      // Invalid signature or expired token — wipe both cookies before
      // telling the client so the browser can't keep looping.
      clearAuthCookies(res);
      return apiResponse.failure(res, "Session expired, please login again", 401);
    }

    const user = await User.findById(decoded.userId).select("sessionVersion").lean();
    if (!user || !isSessionTokenValid(decoded, user.sessionVersion)) {
      clearAuthCookies(res);
      return apiResponse.failure(
        res,
        "Session ended — this account signed in elsewhere. Please sign in again.",
        401,
      );
    }

    req.userId = decoded.userId;

    // Refresh "online" status (fire-and-forget; don't block response)
    User.updateOne({ _id: decoded.userId }, { $set: { lastSeenAt: new Date() } }).catch(() => {});

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireAuth;