import { getBestTaskRecommendation } from "../services/recommendationService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getRecommendation = asyncHandler(async (req, res) => {
  const recommendation = await getBestTaskRecommendation(req.user._id);

  res.status(200).json({
    success: true,
    message: "Recommended next task fetched successfully",
    data: recommendation,
  });
});
