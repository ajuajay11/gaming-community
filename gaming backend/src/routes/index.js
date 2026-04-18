const express = require("express");
const authRoutes = require("./auth.routes");
const profileRoutes = require("./profile.routes");
const kycRoutes = require("./kyc.routes");
const gameRoutes = require("./game.routes");
const achievementRoutes = require("./achievement.routes");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/kyc", kycRoutes);
router.use("/game", gameRoutes);
router.use("/achievements", achievementRoutes);
module.exports = router;