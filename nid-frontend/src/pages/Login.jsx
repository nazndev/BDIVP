import { useState } from "react";
import { login as loginApi } from "../api/api";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const isFormValid = email.trim() && password.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      localStorage.setItem("token", res.data.data.token);
      // TODO: redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500">
      <ForgotPasswordModal open={showForgot} onClose={() => setShowForgot(false)} />
      <div className="bg-white rounded-2xl shadow-xl px-8 py-10 w-full max-w-md flex flex-col items-center animate-fade-in">
        {/* BDIVP Logo/Icon */}
        <div className="mb-8 flex flex-col items-center">
          <span className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-2">
            {/* Simple modern BDIVP SVG icon */}
            <svg className="w-10 h-10 text-blue-700" fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth="2">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M16 10v8M16 18l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h1 className="text-2xl font-bold text-blue-800 tracking-wide">BDIVP</h1>
          <p className="text-sm text-blue-700 font-medium">Bangladesh Identity Verification Platform</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {/* Mail icon for email */}
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="Email"
                className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900 placeholder-blue-400 text-base"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {/* Lock icon for password */}
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="5" y="11" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M12 15v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900 placeholder-blue-400 text-base"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full py-2.5 rounded-md font-bold uppercase tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isFormValid && !loading
                ? "bg-blue-700 hover:bg-blue-800 text-white shadow"
                : "bg-blue-200 text-blue-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline focus:outline-none"
              disabled={loading}
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 