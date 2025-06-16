import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="w-full flex items-center justify-end bg-white shadow px-6 py-3">
      <div className="flex items-center gap-4">
        <div className="text-sm text-blue-700 font-medium">{user?.email}</div>
        <button
          onClick={logout}
          className="px-4 py-1.5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
} 