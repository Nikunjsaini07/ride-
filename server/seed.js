import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Ride from "./models/Ride.js";
import JoinRequest from "./models/JoinRequest.js";
import Rating from "./models/Rating.js";

dotenv.config();

const run = async () => {
  await connectDB();
  await Rating.deleteMany({});
  await JoinRequest.deleteMany({});
  await Ride.deleteMany({});
  await User.deleteMany({});

  const aman = await User.create({
    name: "Aman",
    email: "aman@example.com",
    password: "password123",
    phone: "9000000001",
    hasBike: true,
  });
  const priya = await User.create({
    name: "Priya",
    email: "priya@example.com",
    password: "password123",
    phone: "9000000002",
    hasBike: true,
  });
  const rohit = await User.create({
    name: "Rohit",
    email: "rohit@example.com",
    password: "password123",
    phone: "9000000003",
    hasBike: false,
  });

  const inHours = (h) => new Date(Date.now() + h * 60 * 60 * 1000);

  await Ride.create([
    {
      driver: aman._id,
      direction: "FROM_HUB",
      place: "Saharanpur",
      departureTime: inHours(3),
      note: "Leaving after class, can drop near railway station.",
    },
    {
      driver: priya._id,
      direction: "TO_HUB",
      place: "Deoband",
      departureTime: inHours(15),
      note: "Morning ride to campus.",
    },
    {
      driver: aman._id,
      direction: "FROM_HUB",
      place: "Gangoh Bus Stand",
      departureTime: inHours(5),
      note: "",
    },
  ]);

  // A PAST ride that already happened, with Rohit as an accepted passenger,
  // so the rating flow can be tested immediately after seeding.
  const pastRide = await Ride.create({
    driver: aman._id,
    direction: "FROM_HUB",
    place: "Nakur",
    departureTime: inHours(-24),
    seatsTaken: 1,
    status: "full",
    passengers: [rohit._id],
    note: "Yesterday's trip.",
  });
  await JoinRequest.create({
    ride: pastRide._id,
    rider: rohit._id,
    status: "accepted",
    message: "Thanks for the lift!",
  });

  console.log("Seeded users, rides, and a past ride for rating tests.");
  console.log("Driver login:    aman@example.com / password123");
  console.log("Passenger login: rohit@example.com / password123");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
