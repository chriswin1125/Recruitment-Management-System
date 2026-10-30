import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Users, PlusCircle, TrendingUp, ArrowRight, Eye, Clock } from 'lucide-react';
import { LoadingScreen, StatCard, StatusBadge } from '../common/UI';
import { formatDistanceToNow } from 'date-fns';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, totalApps: 0, views: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/jobs/recruiter/my-jobs', { params: { limit: 6 } });
        const jobList = data.jobs || [];
        setJobs(jobList);
        setStats({
          total: data.pagination?.total || 0,
          active: jobList.filter(j => j.status === 'active').length,
          totalApps: jobList.reduce((s, j) => s + (j.applicationCount || 0), 0),
          views: jobList.reduce((s, j) => s + (j.viewCount || 0), 0),
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

  return (
    <div className="animate-slide-up">
      {/* Header banner */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-700 to-primary-600 p-6 mb-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-52 h-52 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-violet-200 text-sm font-medium mb-1">Recruiter Hub 🎯</p>
          <h1 className="font-display text-2xl font-bold mb-1">Hello, {user?.name?.split(' ')[0]}</h1>
          <p className="text-violet-200 text-sm">Manage your job posts and find top talent</p>
          <div className="flex gap-3 mt-4">
            <Link
              to="/recruiter/jobs/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-violet-700 rounded-xl text-sm font-semibold hover:bg-violet-50 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Post a Job
            </Link>
            <Link
              to="/recruiter/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 text-white rounded-xl text-sm font-semibold hover:bg-white/25 transition-colors"
            >
              <Briefcase className="w-4 h-4" /> My Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Briefcase} label="Total Jobs Posted" value={stats.total} color="blue" />
        <StatCard icon={TrendingUp} label="Active Listings" value={stats.active} color="green" />
        <StatCard icon={Users} label="Total Applicants" value={stats.totalApps} color="purple" />
        <StatCard icon={Eye} label="Total Views" value={stats.views} color="orange" />
      </div>

      {/* Job listings table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-slate-900">Recent Job Posts</h2>
          <Link to="/recruiter/jobs" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="card p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-semibold text-slate-700 mb-2">No jobs posted yet</p>
            <p className="text-sm text-slate-400 mb-5">Post your first job opening to start finding talent</p>
            <Link to="/recruiter/jobs/new" className="btn-primary">
              <PlusCircle className="w-4 h-4" /> Post a Job
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Status</th>
                  <th>Applicants</th>
                  <th>Views</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job._id}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-900">{job.title}</p>
                        <p className="text-xs text-slate-400">{job.location}</p>
                      </div>
                    </td>
                    <td><StatusBadge status={job.status} /></td>
                    <td>
                      <span className="font-medium text-slate-700">{job.applicationCount || 0}</span>
                    </td>
                    <td>
                      <span className="text-slate-500">{job.viewCount || 0}</span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/recruiter/jobs/${job._id}/applicants`}
                        className="text-xs font-medium text-primary-600 hover:underline flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" /> Applicants
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
