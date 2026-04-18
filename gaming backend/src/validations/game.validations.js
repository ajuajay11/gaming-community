const Joi = require("joi");

const PLATFORM = ["PC", "PlayStation", "Xbox", "Mobile", "Cross-platform"];
const GAME_CATEGORY = ["account", "skin", "currency", "item", "boosting"];
const LISTING_STATUS = ["active", "sold", "pending", "removed"];

const mongoIdString = Joi.string().hex().length(24).required();

const detailsSchema = Joi.object({
  platform: Joi.string().valid(...PLATFORM),
  region: Joi.string().max(64).allow(""),
  level: Joi.number().integer().min(0),
  rank: Joi.string().max(128),
  hoursPlayed: Joi.number().min(0),
});

/** Multipart `upload-game`: media files are enforced by multer. */
const gameUploadSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(2000).allow("", null),
  gameName: Joi.string().trim().min(1).max(100).required(),
  gameCategory: Joi.string().valid(...GAME_CATEGORY).required(),
  priceAmount: Joi.number().min(0).required(),
  currency: Joi.string().trim().uppercase().length(3).default("USD"),
  negotiable: Joi.boolean().default(false),
  details: detailsSchema.optional(),
});

/** `GET` list filters + pagination. */
const gameListQuerySchema = Joi.object({
  status: Joi.string().valid(...LISTING_STATUS),
  gameCategory: Joi.string().valid(...GAME_CATEGORY),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string()
    .valid("newest", "oldest", "price_asc", "price_desc")
    .default("newest"),
});

/** `:id` on routes that load a single listing. */
const gameIdParamSchema = Joi.object({
  id: mongoIdString,
});

/** Partial update (JSON body). */
const gameUpdateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100),
  description: Joi.string().trim().max(2000).allow("", null),
  gameName: Joi.string().trim().min(1).max(100),
  gameCategory: Joi.string().valid(...GAME_CATEGORY),
  priceAmount: Joi.number().min(0),
  currency: Joi.string().trim().uppercase().length(3),
  negotiable: Joi.boolean(),
  status: Joi.string().valid(...LISTING_STATUS),
  details: detailsSchema.optional(),
})
  .min(1)
  .messages({ "object.min": "At least one field is required to update" });

module.exports = {
  gameUploadSchema,
  gameListQuerySchema,
  gameIdParamSchema,
  gameUpdateSchema,
};
