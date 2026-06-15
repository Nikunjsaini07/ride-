import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema(
  {
    ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, default: "", maxlength: 280 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// A rider can only have one active request per ride.
joinRequestSchema.index({ ride: 1, rider: 1 }, { unique: true });
joinRequestSchema.index({ rider: 1, status: 1 });
joinRequestSchema.index({ ride: 1, status: 1 });

const JoinRequest = mongoose.model("JoinRequest", joinRequestSchema);
export default JoinRequest;
