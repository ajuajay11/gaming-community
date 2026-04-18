const express = require("express");
const { kycController } = require("../controllers");
const { validateRequest, requireAuth } = require("../middleware");
const upload = require("../middleware/upload");
const { kycValidations } = require("../validations");
const router = express.Router();

// normal code 
router.get('/', async (req, res) => {
    try {
        res.status(200).json({ message: "Hello kyc" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post(
  "/",
  requireAuth,
  upload.kycProfile,
  validateRequest(kycValidations.submitKycSchema),
  kycController.createKnowYourCustomer
);
module.exports = router;