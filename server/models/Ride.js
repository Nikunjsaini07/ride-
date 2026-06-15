import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    direction: {
      type: String,
      enum: ["FROM_HUB", "TO_HUB"],
      required: true,
    },
    place: { type: String, required: true },
    departureTime: { type: Date, required: true },
    seats: { type: Number, default: 1, min: 1, max: 1 },
    seatsTaken: { type: Number, default: 0 },
    note: { type: String, default: "", maxlength: 280 },
    route: {
      distance: { type: Number, default: null },
      duration: { type: Number, default: null },
      geometry: { type: [[Number]], default: undefined },
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

rideSchema.index({ status: 1, direction: 1, departureTime: 1 });
rideSchema.index({ place: 1, departureTime: 1 });
rideSchema.index({ driver: 1, departureTime: -1 });

rideSchema.set("toJSON", { virtuals: true });
rideSchema.set("toObject", { virtuals: true });

const Ride = mongoose.model("Ride", rideSchema);
export default Ride;
