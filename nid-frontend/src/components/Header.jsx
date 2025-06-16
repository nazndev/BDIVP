import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="w-full flex items-center justify-between bg-white shadow px-6 py-3">
      <div className="text-xl font-bold text-blue-800">
        {/* Welcome, {user?.email} */}
        </div>
      <button
        onClick={logout}
        className="px-4 py-1.5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
      >
        Logout
      </button>
    </header>
  );
} 