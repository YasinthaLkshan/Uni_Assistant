import asyncHandler from "../utils/asyncHandler.js";
import {
  createStudentProfile,
  deleteStudentProfile,
  getAllStudentProfiles,
  getStudentProfileById,
  updateStudentProfile,
} from "../services/studentProfile.service.js";

export const createStudentProfileController = asyncHandler(async (req, res) => {
  const profile = await createStudentProfile(req.body);

  res.status(201).json({
    success: true,
    message: "Student profile created successfully",
    data: profile,
  });
});

export const getAllStudentProfilesController = asyncHandler(async (req, res) => {
  const profiles = await getAllStudentProfiles(req.query);

  res.status(200).json({
    success: true,
    message: "Student profiles fetched successfully",
    data: profiles,
  });
});

export const getStudentProfileByIdController = asyncHandler(async (req, res) => {
  const profile = await getStudentProfileById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Student profile fetched successfully",
    data: profile,
  });
});

export const updateStudentProfileController = asyncHandler(async (req, res) => {
  const profile = await updateStudentProfile(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Student profile updated successfully",
    data: profile,
  });
});

export const deleteStudentProfileController = asyncHandler(async (req, res) => {
  await deleteStudentProfile(req.params.id);

  res.status(200).json({
    success: true,
    message: "Student profile deleted successfully",
  });
});
