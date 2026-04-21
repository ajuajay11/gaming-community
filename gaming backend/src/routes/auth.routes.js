const express = require("express");
const { authController } = require("../controllers");
const { validateRequest, requireAuth } = require("../middleware");
const { authValidations } = require("../validations");
const router = express.Router();

// normal code 
router.get('/', async (req, res) => {
    try {
        res.status(200).json({ message: "Hello auth!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/register', validateRequest(authValidations.registerSchema), authController.register);
router.post('/login', validateRequest(authValidations.loginEmailOrPhoneSchema), authController.loginEmailOrPhone);
router.post('/login-with-otp', validateRequest(authValidations.loginWithOtpSchema), authController.loginWithOtp);
router.post('/reset-password', validateRequest(authValidations.resetPasswordSchema), authController.resetPassword);
router.post('/generate-otp', validateRequest(authValidations.generateOtpSchema), authController.generateOtp);
router.post('/verify-otp', validateRequest(authValidations.verifyOtpSchema), authController.verifyOtp);
router.post('/google-callback', authController.googleCallback);
router.post('/google-complete', authController.googleComplete);
router.get("/me", requireAuth, authController.getMe);
router.post('/session', requireAuth, authController.session);
router.post('/logout', authController.logout);
router.delete(
  '/account',
  requireAuth,
  validateRequest(authValidations.deleteAccountSchema),
  authController.deleteAccount
);
module.exports = router;