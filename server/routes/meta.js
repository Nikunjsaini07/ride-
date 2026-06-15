import express from "express";
import { HUB, HUB_COORDS, DESTINATIONS } from "../config/locations.js";

const router = express.Router();

// Public reference data for the client (hub name + destination list).
router.get("/", (req, res) => {
  res.json({ hub: HUB, hubCoords: HUB_COORDS, destinations: DESTINATIONS });
});

export default router;
