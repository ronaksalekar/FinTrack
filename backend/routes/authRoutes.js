const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

/* ========= PUBLIC ROUTES ========= */
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/recover", authController.recoverAccount);

/* ========= PROTECTED ROUTES ========= */
router.get("/me", protect, authController.getUser);
router.get("/validate", protect, authController.validateToken);

module.exports = router;
