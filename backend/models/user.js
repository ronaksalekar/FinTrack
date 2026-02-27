const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    /* ================= AUTH ================= */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    recoveryKeyHash: {
      type: String,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },

    /* ================= PROFILE ================= */
    profile: {
      fullName: {
        type: String,
        default: "",
        trim: true,
        maxlength: 80,
      },
      age: {
        type: Number,
        min: 13,
        max: 120,
      },
      bio: {
        type: String,
        default: "",
        trim: true,
        maxlength: 300,
      },
      avatar: {
        type: String,
        default: "",
        trim: true,
      },
    },

    /* ================= PREFERENCES ================= */
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
      },
    },

    /* ================= NOTIFICATIONS ================= */
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: false },
      transactionAlerts: { type: Boolean, default: true },
    },

    onboardingComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
