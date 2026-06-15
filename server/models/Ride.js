import mongoose from "mongoose";

// A ride goes from one location to another. Either endpoint can be the
// university or any other town — the campus is no longer a forced endpoint.
const rideSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Start and end locations (each one of the predefined locations).
    from: { type: String, required: true },
    to: { type: String, required: true },
    departureTime: { type: Date, required: true },
    seats: { type: Number, default: 1, min: 1, max: 1 },
    seatsTaken: { type: Number, default: 0 },
    note: { type: String, default: "", maxlength: 280 },
    // The road route the driver chose for this ride (from the map).
    route: {
      distance: { type: Number, default: null }, // meters
      duration: { type: Number, default: null }, // seconds
      geometry: { type: [[Number]], default: undefined }, // [[lat,lng], ...]
    },
    status: {
      type: String,
      enum: ["open", "full", "cancelled", "completed"],
      default: "open",
    },
    passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

rideSchema.virtual("seatsLeft").get(function () {
  return this.seats - this.seatsTaken;
});

// Indexes for the common search & dashboard queries.
rideSchema.index({ status: 1, departureTime: 1 });
rideSchema.index({ from: 1, to: 1, departureTime: 1 });
rideSchema.index({ driver: 1, departureTime: -1 });

rideSchema.set("toJSON", { virtuals: true });
rideSchema.set("toObject", { virtuals: true });

const Ride = mongoose.model("Ride", rideSchema);
export default Ride;
