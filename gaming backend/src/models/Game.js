const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    game: {
        name: { type: String, required: true },        // "Valorant", "CS2", "Fortnite"
        category: {
            type: String,
            enum: ["account", "skin", "currency", "item", "boosting"],
            required: true,
        },
    },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 2000 },
    price: {
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "USD" },
        negotiable: { type: Boolean, default: false },
    },
    /** S3 media: `{ url, key }` (preferred) or legacy URL string. */
    images: [{ type: mongoose.Schema.Types.Mixed }],
    details: {
        platform: {
            type: String,
            enum: ["PC", "PlayStation", "Xbox", "Mobile", "Cross-platform"],
        },
        region: { type: String },                      // "NA", "EU", "Asia" etc.
        level: { type: Number },                       // for accounts
        rank: { type: String },                        // "Diamond", "Global Elite" etc.
        hoursPlayed: { type: Number },
    },
    status: {
        type: String,
        enum: ["active", "sold", "pending", "removed"],
        default: "active",
    },
    /** Set when status becomes `sold` (buyer completes purchase). */
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    soldAt: { type: Date, default: null },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },     // for Pro subscribers — priority placement
}, { timestamps: true });

// search by game name or title
listingSchema.index({ "game.name": 1 });
listingSchema.index({ "game.category": 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ seller: 1 });
listingSchema.index({ buyer: 1, status: 1 });

module.exports = mongoose.model("Listing", listingSchema);