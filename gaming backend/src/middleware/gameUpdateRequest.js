const { apiResponse } = require("../utils");
const upload = require("./upload");
const { gameValidations } = require("../validations");
const { buildListingUpdate } = require("../utils/gameListingUpdate");

function optionalMultipartGameUpdate(req, res, next) {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    return upload(req, res, next);
  }
  next();
}

function validateGameUpdate(req, res, next) {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    const { error, value } = gameValidations.gameUpdateMultipartSchema.validate(
      req.body,
      { abortEarly: false, stripUnknown: true, convert: true }
    );
    if (error) {
      return apiResponse.failure(
        res,
        "Validation error",
        400,
        error.details.map((d) => d.message)
      );
    }
    if (value.negotiable !== undefined) {
      value.negotiable =
        value.negotiable === true || value.negotiable === "true";
    }
    if (value.priceAmount !== undefined && typeof value.priceAmount === "string") {
      value.priceAmount = Number(value.priceAmount);
    }
    const files = req.files || [];
    const removed = value.removedImageKeys || [];
    const fieldSet = buildListingUpdate(value);
    const hasFieldUpdates = Object.keys(fieldSet).length > 0;
    const hasMediaChange = files.length > 0 || removed.length > 0;
    if (!hasFieldUpdates && !hasMediaChange) {
      return apiResponse.failure(
        res,
        "No changes to apply",
        400,
        ["Provide at least one field to update, new media, or removedImageKeys"]
      );
    }
    req.body = value;
    return next();
  }

  const { error, value } = gameValidations.gameUpdateSchema.validate(req.body, {
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
  req.body = value;
  next();
}

module.exports = {
  optionalMultipartGameUpdate,
  validateGameUpdate,
};
