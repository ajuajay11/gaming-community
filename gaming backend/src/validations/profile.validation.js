const Joi = require("joi");

const mongoIdString = Joi.string().hex().length(24).required();

const updateProfileSchema = Joi.object({
  displayName: Joi.string().trim().max(80).allow("", null),
  bio: Joi.string().trim().max(500).allow("", null),
  avatarUrl: Joi.string().uri().allow("", null),
  username: Joi.string().pattern(/^[a-z0-9_]{3,32}$/),
  locale: Joi.string().trim().max(10),
})
  .min(1)
  .messages({ "object.min": "At least one field is required" });

const publicProfileParamSchema = Joi.object({
  userId: mongoIdString,
});

module.exports = {
  updateProfileSchema,
  publicProfileParamSchema,
};
