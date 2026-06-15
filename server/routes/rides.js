import express from "express";
import {
  createRide,
  searchRides,
  myRides,
  getRide,
  cancelRide,
} from "../controllers/rideController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/search", searchRides);
router.get("/mine", protect, myRides);
router.post("/", protect, createRide);
router.get("/:id", getRide);
router.delete("/:id", protect, cancelRide);

export default router;
