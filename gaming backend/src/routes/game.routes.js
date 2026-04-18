const express = require("express");
const {
  requireAuth,
  validateRequest,
  validateParams,
  validateQuery,
} = require("../middleware");
const upload = require("../middleware/upload");
const { gameController } = require("../controllers");
const { gameValidations } = require("../validations");
const router = express.Router();

// normal code 
router.get('/', async (req, res) => {
    try {
        res.status(200).json({ message: "Hello gamers!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post(
  "/upload-game",
  requireAuth,
  upload,
  validateRequest(gameValidations.gameUploadSchema),
  gameController.gameUpload
);

router.get(
  "/get-games",
  requireAuth,
  validateQuery(gameValidations.gameListQuerySchema),
  gameController.getGames
);

router.post(
  "/purchase/:id",
  requireAuth,
  validateParams(gameValidations.gameIdParamSchema),
  gameController.purchaseListing
);

router.get(
  "/get-game/:id",
  requireAuth,
  validateParams(gameValidations.gameIdParamSchema),
  gameController.getGame
);

router.put(
  "/update-game/:id",
  requireAuth,
  validateParams(gameValidations.gameIdParamSchema),
  validateRequest(gameValidations.gameUpdateSchema),
  gameController.updateGame
);

router.delete(
  "/delete-game/:id",
  requireAuth,
  validateParams(gameValidations.gameIdParamSchema),
  gameController.deleteGame
);
 
module.exports = router;