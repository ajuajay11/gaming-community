const express = require("express");
const { profileController } = require("../controllers");
const { requireAuth, validateRequest, validateParams } = require("../middleware");
const { profileValidations } = require("../validations");

const router = express.Router();

router.get("/", requireAuth, profileController.getMyProfile);
router.patch(
  "/",
  requireAuth,
  validateRequest(profileValidations.updateProfileSchema),
  profileController.updateProfile
);
router.get(
  "/:userId",
  validateParams(profileValidations.publicProfileParamSchema),
  profileController.getPublicProfile
);

module.exports = router;
