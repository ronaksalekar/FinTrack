const mongoose = require("mongoose");

const encryptedDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    dataType: {
      type: String,
      enum: ["transaction", "budget", "settings", "category"],
      required: true,
      index: true,
    },

    encryptedData: {
      type: String,
      required: true,
      trim: true,
    },

    encryptedTimestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    dataHash: {
      type: String,
      index: true,
    },

    encryptionVersion: {
      type: Number,
      default: 1,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound indexes
encryptedDataSchema.index({ userId: 1, dataType: 1, encryptedTimestamp: -1 });
encryptedDataSchema.index({ userId: 1, encryptedTimestamp: -1 });
encryptedDataSchema.index({ userId: 1, isDeleted: 1, dataType: 1 });

module.exports = mongoose.model("EncryptedData", encryptedDataSchema);
