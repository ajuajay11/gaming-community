const mongoose = require("mongoose");

/**
 * Public / social profile — display fields only.
 * Legal identity (name, DOB, address, etc.) lives on KnowYourCustomer (KYC), not here.
 */
const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    /** Public avatar (e.g. S3 URL). Separate from KYC profile photo. */
    avatarUrl: { type: String },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    /** Optional public handle (unique when set). */
    username: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true,
      match: /^[a-z0-9_]{3,32}$/,
    },
    locale: { type: String, trim: true, maxlength: 10, default: "en" },
    /**
     * Public WhatsApp number for buyers (E.164-ish: optional +, then digits).
     * Shown on listings only to viewers who completed KYC.
     */
    whatsapp: {
      type: String,
      trim: true,
      sparse: true,
      match: /^\+?[1-9]\d{1,14}$/,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
