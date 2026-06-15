import JoinRequest from "../models/JoinRequest.js";
import Ride from "../models/Ride.js";

// A rider asks to join a ride.
export const createRequest = async (req, res) => {
  try {
    const { rideId, message } = req.body;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status !== "open") {
      return res.status(400).json({ message: "Ride is not open" });
    }
    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot join your own ride" });
    }

    const existing = await JoinRequest.findOne({
      ride: rideId,
      rider: req.user._id,
    });
    if (existing && existing.status === "pending") {
      return res.status(409).json({ message: "Request already pending" });
    }
    if (existing && existing.status === "accepted") {
      return res.status(409).json({ message: "You are already on this ride" });
    }

    let request;
    if (existing) {
      existing.status = "pending";
      existing.message = message || "";
      request = await existing.save();
    } else {
      request = await JoinRequest.create({
        ride: rideId,
        rider: req.user._id,
        message: message || "",
      });
    }
    const populated = await request.populate("rider", "name phone");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Requests made BY the logged-in rider.
export const myRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find({ rider: req.user._id })
      .populate({
        path: "ride",
        populate: { path: "driver", select: "name phone hasBike" },
      })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Requests received for the driver's rides.
export const incomingRequests = async (req, res) => {
  try {
    const myRideIds = await Ride.find({ driver: req.user._id }).distinct("_id");
    const requests = await JoinRequest.find({ ride: { $in: myRideIds } })
      .populate("rider", "name phone")
      .populate("ride", "place direction departureTime status")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Driver accepts or rejects a request.
export const respondRequest = async (req, res) => {
  try {
    const { action } = req.body; // "accept" | "reject"
    const request = await JoinRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const ride = await Ride.findById(request.ride);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your ride" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already handled" });
    }

    if (action === "accept") {
      if (ride.seatsTaken >= ride.seats) {
        return res.status(400).json({ message: "No seats left" });
      }
      request.status = "accepted";
      ride.seatsTaken += 1;
      ride.passengers.push(request.rider);
      if (ride.seatsTaken >= ride.seats) ride.status = "full";
      await ride.save();
      await request.save();

      // Auto-reject remaining pending requests if the ride is now full.
      if (ride.status === "full") {
        await JoinRequest.updateMany(
          { ride: ride._id, status: "pending" },
          { status: "rejected" }
        );
      }
    } else if (action === "reject") {
      request.status = "rejected";
      await request.save();
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    const populated = await request.populate("rider", "name phone");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// A rider cancels their own request.
export const cancelRequest = async (req, res) => {
  try {
    const request = await JoinRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.rider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your request" });
    }

    // If it was accepted, free the seat back up.
    if (request.status === "accepted") {
      const ride = await Ride.findById(request.ride);
      if (ride) {
        ride.seatsTaken = Math.max(0, ride.seatsTaken - 1);
        ride.passengers = ride.passengers.filter(
          (p) => p.toString() !== request.rider.toString()
        );
        if (ride.status === "full") ride.status = "open";
        await ride.save();
      }
    }
    request.status = "cancelled";
    await request.save();
    res.json({ message: "Request cancelled", request });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
