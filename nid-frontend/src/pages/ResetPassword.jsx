import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!newPassword || newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, token, newPassword });
      setMessage("Password reset successful! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500">
      <div className="bg-white rounded-2xl shadow-xl px-8 py-10 w-full max-w-md flex flex-col items-center animate-fade-in">
        <h2 className="text-xl font-bold text-blue-800 mb-2 text-center">Reset Password</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <input type="hidden" value={email} readOnly />
          <input type="hidden" value={token} readOnly />
          <div>
            <input
              type="password"
              className="w-full pr-4 py-2 border border-blue-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900 placeholder-blue-400 text-base"
              placeholder="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <input
              type="password"
              className="w-full pr-4 py-2 border border-blue-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900 placeholder-blue-400 text-base"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {message && <div className="text-green-600 text-sm text-center bg-green-50 py-2 px-3 rounded-lg">{message}</div>}
          {error && <div className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{error}</div>}
          <button
            type="submit"
            disabled={!newPassword || !confirmPassword || loading}
            className={`w-full py-2.5 rounded-md font-bold uppercase tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              newPassword && confirmPassword && !loading
                ? "bg-blue-700 hover:bg-blue-800 text-white shadow"
                : "bg-blue-200 text-blue-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
} 