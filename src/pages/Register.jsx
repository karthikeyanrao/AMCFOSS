import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const { registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const domain = email.split("@")[1] || "";
    const isCollege = domain.toLowerCase().includes("amrita") || domain.toLowerCase().includes("edu");
    if (!isCollege) {
      setError("Please use your college email ID.");
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password);
      navigate("/select-role", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Launch your AMC FOSS profile."
      subtitle="Register using your official college email to access mentor or office bearer workflows."
      footer={
        <span>
          Already verified?{" "}
          <Link to="/login" className="text-[#00ff88] hover:text-[#2ecc71]">
            Sign in
          </Link>
        </span>
      }
    >
      {error ? (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-300">
          {error}
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">College Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/10 focus:ring-2 focus:ring-[#00ff88]/50"
            placeholder="you@amrita.edu"
            required
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/10 focus:ring-2 focus:ring-[#00ff88]/50"
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/10 focus:ring-2 focus:ring-[#00ff88]/50"
              placeholder="Retype password"
              required
              minLength={6}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#00ff88] via-[#2ecc71] to-[#27ae60] px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#1a1a2e] shadow-lg shadow-[#00ff88]/30 transition focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 font-bold"
        >
          <span className="absolute inset-0 translate-y-full bg-white/20 transition duration-300 group-hover:translate-y-0" />
          <span className="relative">{loading ? "Creating..." : "Create Account"}</span>
        </button>
      </form>
    </AuthLayout>
  );
}


