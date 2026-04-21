const express = require("express");
const { profileController } = require("../controllers");
const { requireAuth, validateRequest, validateParams } = require("../middleware");
const upload = require("../middleware/upload");
const { profileValidations } = require("../validations");

const router = express.Router();

router.get("/", requireAuth, profileController.getMyProfile);
router.post(
  "/avatar",
  requireAuth,
  upload.profileAvatar,
  profileController.uploadAvatar
);
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
