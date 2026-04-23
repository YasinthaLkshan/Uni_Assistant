const lecturerMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: authenticated user context is required",
    });
  }

  if (req.user.role !== "lecturer") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: lecturer access only",
    });
  }

  return next();
};

export default lecturerMiddleware;
