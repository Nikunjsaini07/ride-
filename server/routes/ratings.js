import express from "express";
import {
  createRating,
  getUserRatings,
} from "../controllers/ratingController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createRating);
router.get("/user/:userId", getUserRatings);

export default router;
