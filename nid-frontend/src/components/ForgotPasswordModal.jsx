import { useState, useEffect } from "react";
import api from "../api/api";

export default function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
        setMessage("");
        setEmail("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setMessage("If that email exists, a reset link has been sent.");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl px-8 py-8 w-full max-w-md animate-fade-in relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-blue-800 mb-2 text-center">Forgot Password</h2>
        <p className="text-sm text-blue-700 mb-4 text-center">Enter your email to receive a reset link.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              {/* Mail icon */}
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="email"
              className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900 placeholder-blue-400 text-base"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading || !!message}
            />
          </div>
          {message && <div className="text-green-600 text-sm text-center bg-green-50 py-2 px-3 rounded-lg">{message}</div>}
          {error && <div className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{error}</div>}
          <button
            type="submit"
            disabled={!email || loading || !!message}
            className={`w-full py-2.5 rounded-md font-bold uppercase tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              email && !loading && !message
                ? "bg-blue-700 hover:bg-blue-800 text-white shadow"
                : "bg-blue-200 text-blue-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
} 