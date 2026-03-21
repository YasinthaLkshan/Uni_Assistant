import { Router } from "express";

import {
  createTask,
  deleteTask,
  getTaskById,
  getUserTasks,
  updateTask,
} from "../controllers/taskController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.route("/").post(createTask).get(getUserTasks);
router.route("/:id").get(getTaskById).put(updateTask).delete(deleteTask);

export default router;
