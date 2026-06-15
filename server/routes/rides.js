import express from "express";
import {
  createRide,
  searchRides,
  myRides,
  getRide,
  cancelRide,
  completeRide,
} from "../controllers/rideController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/search", searchRides);
router.get("/mine", protect, myRides);
router.post("/", protect, createRide);
router.get("/:id", getRide);
router.delete("/:id", protect, cancelRide);
router.put("/:id/complete", protect, completeRide);

export default router;
