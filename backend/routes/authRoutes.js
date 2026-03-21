import { Router } from "express";

import { getProfile, loginUser, registerUser } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

const router = Router();

router.post("/register", validate(), registerUser);
router.post("/login", validate(), loginUser);
router.get("/me", protect, getProfile);

export default router;
