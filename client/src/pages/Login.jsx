import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";

export default function Login() {
  const { login, verifyLoginOtp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await login(form.email, form.password);
      if (res && res.otpRequired) {
        setShowOtp(true);
      } else {
        navigate("/find");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6 || isNaN(Number(otp))) {
      return setError("Please enter a valid 6-digit code.");
    }
    setBusy(true);
    try {
      await verifyLoginOtp(form.email, otp);
      navigate("/find");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
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
      {showOtp ? (
        <form className="card auth-card" onSubmit={submitOtp}>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={22} style={{ color: 'var(--primary)' }} />
            <span>Verify email</span>
          </h2>
          <p className="muted">
            We've sent a 6-digit verification code to <strong style={{ color: 'var(--text-pure)' }}>{form.email}</strong>.
          </p>
          {error && <div className="alert">{error}</div>}
          
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>Verification Code</span>
          </label>
          <input
            type="text"
            placeholder="123456"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.trim())}
            required
            style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}
          />
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Verifying..." : "Verify & Login"}
          </button>
          <p className="auth-alt">
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                setShowOtp(false);
                setOtp("");
                setError("");
              }}
            >
              Back to login
            </button>
          </p>
        </form>
      ) : (
        <form className="card auth-card" onSubmit={submit}>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <LogIn size={22} style={{ color: 'var(--primary)' }} />
            <span>Welcome back</span>
          </h2>
          {error && <div className="alert">{error}</div>}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={14} />
            <span>Email</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} />
            <span>Password</span>
          </label>
          <PasswordInput
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Logging in..." : "Login"}
          </button>
          <p className="auth-alt">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
          <p className="auth-alt">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      )}
    </motion.div>
  );
}
