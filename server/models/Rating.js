import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
    // who gave the rating
    rater: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // who received it
    ratee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 280 },
  },
  { timestamps: true }
);

// One rating per rater per ride (can't rate the same trip twice).
ratingSchema.index({ ride: 1, rater: 1 }, { unique: true });
ratingSchema.index({ ratee: 1, createdAt: -1 });

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
