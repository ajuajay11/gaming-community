const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Keep JWT lifetime and cookie maxAge in lockstep so the `auth` hint cookie
// never outlives its signing token (otherwise the frontend middleware will
// redirect users away from /login even though the backend rejects them).
const SESSION_TTL_SECONDS = 60 * 60; // 1 hour
const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;

/**
 * JWT `sv` must match User.sessionVersion (except legacy tokens: no `sv` and version 0).
 */
function isSessionTokenValid(decoded, dbSessionVersion) {
  const dbSv = dbSessionVersion ?? 0;
  const tokenSv = decoded.sv;
  if (tokenSv === dbSv) return true;
  if (tokenSv === undefined && dbSv === 0) return true;
  return false;
}

async function setAuthCookie(res, userId, role) {
  const updated = await User.findByIdAndUpdate(
    userId,
    { $inc: { sessionVersion: 1 } },
    { new: true, select: "sessionVersion" },
  );
  const sv = updated?.sessionVersion ?? 1;

  const token = jwt.sign(
    { userId, role, sv },
    process.env.JWT_SECRET,
    { expiresIn: SESSION_TTL_SECONDS }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS,
  });

  res.cookie("auth", "true", {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS,
  });
  return token;
}
function verifyToken(token, options = {}) {
  if (!token) throw new Error("Unauthorized");
  return jwt.verify(token, process.env.JWT_SECRET, options);
}

const cookieBase = {
  path: "/",
  sameSite: "lax",
};

function clearAuthCookies(res) {
  res.clearCookie("token", { ...cookieBase, httpOnly: true });
  res.clearCookie("auth", { ...cookieBase, httpOnly: false });
}

module.exports = { setAuthCookie, verifyToken, clearAuthCookies, isSessionTokenValid };