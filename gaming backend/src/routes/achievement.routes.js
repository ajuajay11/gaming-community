const express = require("express");
const { achievementController } = require("../controllers");
const { requireAuth } = require("../middleware");

const router = express.Router();

router.get("/definitions", achievementController.getDefinitions);
router.get("/me", requireAuth, achievementController.getMyAchievements);

module.exports = router;
