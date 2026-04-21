const express = require("express");
const {
  requireAuth,
  optionalAuth,
  requireKyc,
  validateRequest,
  validateParams,
  validateQuery,
  optionalMultipartGameUpdate,
  validateGameUpdate,
} = require("../middleware");
const upload = require("../middleware/upload");
const { gameController } = require("../controllers");
const { gameValidations } = require("../validations");
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    res.status(200).json({ message: "Hello gamers!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  "/upload-game",
  requireAuth,
  requireKyc,
  upload,
  validateRequest(gameValidations.gameUploadSchema),
  gameController.gameUpload
);

// Public: game catalog (distinct game names with counts + sample image).
router.get(
  "/catalog",
  optionalAuth,
  validateQuery(gameValidations.gameCatalogQuerySchema),
  gameController.getCatalog
);

// Public: trending games (aggregated by views + listing count).
router.get(
  "/trending",
  optionalAuth,
  validateQuery(gameValidations.gameCatalogQuerySchema),
  gameController.getTrending
);

// Authed seller dashboard — every listing owned by the caller, all statuses.
router.get(
  "/my-listings",
  requireAuth,
  validateQuery(gameValidations.myListingsQuerySchema),
  gameController.getMyListings
);

// Authed buyer history.
router.get(
  "/my-purchases",
  requireAuth,
  validateQuery(gameValidations.myListingsQuerySchema),
  gameController.getMyPurchases
);

// Public listings feed (filter by gameName / category / search).
router.get(
  "/get-games",
  optionalAuth,
  validateQuery(gameValidations.gameListQuerySchema),
  gameController.getGames
);

router.post(
  "/purchase/:id",
  requireAuth,
  requireKyc,
  validateParams(gameValidations.gameIdParamSchema),
  gameController.purchaseListing
);

// Public listing details — seller contact info is only included for authed callers.
router.get(
  "/get-game/:id",
  optionalAuth,
  validateParams(gameValidations.gameIdParamSchema),
  gameController.getGame
);

router.put(
  "/update-game/:id",
  requireAuth,
  validateParams(gameValidations.gameIdParamSchema),
  optionalMultipartGameUpdate,
  validateGameUpdate,
  gameController.updateGame
);

router.delete(
  "/delete-game/:id",
  requireAuth,
  validateParams(gameValidations.gameIdParamSchema),
  gameController.deleteGame
);

module.exports = router;
