import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Users, Briefcase, FileText, TrendingUp, ShieldCheck,
  User, Clock, ArrowRight, Activity
} from 'lucide-react';
import { LoadingScreen, StatusBadge } from '../components/common/UI';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (!data) return null;

  const { stats, recentJobs, recentApplications, recentUsers, charts } = data;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { label: 'Candidates', value: stats.candidates, icon: User, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Recruiters', value: stats.recruiters, icon: ShieldCheck, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50' },
    { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Jobs', value: stats.totalJobs, icon: TrendingUp, color: 'from-primary-500 to-primary-600', bg: 'bg-primary-50' },
    { label: 'Applications', value: stats.totalApplications, icon: FileText, color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50' },
  ];

  // Prepare chart data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const jobs = charts.monthlyJobs.find(m => m._id.month === month && m._id.year === year)?.count || 0;
    const apps = charts.monthlyApplications.find(m => m._id.month === month && m._id.year === year)?.count || 0;
    return { name: MONTHS[month - 1], jobs, applications: apps };
  });

  const pieData = charts.applicationsByStatus.map(s => ({
    name: s._id, value: s.count
  }));

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary-600" />Admin Dashboard
          </h1>
          <p className="page-subtitle">Platform-wide overview and management</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/users" className="btn-secondary text-sm">Manage Users</Link>
          <Link to="/admin/jobs" className="btn-primary text-sm">Manage Jobs</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value?.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly trend */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-500" />Monthly Activity (Last 6 Months)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="jobs" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Jobs Posted" />
              <Bar dataKey="applications" fill="#a855f7" radius={[4, 4, 0, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Applications by status */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Applications by Status</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="card">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">New Users</h2>
            <Link to="/admin/users" className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentUsers.map(u => (
              <div key={u._id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.role} · {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</p>
                </div>
                <span className={`badge text-xs capitalize ${u.role === 'admin' ? 'bg-purple-50 text-purple-700' : u.role === 'recruiter' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="card">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Jobs</h2>
            <Link to="/admin/jobs" className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentJobs.map(j => (
              <div key={j._id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-800 truncate">{j.title}</p>
                <p className="text-xs text-slate-400">by {j.postedBy?.name} · {formatDistanceToNow(new Date(j.createdAt), { addSuffix: true })}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Applications</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {recentApplications.map(a => (
              <div key={a._id} className="px-4 py-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{a.candidate?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{a.job?.title}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
