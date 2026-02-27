const mongoose = require("mongoose");

const normalizeEmail = (value = "") => value.trim().toLowerCase();

const isValidEmail = (value = "") => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const isNonEmptyString = (value) => {
  return typeof value === "string" && value.trim().length > 0;
};

const toTrimmedString = (value = "") => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const toInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const toDateOrNull = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

module.exports = {
  normalizeEmail,
  isValidEmail,
  isNonEmptyString,
  toTrimmedString,
  toInteger,
  toDateOrNull,
  isObjectId,
};
