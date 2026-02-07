const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    // Add these new fields
    profile: {
      fullName: {
        type: String,
        default: ''
      },
      age: {
        type: Number,
        min: 13,
        max: 120
      },

      bio: {
        type: String,
        default: ''
      },
      avatar: {
        type: String,
        default: ''
      }
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light'
      },
    },
    notifications: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      pushNotifications: {
        type: Boolean,
        default: true
      },
      budgetAlerts: {
        type: Boolean,
        default: true
      },
      weeklyReports: {
        type: Boolean,
        default: false
      },
      transactionAlerts: {
        type: Boolean,
        default: true
      }
    },
    onboardingComplete: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;