const Joi = require("joi");

/** Profile picture is uploaded as multipart field `profilePicture` (multer), not in JSON body. */
const submitKycSchema = Joi.object({
  fullName: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  gender: Joi.string().required(),
  nationality: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
  country: Joi.string().required(),
});

module.exports = {
  submitKycSchema,
};
