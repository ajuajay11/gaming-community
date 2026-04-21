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

/**
 * Multipart upload-only: because `multipart/form-data` serializes every field
 * as a string, browsers send `details` as `JSON.stringify({...})`. Accept both
 * the raw object (JSON API callers) and the stringified form (multipart) and
 * collapse them into a parsed object before the rest of Joi runs.
 */
const detailsFromMultipart = Joi.alternatives()
  .try(
    detailsSchema,
    Joi.string()
      .allow("")
      .custom((value, helpers) => {
        if (!value) return undefined;
        let parsed;
        try {
          parsed = JSON.parse(value);
        } catch {
          return helpers.error("any.invalid");
        }
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          return helpers.error("any.invalid");
        }
        const { error, value: v } = detailsSchema.validate(parsed, {
          stripUnknown: true,
        });
        if (error) return helpers.error("any.invalid");
        return v;
      }, "details-json-string"),
  )
  .messages({ "alternatives.match": '"details" must be an object or JSON string' });

/** Multipart `upload-game`: media files are enforced by multer. */
const gameUploadSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(2000).allow("", null),
  gameName: Joi.string().trim().min(1).max(100).required(),
  gameCategory: Joi.string().valid(...GAME_CATEGORY).required(),
  priceAmount: Joi.number().min(0).required(),
  currency: Joi.string().trim().uppercase().length(3).default("USD"),
  negotiable: Joi.boolean().default(false),
  details: detailsFromMultipart.optional(),
});

/** `GET` list filters + pagination. */
const gameListQuerySchema = Joi.object({
  status: Joi.string().valid(...LISTING_STATUS),
  gameCategory: Joi.string().valid(...GAME_CATEGORY),
  gameName: Joi.string().trim().min(1).max(100),
  search: Joi.string().trim().min(1).max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string()
    .valid("newest", "oldest", "price_asc", "price_desc")
    .default("newest"),
});

/** `GET /my-listings` — all statuses for the authed seller. */
const myListingsQuerySchema = Joi.object({
  status: Joi.string().valid(...LISTING_STATUS),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string()
    .valid("newest", "oldest", "price_asc", "price_desc")
    .default("newest"),
});

/** `GET /trending` and `/catalog` query. */
const gameCatalogQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(12),
  search: Joi.string().trim().min(1).max(100),
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

const removedKeysFromMultipart = Joi.alternatives()
  .try(
    Joi.array().items(Joi.string().trim().min(1)),
    Joi.string().allow("").custom((value, helpers) => {
      if (!value || value.trim() === "") return [];
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch {
        return helpers.error("any.invalid");
      }
      if (!Array.isArray(parsed) || !parsed.every((x) => typeof x === "string")) {
        return helpers.error("any.invalid");
      }
      return parsed;
    }, "removedImageKeys-json"),
  )
  .default([]);

/** Multipart `PUT update-game` — same string coercion patterns as upload. */
const gameUpdateMultipartSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100),
  description: Joi.string().trim().max(2000).allow("", null),
  gameName: Joi.string().trim().min(1).max(100),
  gameCategory: Joi.string().valid(...GAME_CATEGORY),
  priceAmount: Joi.alternatives()
    .try(Joi.number().min(0), Joi.string().regex(/^\d+(\.\d+)?$/))
    .optional(),
  currency: Joi.string().trim().uppercase().length(3),
  negotiable: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid("true", "false"),
  ),
  status: Joi.string().valid(...LISTING_STATUS),
  details: detailsFromMultipart.optional(),
  removedImageKeys: removedKeysFromMultipart,
}).unknown(true);

module.exports = {
  gameUploadSchema,
  gameListQuerySchema,
  myListingsQuerySchema,
  gameCatalogQuerySchema,
  gameIdParamSchema,
  gameUpdateSchema,
  gameUpdateMultipartSchema,
};
