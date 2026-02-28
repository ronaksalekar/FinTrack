const EncryptedData = require("../models/encryptedData");
const { sendError, sendSuccess } = require("../utils/http");
const { isObjectId, toDateOrNull } = require("../utils/validators");

const VALID_DATA_TYPES = new Set([
  "transaction",
  "budget",
  "settings",
  "category",
]);

/* ================= GET USER DATA ================= */
const getUserData = async (req, res) => {
  try {
    const { dataType, limit = 50, skip = 0 } = req.query;
    const parsedLimit = Number.parseInt(limit, 10);
    const parsedSkip = Number.parseInt(skip, 10);

    const safeLimit = Number.isNaN(parsedLimit)
      ? 50
      : Math.min(Math.max(parsedLimit, 1), 200);
    const safeSkip = Number.isNaN(parsedSkip) ? 0 : Math.max(parsedSkip, 0);

    const query = {
      userId: req.user._id,
      isDeleted: false,
    };

    if (dataType) {
      if (!VALID_DATA_TYPES.has(dataType)) {
        return sendError(res, 400, "Invalid data type filter");
      }
      query.dataType = dataType;
    }

    const data = await EncryptedData.find(query)
      .sort({ encryptedTimestamp: -1 })
      .limit(safeLimit)
      .skip(safeSkip);

    return sendSuccess(res, {
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return sendError(res, 500, "Server error fetching data");
  }
};

/* ================= CREATE DATA ================= */
const createData = async (req, res) => {
  try {
    const { dataType, encryptedData, encryptedTimestamp, dataHash } = req.body;

    if (!VALID_DATA_TYPES.has(dataType)) {
      return sendError(res, 400, "Invalid dataType");
    }

    if (typeof encryptedData !== "string" || encryptedData.trim() === "") {
      return sendError(res, 400, "encryptedData is required");
    }

    const parsedTimestamp = toDateOrNull(encryptedTimestamp);

    if (encryptedTimestamp && !parsedTimestamp) {
      return sendError(res, 400, "Invalid encryptedTimestamp value");
    }

    const newData = await EncryptedData.create({
      userId: req.user._id,
      dataType,
      encryptedData,
      encryptedTimestamp: parsedTimestamp || new Date(),
      dataHash,
    });

    return sendSuccess(res, { success: true, data: newData }, 201);
  } catch (error) {
    return sendError(res, 500, "Server error creating data");
  }
};

/* ================= UPDATE DATA ================= */
const updateData = async (req, res) => {
  try {
    const { encryptedData, encryptedTimestamp } = req.body;
    const { id } = req.params;

    if (!isObjectId(id)) {
      return sendError(res, 400, "Invalid data id");
    }

    if (!encryptedData && !encryptedTimestamp) {
      return sendError(res, 400, "Nothing to update");
    }

    const safeTimestamp = encryptedTimestamp
      ? toDateOrNull(encryptedTimestamp)
      : null;

    if (encryptedTimestamp && !safeTimestamp) {
      return sendError(res, 400, "Invalid encryptedTimestamp value");
    }

    const data = await EncryptedData.findOne({
      _id: id,
      userId: req.user._id,
      isDeleted: false,
    });

    if (!data) {
      return sendError(res, 404, "Data not found");
    }

    if (encryptedData) {
      if (typeof encryptedData !== "string" || encryptedData.trim() === "") {
        return sendError(res, 400, "encryptedData must be a non-empty string");
      }
      data.encryptedData = encryptedData;
    }

    if (safeTimestamp) data.encryptedTimestamp = safeTimestamp;

    await data.save();

    return sendSuccess(res, { success: true, data });
  } catch (error) {
    return sendError(res, 500, "Server error updating data");
  }
};

/* ================= SOFT DELETE ================= */
const deleteData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isObjectId(id)) {
      return sendError(res, 400, "Invalid data id");
    }

    const data = await EncryptedData.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!data) {
      return sendError(res, 404, "Data not found");
    }

    data.isDeleted = true;
    await data.save();

    return sendSuccess(res, { success: true, message: "Data deleted" });
  } catch (error) {
    return sendError(res, 500, "Server error deleting data");
  }
};

/* ================= BULK CREATE ================= */
const bulkCreateData = async (req, res) => {
  try {
    const { dataItems } = req.body;

    if (!Array.isArray(dataItems) || dataItems.length === 0) {
      return sendError(res, 400, "Invalid bulk payload");
    }

    if (dataItems.length > 1000) {
      return sendError(res, 400, "Bulk payload too large");
    }

    const bulkData = [];

    for (const item of dataItems) {
      if (!VALID_DATA_TYPES.has(item.dataType)) {
        return sendError(res, 400, "Invalid dataType in bulk payload");
      }

      if (typeof item.encryptedData !== "string" || item.encryptedData.trim() === "") {
        return sendError(res, 400, "Each data item must contain encryptedData");
      }

      const safeTimestamp = toDateOrNull(item.encryptedTimestamp || item.timestamp) || new Date();

      bulkData.push({
        userId: req.user._id,
        dataType: item.dataType,
        encryptedData: item.encryptedData,
        encryptedTimestamp: safeTimestamp,
        dataHash: item.dataHash,
      });
    }

    const created = await EncryptedData.insertMany(bulkData);

    return sendSuccess(
      res,
      {
        success: true,
        count: created.length,
        data: created,
      },
      201
    );
  } catch (error) {
    return sendError(res, 500, "Server error during bulk creation");
  }
};

/* ================= BULK SOFT DELETE ================= */
const deleteAllUserData = async (req, res) => {
  try {
    const { dataType } = req.query;
    const query = {
      userId: req.user._id,
      isDeleted: false,
    };

    if (dataType) {
      if (!VALID_DATA_TYPES.has(dataType)) {
        return sendError(res, 400, "Invalid data type filter");
      }
      query.dataType = dataType;
    }

    const result = await EncryptedData.updateMany(query, { $set: { isDeleted: true } });

    return sendSuccess(res, {
      success: true,
      message: "Data deleted",
      deletedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    return sendError(res, 500, "Server error deleting data");
  }
};

module.exports = {
  getUserData,
  createData,
  updateData,
  deleteData,
  bulkCreateData,
  deleteAllUserData,
};
