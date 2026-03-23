const studentMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: authenticated user context is required",
    });
  }

  if (req.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: student access only",
    });
  }

  return next();
};

export default studentMiddleware;
