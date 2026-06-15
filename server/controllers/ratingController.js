import Rating from "../models/Rating.js";
import Ride from "../models/Ride.js";
import User from "../models/User.js";

const recomputeUserRating = async (userId) => {
  const agg = await Rating.aggregate([
    { $match: { ratee: userId } },
    { $group: { _id: "$ratee", avg: { $avg: "$stars" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = agg[0] || {};
  await User.findByIdAndUpdate(userId, {
    ratingAvg: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
};

// Rate the other party of a past ride.
export const createRating = async (req, res) => {
  try {
    const { rideId, stars, comment } = req.body;
    const n = Number(stars);
    if (!rideId || !n || n < 1 || n > 5) {
      return res.status(400).json({ message: "Provide rideId and stars 1-5" });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status === "cancelled") {
      return res.status(400).json({ message: "Cannot rate a cancelled ride" });
    }
    if (new Date(ride.departureTime).getTime() > Date.now()) {
      return res.status(400).json({ message: "Ride hasn't happened yet" });
    }

    const me = req.user._id.toString();
    const driverId = ride.driver.toString();
    const passengerIds = ride.passengers.map((p) => p.toString());

    let rateeId;
    if (me === driverId) {
      // Driver rates the (single) passenger.
      if (passengerIds.length === 0) {
        return res.status(400).json({ message: "No passenger to rate" });
      }
      rateeId = passengerIds[0];
    } else if (passengerIds.includes(me)) {
      // Passenger rates the driver.
      rateeId = driverId;
    } else {
      return res.status(403).json({ message: "You were not part of this ride" });
    }

    const existing = await Rating.findOne({ ride: rideId, rater: req.user._id });
    if (existing) {
      return res.status(409).json({ message: "You already rated this ride" });
    }

    const rating = await Rating.create({
      ride: rideId,
      rater: req.user._id,
      ratee: rateeId,
      stars: n,
      comment: comment || "",
    });
    await recomputeUserRating(rating.ratee);
    res.status(201).json(rating);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Ratings received by a user (public).
export const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ ratee: req.params.userId })
      .populate("rater", "name")
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
