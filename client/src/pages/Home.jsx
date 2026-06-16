import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { motion } from "framer-motion";
import { Search, Bike, Send } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div
      className="home"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.section className="hero" variants={itemVariants}>
        <span className="hero-badge">
          <span className="dot" />
          By students, for students · Shobhit University, Gangoh
        </span>
        <h1>
          Share a bike ride with <span className="grad">fellow students</span>
        </h1>
        <p>
          Heading to or from campus? Match with a student riding your way, hop
          on, and split the trip — no fares, no fuss. Just students helping
          students get around Gangoh.
        </p>
        <div className="hero-actions">
          <Link to="/find" className="btn btn-primary btn-lg">
            <Search size={18} />
            <span>Find a Ride</span>
          </Link>
          {user ? (
            <Link to="/offer" className="btn btn-outline btn-lg">
              <Bike size={18} />
              <span>Offer a Ride</span>
            </Link>
          ) : (
            <Link to="/register" className="btn btn-outline btn-lg">
              <span>Sign Up Free</span>
            </Link>
          )}
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="num">₹0</div>
            <div className="lbl">No fares, ever</div>
          </div>
          <div className="hero-stat">
            <div className="num">15+</div>
            <div className="lbl">Towns covered</div>
          </div>
          <div className="hero-stat">
            <div className="num">2-min</div>
            <div className="lbl">To post a ride</div>
          </div>
        </div>
      </motion.section>

      <section>
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>Three steps to your next ride</h2>
        </div>
        <motion.div className="steps" variants={containerVariants}>
          <motion.div className="card step" variants={itemVariants}>
            <div className="step-num">
              <Search size={20} />
            </div>
            <h3>Search your route</h3>
            <p>
              Pick a direction and destination. We match riders heading the same
              way — including nearby stops along the road.
            </p>
          </motion.div>
          <motion.div className="card step" variants={itemVariants}>
            <div className="step-num">
              <Send size={20} />
            </div>
            <h3>Request to join</h3>
            <p>
              Found a ride you like? Send a quick request to the student riding
              the bike and wait for a thumbs up.
            </p>
          </motion.div>
          <motion.div className="card step" variants={itemVariants}>
            <div className="step-num">
              <Bike size={20} />
            </div>
            <h3>Ride together</h3>
            <p>
              Once accepted, you get their contact, meet up, and ride. Rate each
              other afterwards to keep the community trusted.
            </p>
          </motion.div>
        </motion.div>
      </section>

      <motion.section className="home-cta" variants={itemVariants}>
        <h2>Got a bike and an empty seat?</h2>
        <p>
          Turn your daily commute into someone else's lift. Post your ride in
          under two minutes.
        </p>
        <Link
          to={user ? "/offer" : "/register"}
          className="btn btn-primary btn-lg"
        >
          {user ? (
            <>
              <Bike size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              <span>Offer a Ride</span>
            </>
          ) : (
            <span>Get Started — It's Free</span>
          )}
        </Link>
      </motion.section>
    </motion.div>
  );
}
