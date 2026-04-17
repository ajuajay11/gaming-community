const mongoose = require("mongoose");

const dbConnect = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Set it in .env");
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10_000,
    });
    console.log("db connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err; // must throw so server does not start without DB
  }
};
module.exports = dbConnect;