const User = require("../models/user");
const { sendError, sendSuccess, sanitizeUser } = require("../utils/http");
const { toInteger, toTrimmedString } = require("../utils/validators");

const allowedThemes = new Set(["light", "dark", "auto"]);

const updatePreferences = async (req, res) => {
  try {
    const {
      fullName,
      age,
      bio,
      avatar,
      theme,
      notifications,
      onboardingComplete,
    } = req.body;

    const user = await User.findById(req.userId).select("-passwordHash");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (!user.profile) user.profile = {};
    if (!user.preferences) user.preferences = {};
    if (!user.notifications) user.notifications = {};

    if (typeof fullName === "string") {
      user.profile.fullName = toTrimmedString(fullName);
    }

    if (age !== undefined && age !== null && age !== "") {
      const parsedAge = toInteger(age);
      if (parsedAge === null) {
        return sendError(res, 400, "Age must be a valid number");
      }
      user.profile.age = parsedAge;
    }

    if (typeof bio === "string") {
      user.profile.bio = toTrimmedString(bio);
    }

    if (typeof avatar === "string") {
      user.profile.avatar = toTrimmedString(avatar);
    }

    if (theme !== undefined && theme !== null && theme !== "") {
      if (!allowedThemes.has(theme)) {
        return sendError(res, 400, "Invalid theme value");
      }
      user.preferences.theme = theme;
    }

    if (notifications && typeof notifications === "object") {
      user.notifications = {
        ...user.notifications,
        ...notifications,
      };
    }

    if (typeof onboardingComplete === "boolean") {
      user.onboardingComplete = onboardingComplete;
    } else {
      user.onboardingComplete = true;
    }

    await user.save();

    return sendSuccess(res, {
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendError(res, 400, error.message);
    }
    return sendError(res, 500, "Server error updating preferences");
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, {
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return sendError(res, 500, "Server error fetching user");
  }
};

module.exports = { updatePreferences, getCurrentUser };
