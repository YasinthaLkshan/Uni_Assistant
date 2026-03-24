import { Router } from "express";

import {
  createTimetableEntryController,
  deleteTimetableEntryController,
  duplicateTimetableToGroupsController,
  filterTimetableBySemesterAndGroupController,
  getAllTimetableEntriesController,
  getTimetableEntryByIdController,
  updateTimetableEntryController,
} from "../controllers/timetable.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import validate from "../middleware/validate.middleware.js";

const router = Router();

router.use(protect, adminMiddleware);

router.post("/", validate(), createTimetableEntryController);
router.post("/duplicate-groups", validate(), duplicateTimetableToGroupsController);
router.get("/", getAllTimetableEntriesController);
router.get("/semester/:semester/group/:groupNumber", filterTimetableBySemesterAndGroupController);
router.get("/:id", getTimetableEntryByIdController);
router.put("/:id", validate(), updateTimetableEntryController);
router.delete("/:id", deleteTimetableEntryController);

export default router;
