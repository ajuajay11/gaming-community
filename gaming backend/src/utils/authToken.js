const jwt = require("jsonwebtoken");

function setAuthCookie(res, userId, role) {
  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie("auth", "true", {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
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

module.exports = { setAuthCookie, verifyToken, clearAuthCookies };