const { apiResponse } = require("../utils");

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
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
  req.query = value;
  next();
};

module.exports = validateQuery;
