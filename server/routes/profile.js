import express from "express";
import { getMyProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);

export default router;
