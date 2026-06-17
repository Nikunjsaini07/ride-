import Ride from "../models/Ride.js";
import JoinRequest from "../models/JoinRequest.js";

/**
 * Periodically searches for rides whose departureTime is in the past
 * and deletes them if they have received 0 join requests.
 */
export const cleanupExpiredRides = async () => {
  try {
    const now = new Date();
    // Find open or full rides whose departureTime is in the past
    const expiredRides = await Ride.find({
      departureTime: { $lt: now },
      status: { $in: ["open", "full"] },
    });

    if (expiredRides.length === 0) return;

    let deletedCount = 0;
    for (const ride of expiredRides) {
      // Check if there are any requests associated with this ride
      const requestCount = await JoinRequest.countDocuments({ ride: ride._id });
      if (requestCount === 0) {
        await Ride.deleteOne({ _id: ride._id });
        deletedCount++;
        console.log(`[Cleanup] Deleted expired ride ${ride._id} (Departure: ${ride.departureTime}) with 0 requests.`);
      }
    }
    if (deletedCount > 0) {
      console.log(`[Cleanup] Successfully removed ${deletedCount} expired, unrequested rides.`);
    }
  } catch (error) {
    console.error("[Cleanup] Error during expired ride cleanup:", error);
  }
};

/**
 * Initializes the background timer for expired ride cleanup.
 */
export const startCleanupJob = () => {
  console.log("[Cleanup] Starting expired rides cleanup job (Interval: 5 minutes)...");
  // Run every 5 minutes
  setInterval(cleanupExpiredRides, 5 * 60 * 1000);
  // Run once immediately on startup
  cleanupExpiredRides();
};
