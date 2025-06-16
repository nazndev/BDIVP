import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';

const cardStyles = [
  'from-blue-500 to-blue-400',
  'from-pink-500 to-pink-400',
  'from-yellow-400 to-yellow-300',
  'from-green-500 to-green-400',
  'from-purple-500 to-purple-400',
  'from-cyan-500 to-cyan-400',
  'from-orange-500 to-orange-400',
  'from-lime-500 to-lime-400',
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        if (user?.role === 'admin') {
          const res = await api.get('/admin/overview');
          setStats(res.data);
        } else {
          // For partner/user, you can fetch NID stats or show placeholders
          setStats({
            nidVerifications: 0,
            profile: user?.email,
          });
        }
      } catch (err) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">
          <h1 className="text-2xl font-bold text-blue-800 mb-6">Welcome, {user?.email}</h1>
          {loading ? (
            <div className="flex items-center justify-center h-40">Loading dashboard...</div>
          ) : user?.role === 'admin' && stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard color={cardStyles[0]} icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 010 7.75" /></svg>
              } label="Users" value={stats.users} link="/users" />
              <DashboardCard color={cardStyles[1]} icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z" /></svg>
              } label="Partners" value={stats.partners} link="/partners" />
              <DashboardCard color={cardStyles[2]} icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z" /></svg>
              } label="Active Tokens" value={stats.activeTokens} link="/tokens" />
              <DashboardCard color={cardStyles[3]} icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" /></svg>
              } label="Verifications" value={stats.totalVerifications} link="/nid-verification" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <DashboardCard color={cardStyles[0]} icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z" /></svg>
              } label="NID Verifications" value={stats?.nidVerifications || 0} link="/nid-verification" />
              <DashboardCard color={cardStyles[1]} icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              } label="Profile" value={user?.email} link="/profile" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function DashboardCard({ color, icon, label, value, link }) {
  return (
    <Link to={link} className={`flex flex-col items-center justify-center rounded-2xl shadow-lg p-6 bg-gradient-to-r ${color} text-white hover:scale-105 transition-transform min-h-[120px]`}>
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium opacity-90">{label}</div>
    </Link>
  );
} 