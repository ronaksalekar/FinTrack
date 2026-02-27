const sendSuccess = (res, payload = {}, status = 200) => {
  return res.status(status).json(payload);
};

const sendError = (res, status, message, extra = {}) => {
  return res.status(status).json({
    success: false,
    message,
    ...extra,
  });
};

const asyncHandler = (handler) => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user._id,
    email: user.email,
    profile: user.profile || {},
    preferences: user.preferences || {},
    notifications: user.notifications || {},
    onboardingComplete: Boolean(user.onboardingComplete),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

module.exports = {
  sendSuccess,
  sendError,
  asyncHandler,
  sanitizeUser,
};
