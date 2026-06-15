import Ride from "../models/Ride.js";
import JoinRequest from "../models/JoinRequest.js";
import Rating from "../models/Rating.js";

const isPast = (ride) =>
  new Date(ride.departureTime).getTime() <= Date.now() ||
  ride.status === "completed";

// Aggregated data for the logged-in user's profile page:
// past offered rides, past joined rides, received ratings + which trips
// the user can still rate.
export const getMyProfile = async (req, res) => {
  try {
    const meId = req.user._id;

    // Rides I drove that are now in the past.
    const allDriven = await Ride.find({ driver: meId })
      .populate("passengers", "name phone ratingAvg ratingCount")
      .sort({ departureTime: -1 });
    const offered = allDriven.filter(isPast);

    // Rides I joined (accepted) that are now in the past.
    const acceptedReqs = await JoinRequest.find({
      rider: meId,
      status: "accepted",
    }).populate({
      path: "ride",
      populate: { path: "driver", select: "name phone ratingAvg ratingCount" },
    });
    const joined = acceptedReqs
      .map((r) => r.ride)
      .filter((ride) => ride && isPast(ride));

    // Which rides have I already rated?
    const myRatings = await Rating.find({ rater: meId }).select("ride");
    const ratedRideIds = new Set(myRatings.map((r) => r.ride.toString()));

    const decorate = (ride, counterpart) => ({
      _id: ride._id,
      direction: ride.direction,
      place: ride.place,
      departureTime: ride.departureTime,
      status: ride.status,
      note: ride.note,
      counterpart, // the other person to rate (or null)
      ratedByMe: ratedRideIds.has(ride._id.toString()),
      canRate:
        ride.status !== "cancelled" &&
        !!counterpart &&
        !ratedRideIds.has(ride._id.toString()),
    });

    const offeredOut = offered.map((ride) =>
      decorate(ride, ride.passengers?.[0] || null)
    );
    const joinedOut = joined.map((ride) => decorate(ride, ride.driver || null));

    const received = await Rating.find({ ratee: meId })
      .populate("rater", "name")
      .sort({ createdAt: -1 });

    res.json({
      stats: {
        ratingAvg: req.user.ratingAvg,
        ratingCount: req.user.ratingCount,
        offeredCount: offeredOut.length,
        joinedCount: joinedOut.length,
      },
      offered: offeredOut,
      joined: joinedOut,
      received,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
