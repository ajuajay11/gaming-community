const { apiResponse } = require("../utils");

const validateParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return apiResponse.failure(
      res,
      "Validation error",
      400,
      error.details.map((d) => d.message)
    );
  }
  req.params = value;
  next();
};

module.exports = validateParams;
