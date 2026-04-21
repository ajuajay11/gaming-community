const { User } = require("../models");
const { apiResponse } = require("../utils");
const { KYC_STATUS } = require("../constants/userStatus");

/**
 * Gate for actions that require a completed, approved KYC record (creating
 * listings, accepting payouts, etc). MUST run after `requireAuth` so that
 * `req.userId` is populated.
 *
 * Response codes:
 *   - 401 when `req.userId` is missing (auth ordering bug).
 *   - 403 when the user has no pending/approved KYC on file.
 *   - 202 (`message: "KYC under review"`) when a submission is pending.
 *   - 410 (`message: "KYC rejected"`) when a previous submission was rejected.
 */
async function requireKyc(req, res, next) {
  try {
    if (!req.userId) {
      return apiResponse.failure(res, "Unauthorized please login again", 401);
    }
    const user = await User.findById(req.userId).select("kycStatus");
    if (!user) {
      return apiResponse.failure(res, "User not found", 404);
    }

    switch (Number(user.kycStatus)) {
      case KYC_STATUS.APPROVED:
        return next();
      case KYC_STATUS.PENDING:
        return apiResponse.failure(
          res,
          "Your KYC is under review. You can create listings once it's approved.",
          403,
          [{ code: "KYC_PENDING" }],
        );
      case KYC_STATUS.REJECTED:
        return apiResponse.failure(
          res,
          "Your KYC was rejected. Please contact support before trying again.",
          403,
          [{ code: "KYC_REJECTED" }],
        );
      case KYC_STATUS.NOT_SUBMITTED:
      default:
        return apiResponse.failure(
          res,
          "Please complete KYC before creating a listing.",
          403,
          [{ code: "KYC_REQUIRED" }],
        );
    }
  } catch (err) {
    next(err);
  }
}

module.exports = requireKyc;
