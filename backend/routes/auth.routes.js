import { Router } from "express";

import { getProfile, login, register } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

const router = Router();

router.post("/register", validate(), register);
router.post("/login", validate(), login);
router.get("/me", protect, getProfile);

export default router;
