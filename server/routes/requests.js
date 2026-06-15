import express from "express";
import {
  createRequest,
  myRequests,
  incomingRequests,
  respondRequest,
  cancelRequest,
} from "../controllers/requestController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createRequest);
router.get("/mine", protect, myRequests);
router.get("/incoming", protect, incomingRequests);
router.put("/:id/respond", protect, respondRequest);
router.put("/:id/cancel", protect, cancelRequest);

export default router;
