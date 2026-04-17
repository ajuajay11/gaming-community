const express = require("express");
// const { authController } = require("../controllers");
// const { validateRequest, requireAuth } = require("../middleware");
// const { authValidations } = require("../validations");
 const router = express.Router();

// normal code 
router.get('/register', async (req, res) => {
    try {
        res.status(200).json({ message: "Hello World" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// using controller
// router.get('/fetch-user', requireAuth, authController.fetchUser);
 
module.exports = router;