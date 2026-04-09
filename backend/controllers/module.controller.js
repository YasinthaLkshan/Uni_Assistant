import asyncHandler from "../utils/asyncHandler.js";
import {
  createModule,
  deleteModule,
  filterModulesBySemester,
  getAllModules,
  getModuleById,
  updateModule,
} from "../services/module.service.js";

export const createModuleController = asyncHandler(async (req, res) => {
  const module = await createModule(req.body);

  res.status(201).json({
    success: true,
    message: "Module created successfully",
    data: module,
  });
});

export const getAllModulesController = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.academicYear) filters.academicYear = req.query.academicYear;
  if (req.query.programme) filters.programme = req.query.programme;
  if (req.query.semester) filters.semester = req.query.semester;

  const modules = await getAllModules(filters);

  res.status(200).json({
    success: true,
    message: "Modules fetched successfully",
    data: modules,
  });
});

export const filterModulesBySemesterController = asyncHandler(async (req, res) => {
  const modules = await filterModulesBySemester(req.params.semester);

  res.status(200).json({
    success: true,
    message: "Modules filtered by semester successfully",
    data: modules,
  });
});

export const getModuleByIdController = asyncHandler(async (req, res) => {
  const module = await getModuleById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Module fetched successfully",
    data: module,
  });
});

export const updateModuleController = asyncHandler(async (req, res) => {
  const module = await updateModule(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Module updated successfully",
    data: module,
  });
});

export const deleteModuleController = asyncHandler(async (req, res) => {
  await deleteModule(req.params.id);

  res.status(200).json({
    success: true,
    message: "Module deleted successfully",
  });
});
