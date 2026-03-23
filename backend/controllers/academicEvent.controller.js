import asyncHandler from "../utils/asyncHandler.js";
import {
  createAcademicEvent,
  deleteAcademicEvent,
  getAcademicEventById,
  getAllAcademicEvents,
  updateAcademicEvent,
} from "../services/academicEvent.service.js";

export const createAcademicEventController = asyncHandler(async (req, res) => {
  const event = await createAcademicEvent(req.body);

  res.status(201).json({
    success: true,
    message: "Academic event created successfully",
    data: event,
  });
});

export const getAllAcademicEventsController = asyncHandler(async (req, res) => {
  const events = await getAllAcademicEvents(req.query);

  res.status(200).json({
    success: true,
    message: "Academic events fetched successfully",
    data: events,
  });
});

export const getAcademicEventByIdController = asyncHandler(async (req, res) => {
  const event = await getAcademicEventById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Academic event fetched successfully",
    data: event,
  });
});

export const updateAcademicEventController = asyncHandler(async (req, res) => {
  const event = await updateAcademicEvent(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Academic event updated successfully",
    data: event,
  });
});

export const deleteAcademicEventController = asyncHandler(async (req, res) => {
  await deleteAcademicEvent(req.params.id);

  res.status(200).json({
    success: true,
    message: "Academic event deleted successfully",
  });
});
