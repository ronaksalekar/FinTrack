const express = require("express");
const router = express.Router();

const {
  getUserData,
  createData,
  updateData,
  deleteData,
  bulkCreateData,
  deleteAllUserData,
} = require("../controllers/dataControllers");

const { protect } = require("../middleware/authMiddleware");
// const validateObjectId = require("../middleware/validateObjectId");

/* ================= PROTECTED ROUTES ================= */
router.use(protect);

/* ========= BULK CREATE ========= */
router.post("/bulk", bulkCreateData);

/* ========= BASE ROUTES ========= */
router.route("/")
  .get(getUserData)
  .post(createData)
  .delete(deleteAllUserData);

/* ========= SINGLE ITEM ========= */
router.route("/:id")
  // .all(validateObjectId)
  .put(updateData)
  .delete(deleteData);

module.exports = router;
