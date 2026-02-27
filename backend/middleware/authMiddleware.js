const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendError } = require("../utils/http");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return sendError(res, 401, "Not authorized, token missing");
    }

    if (!process.env.JWT_SECRET) {
      return sendError(res, 500, "JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.userEmail = decoded.email;

    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return sendError(res, 401, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, "Invalid or expired token");
  }
};

module.exports = { protect };
