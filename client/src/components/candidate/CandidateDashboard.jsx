import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, FileText, CheckCircle, Clock, TrendingUp, ArrowRight, Search, User } from 'lucide-react';
import { LoadingScreen, StatCard, StatusBadge } from '../common/UI';
import { formatDistanceToNow } from 'date-fns';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [appsRes, jobsRes, profileRes] = await Promise.all([
          api.get('/applications/my-applications', { params: { limit: 5 } }),
          api.get('/jobs', { params: { limit: 4, status: 'active' } }),
          api.get('/users/profile').catch(() => null),
        ]);
        const apps = appsRes.data.applications || [];
        setRecentApps(apps);
        setFeaturedJobs(jobsRes.data.jobs || []);
        setProfile(profileRes?.data?.profile);
        setStats({
          total: appsRes.data.pagination?.total || 0,
          reviewing: apps.filter(a => ['reviewing', 'shortlisted', 'interview'].includes(a.status)).length,
          offered: apps.filter(a => ['offered', 'hired'].includes(a.status)).length,
          rejected: apps.filter(a => a.status === 'rejected').length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingScreen />;

  const profileComplete = profile && profile.headline && profile.skills?.length > 0 && profile.resume?.filename;

  return (
    <div className="animate-slide-up">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-500 p-6 mb-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="absolute right-16 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-primary-200 text-sm font-medium mb-1">Good day 👋</p>
          <h1 className="font-display text-2xl font-bold mb-1">Hello, {user?.name?.split(' ')[0]}</h1>
          <p className="text-primary-200 text-sm">Your career journey starts here</p>
          <div className="flex gap-3 mt-4">
            <Link to="/jobs" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors">
              <Search className="w-4 h-4" /> Find Jobs
            </Link>
            <Link to="/profile" className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 text-white rounded-xl text-sm font-semibold hover:bg-white/25 transition-colors">
              <User className="w-4 h-4" /> My Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Profile completion nudge */}
      {!profileComplete && (
        <div className="card p-4 mb-6 border-l-4 border-amber-400 bg-amber-50/60 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-900">Complete your profile</p>
            <p className="text-xs text-amber-700 mt-0.5">Add a headline, skills, and resume to stand out to recruiters</p>
          </div>
          <Link to="/profile" className="btn-primary shrink-0 text-xs py-2 px-4 bg-amber-600 hover:bg-amber-700">
            Complete Profile
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Total Applied" value={stats?.total} color="blue" />
        <StatCard icon={Clock} label="In Review" value={stats?.reviewing} color="purple" />
        <StatCard icon={CheckCircle} label="Offers" value={stats?.offered} color="green" />
        <StatCard icon={TrendingUp} label="Rejected" value={stats?.rejected} color="orange" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-slate-900">Recent Applications</h2>
            <Link to="/my-applications" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="card p-8 text-center">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">No applications yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Start applying to jobs to track your progress</p>
              <Link to="/jobs" className="btn-primary text-sm">Browse Jobs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.map(app => (
                <div key={app._id} className="card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold flex-shrink-0">
                    {app.job?.company?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{app.job?.title}</p>
                    <p className="text-xs text-slate-500">{app.job?.company} · {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured Jobs sidebar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-slate-900">Jobs For You</h2>
            <Link to="/jobs" className="text-sm text-primary-600 hover:underline">See all</Link>
          </div>
          <div className="space-y-3">
            {featuredJobs.map(job => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="card p-4 block hover:shadow-card-hover transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold flex-shrink-0">
                    {job.company.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-primary-600 transition-colors truncate">{job.title}</p>
                    <p className="text-xs text-slate-400 truncate">{job.company} · {job.location}</p>
                    <div className="mt-2 flex gap-1.5">
                      <span className="badge bg-slate-100 text-slate-600 capitalize text-xs">{job.jobType}</span>
                      {job.salary?.isVisible && job.salary?.min && (
                        <span className="badge bg-emerald-50 text-emerald-700 text-xs">
                          ${(job.salary.min / 1000).toFixed(0)}k+
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
