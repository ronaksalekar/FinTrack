const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  updatePreferences,
  getCurrentUser,
} = require("../controllers/userController");

router.use(protect);
router.get("/me", getCurrentUser);
router.put("/preferences", updatePreferences);

module.exports = router;
