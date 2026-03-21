import { Router } from "express";

import { loginUser, registerUser } from "../controllers/auth.controller.js";
import validate from "../middleware/validate.middleware.js";

const router = Router();

router.post("/register", validate(), registerUser);
router.post("/login", validate(), loginUser);

export default router;
