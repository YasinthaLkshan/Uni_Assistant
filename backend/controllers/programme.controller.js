import asyncHandler from "../utils/asyncHandler.js";
import {
  createProgramme,
  deleteProgramme,
  filterProgrammesByType,
  getAllProgrammes,
  getProgrammeById,
  updateProgramme,
} from "../services/programme.service.js";

export const createProgrammeController = asyncHandler(async (req, res) => {
  const programme = await createProgramme(req.body);

  res.status(201).json({
    success: true,
    message: "Programme created successfully",
    data: programme,
  });
});

export const getAllProgrammesController = asyncHandler(async (_req, res) => {
  const programmes = await getAllProgrammes();

  res.status(200).json({
    success: true,
    message: "Programmes fetched successfully",
    data: programmes,
  });
});

export const filterProgrammesByTypeController = asyncHandler(async (req, res) => {
  const programmes = await filterProgrammesByType(req.params.type);

  res.status(200).json({
    success: true,
    message: "Programmes filtered by type successfully",
    data: programmes,
  });
});

export const getProgrammeByIdController = asyncHandler(async (req, res) => {
  const programme = await getProgrammeById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Programme fetched successfully",
    data: programme,
  });
});

export const updateProgrammeController = asyncHandler(async (req, res) => {
  const programme = await updateProgramme(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Programme updated successfully",
    data: programme,
  });
});

export const deleteProgrammeController = asyncHandler(async (req, res) => {
  await deleteProgramme(req.params.id);

  res.status(200).json({
    success: true,
    message: "Programme deleted successfully",
  });
});
