import Ride from "../models/Ride.js";
import JoinRequest from "../models/JoinRequest.js";
import {
  DESTINATION_NAMES,
  getDestinationOrder,
} from "../config/locations.js";

// Create a ride offer (the logged-in user is the driver).
export const createRide = async (req, res) => {
  try {
    const { direction, place, departureTime, note, route } = req.body;

    if (!["FROM_HUB", "TO_HUB"].includes(direction)) {
      return res.status(400).json({ message: "Invalid direction" });
    }
    if (!DESTINATION_NAMES.includes(place)) {
      return res.status(400).json({ message: "Unknown destination" });
    }
    const when = new Date(departureTime);
    if (isNaN(when.getTime())) {
      return res.status(400).json({ message: "Invalid departure time" });
    }
    if (when.getTime() < Date.now() - 60 * 1000) {
      return res
        .status(400)
        .json({ message: "Departure time must be in the future" });
    }

    // Sanitize the chosen route, if provided.
    let safeRoute;
    if (route && Array.isArray(route.geometry) && route.geometry.length > 1) {
      safeRoute = {
        distance: Number(route.distance) || null,
        duration: Number(route.duration) || null,
        // cap stored points to keep documents lean
        geometry: route.geometry
          .filter(
            (p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite)
          )
          .slice(0, 1000),
      };
    }

    const ride = await Ride.create({
      driver: req.user._id,
      direction,
      place,
      departureTime: when,
      note: note || "",
      ...(safeRoute ? { route: safeRoute } : {}),
    });
    const populated = await ride.populate("driver", "name phone hasBike");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Search open rides. Supports direction, place and date filters, plus
// "nearby route" matching using destination order along the main road.
export const searchRides = async (req, res) => {
  try {
    const { direction, place, date, nearby } = req.query;
    const filter = {
      status: "open",
      departureTime: { $gte: new Date(Date.now() - 60 * 1000) },
    };

    if (direction && ["FROM_HUB", "TO_HUB"].includes(direction)) {
      filter.direction = direction;
    }

    if (date) {
      const start = new Date(date);
      if (!isNaN(start.getTime())) {
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        filter.departureTime = { $gte: start, $lte: end };
      }
    }

    // Place / nearby route matching.
    if (place && DESTINATION_NAMES.includes(place)) {
      if (nearby === "true") {
        const order = getDestinationOrder(place);
        const near = DESTINATION_NAMES.filter((n) => {
          const o = getDestinationOrder(n);
          return o !== null && Math.abs(o - order) <= 1; // same or adjacent stretch
        });
        filter.place = { $in: near };
      } else {
        filter.place = place;
      }
    }

    // Pagination for scalability.
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .populate("driver", "name phone hasBike ratingAvg ratingCount")
        .sort({ departureTime: 1 })
        .skip(skip)
        .limit(limit),
      Ride.countDocuments(filter),
    ]);

    res.json({
      rides,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Rides the logged-in user is driving.
export const myRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id })
      .populate("driver", "name phone hasBike")
      .populate("passengers", "name phone")
      .sort({ departureTime: -1 });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("driver", "name phone hasBike")
      .populate("passengers", "name phone");
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your ride" });
    }
    ride.status = "cancelled";
    await ride.save();
    await JoinRequest.updateMany(
      { ride: ride._id, status: "pending" },
      { status: "cancelled" }
    );
    res.json({ message: "Ride cancelled", ride });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mark a ride as completed (driver only). This lets both the driver and the
// passenger rate each other from their profile, even before the scheduled
// departure time has technically passed.
export const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your ride" });
    }
    if (ride.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Cannot complete a cancelled ride" });
    }
    if (ride.status === "completed") {
      return res.status(400).json({ message: "Ride is already completed" });
    }
    if (!ride.passengers || ride.passengers.length === 0) {
      return res
        .status(400)
        .json({ message: "Accept a passenger before completing the ride" });
    }
    ride.status = "completed";
    await ride.save();
    res.json({ message: "Ride marked as completed", ride });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
