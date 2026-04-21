const { User } = require("../models");
const { apiResponse } = require("../utils");
const KnowYourCustomer = require("../models/KnowYourCustomer");
const { KYC_STATUS } = require("../constants/userStatus");
const { uploadToAzure } = require("../services/azureBlob");

const kycController = {
  async createKnowYourCustomer(req, res, next) {
    try {
      if (!req.file) {
        return apiResponse.failure(res, "Profile picture is required", 400);
      }
      const profilePicture = await uploadToAzure(req.file);

      const user = await User.findById(req.userId);
      if (!user) {
        return apiResponse.failure(res, "User not found", 404);
      }

      const existing = await KnowYourCustomer.findOne({ user: req.userId });
      if (existing) {
        return apiResponse.failure(res, "KYC already submitted", 409);
      }

      const kyc = await KnowYourCustomer.create({
        user: req.userId,
        profilePicture: profilePicture.url,
        fullName: req.body.fullName,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        nationality: req.body.nationality,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country,
      });

      await User.findOneAndUpdate(
        { _id: req.userId },
        { $set: { kycStatus: KYC_STATUS.APPROVED } }
      );

      return apiResponse.success(res, { kyc }, "KYC verified successfully", 201);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = kycController;
