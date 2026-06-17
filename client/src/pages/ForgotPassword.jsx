import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { motion } from "framer-motion";
import { Mail, KeyRound } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  return (
    <motion.div className="auth-wrap" initial="hidden" animate="visible" variants={pageVariants}>
      <form className="card auth-card" onSubmit={submit}>
        <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <KeyRound size={22} style={{ color: 'var(--primary)' }} />
          <span>Forgot password</span>
        </h2>
        {sent ? (
          <div className="auth-success-state" style={{ textAlign: "center", padding: "16px 0 8px" }}>
            <div className="success-icon-wrap" style={{
              display: "inline-flex",
              padding: "16px",
              borderRadius: "50%",
              background: "var(--primary-glow)",
              color: "var(--primary)",
              marginBottom: "24px",
              border: "2px solid var(--border)",
              boxShadow: "2px 2px 0px var(--border)"
            }}>
              <Mail size={44} />
            </div>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "12px", color: "var(--text-pure)" }}>
              Check your email
            </h3>
            <p className="muted" style={{ fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "24px" }}>
              We've sent a password reset link to <strong style={{ color: "var(--text-pure)" }}>{email}</strong>. Please click the link to verify your request.
            </p>
            <div className="alert info" style={{ marginBottom: "24px", textAlign: "left", fontSize: "0.85rem", lineHeight: "1.5" }}>
              <span>If you don't receive the email within a few minutes, check your spam folder or try requesting a new link.</span>
            </div>
            <Link to="/login" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
              Back to login
            </Link>
          </div>
        ) : (
          <>
            {error && <div className="alert">{error}</div>}
            <p className="muted">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} />
              <span>Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Sending..." : "Send reset link"}
            </button>
            <p className="auth-alt">
              Remembered it? <Link to="/login">Back to login</Link>
            </p>
          </>
        )}
      </form>
    </motion.div>
  );
}
