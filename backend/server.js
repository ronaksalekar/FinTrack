const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toBoolean = (value, fallback) => {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === "true";
};

/* ================= SECURITY ================= */
app.use(helmet());

/* ================= BODY PARSER ================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ================= CORS ================= */
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin denied"));
    },
    credentials: true,
  })
);

/* ================= RATE LIMIT ================= */
const apiWindowMs = toPositiveInt(process.env.API_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const apiMax = toPositiveInt(process.env.API_RATE_LIMIT_MAX, isProduction ? 100 : 1000);
const authWindowMs = toPositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const authMax = toPositiveInt(process.env.AUTH_RATE_LIMIT_MAX, isProduction ? 10 : 200);
const authRateLimitEnabled = toBoolean(process.env.AUTH_RATE_LIMIT_ENABLED, isProduction);

const apiLimiter = rateLimit({
  windowMs: apiWindowMs,
  max: apiMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    const resetTime = req.rateLimit?.resetTime
      ? new Date(req.rateLimit.resetTime).getTime()
      : Date.now() + options.windowMs;

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((resetTime - Date.now()) / 1000)
    );

    res.set("Retry-After", String(retryAfterSeconds));
    return res.status(options.statusCode).json({
      success: false,
      message: "Too many API requests. Please try again shortly.",
      retryAfterSeconds,
    });
  },
});

const authLimiter = rateLimit({
  windowMs: authWindowMs,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res, _next, options) => {
    const resetTime = req.rateLimit?.resetTime
      ? new Date(req.rateLimit.resetTime).getTime()
      : Date.now() + options.windowMs;

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((resetTime - Date.now()) / 1000)
    );

    res.set("Retry-After", String(retryAfterSeconds));
    return res.status(options.statusCode).json({
      success: false,
      message: "Too many login attempts. Please try again later.",
      retryAfterSeconds,
    });
  },
});

if (authRateLimitEnabled) {
  app.use("/api/auth", authLimiter);
}

/* ================= ROUTES ================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/data", apiLimiter, require("./routes/dataRoutes"));
app.use("/api/user", apiLimiter, userRoutes);

/* ================= HEALTH CHECK ================= */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (!isProduction) {
    console.error("Server error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();

