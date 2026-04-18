const mongoose = require("mongoose");
const { ACCOUNT_STATUS, KYC_STATUS } = require("../constants/userStatus");

const knowYourCustomerSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String,
    },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
    nationality: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("KnowYourCustomer", knowYourCustomerSchema);