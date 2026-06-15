import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    // mongodb+srv:// requires a DNS SRV lookup. Some routers/ISP resolvers
    // refuse SRV queries (Node throws "querySrv ECONNREFUSED") even when the
    // OS can resolve them. Point Node's resolver at a public DNS server to
    // sidestep that. Override with DNS_SERVERS in .env if needed.
    if (uri && uri.startsWith("mongodb+srv://")) {
      const servers = (process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      try {
        dns.setServers(servers);
      } catch (e) {
        console.warn("Could not set custom DNS servers:", e.message);
      }
    }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
