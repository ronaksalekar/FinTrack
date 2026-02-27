const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  normalizeEmail,
  isValidEmail,
  isNonEmptyString,
  toTrimmedString,
} = require("../utils/validators");
const { sendError, sendSuccess, sanitizeUser } = require("../utils/http");

/* ================= TOKEN HELPER ================= */
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

/* ================= SIGNUP ================= */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const safeName = toTrimmedString(name);

    if (!isNonEmptyString(safeName) || !isNonEmptyString(password) || !isNonEmptyString(normalizedEmail)) {
      return sendError(res, 400, "Please fill all required fields");
    }

    if (!isValidEmail(normalizedEmail)) {
      return sendError(res, 400, "Please provide a valid email");
    }

    if (password.length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return sendError(res, 409, "Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      profile: { fullName: safeName },
    });

    return sendSuccess(
      res,
      {
        success: true,
        token: generateToken(user),
        user: sanitizeUser(user),
      },
      201
    );
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, "Email already registered");
    }

    return sendError(res, 500, "Server error during signup");
  }
};

/* ================= LOGIN ================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!isNonEmptyString(normalizedEmail) || !isNonEmptyString(password)) {
      return sendError(res, 400, "Please fill all required fields");
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return sendError(res, 401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return sendError(res, 401, "Invalid credentials");
    }

    user.lastLogin = Date.now();
    await user.save();

    return sendSuccess(res, {
      success: true,
      token: generateToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return sendError(res, 500, "Server error during login");
  }
};

/* ================= GET USER ================= */
const getUser = async (req, res) => {
  try {
    if (!req.userId) {
      return sendError(res, 401, "Not authorized");
    }

    const user = await User.findById(req.userId).select("-passwordHash -recoveryKeyHash");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, { success: true, user: sanitizeUser(user) });
  } catch (error) {
    return sendError(res, 500, "Server error");
  }
};

/* ================= VALIDATE TOKEN ================= */
const validateToken = async (req, res) => {
  return sendSuccess(res, {
    valid: true,
    user: sanitizeUser(req.user),
  });
};

/* ================= RECOVER ACCOUNT (TEMP PLACEHOLDER) ================= */
const recoverAccount = async (req, res) => {
  return sendError(res, 501, "Recovery flow not implemented yet");
};

module.exports = {
  signup,
  login,
  getUser,
  validateToken,
  recoverAccount,
};
