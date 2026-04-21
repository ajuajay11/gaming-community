const { verifyToken, clearAuthCookies, isSessionTokenValid } = require("../utils");
const { User } = require("../models");

/**
 * Optional authentication: if a valid token is present on the request, set
 * `req.userId`. Missing/invalid tokens do NOT short-circuit the request —
 * the handler continues with `req.userId` undefined. Use this on public
 * endpoints that change their response shape for signed-in users (e.g.
 * revealing prices / contact info on listings).
 */
async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return next();
    const decoded = verifyToken(token);
    if (!decoded?.userId) return next();

    const user = await User.findById(decoded.userId).select("sessionVersion").lean();
    if (!user || !isSessionTokenValid(decoded, user.sessionVersion)) {
      clearAuthCookies(res);
      return next();
    }

    req.userId = decoded.userId;
    User.updateOne(
      { _id: decoded.userId },
      { $set: { lastSeenAt: new Date() } },
    ).catch(() => {});
  } catch {
    // swallow invalid/expired tokens — treat as anonymous
  }
  next();
}

module.exports = optionalAuth;
