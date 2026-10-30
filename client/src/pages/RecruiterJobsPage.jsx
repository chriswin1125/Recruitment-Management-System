import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Briefcase, PlusCircle, Edit2, Trash2, Users,
  Eye, MoreVertical, MapPin, Clock, TrendingUp
} from 'lucide-react';
import { LoadingScreen, EmptyState, StatusBadge, Pagination } from '../components/common/UI';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS = {
  active: 'text-green-600 bg-green-50',
  draft: 'text-slate-500 bg-slate-100',
  closed: 'text-red-500 bg-red-50',
  pending: 'text-yellow-600 bg-yellow-50',
};

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/jobs/recruiter/my-jobs?${params}`);
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this job? All applications will also be removed.')) return;
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job deleted');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
    setOpenMenu(null);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/jobs/${id}`, { status });
      toast.success(`Job marked as ${status}`);
      fetchJobs();
    } catch { toast.error('Failed to update status'); }
    setOpenMenu(null);
  };

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">My Job Posts</h1>
          <p className="page-subtitle">Manage your job listings and view applicants</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn-primary">
          <PlusCircle className="w-4 h-4" />Post New Job
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Jobs', value: pagination.total || 0, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active', value: jobs.filter(j => j.status === 'active').length, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Total Applicants', value: jobs.reduce((acc, j) => acc + (j.applicationCount || 0), 0), icon: Users, color: 'text-purple-600 bg-purple-50' },
          { label: 'Closed', value: jobs.filter(j => j.status === 'closed').length, icon: Clock, color: 'text-slate-500 bg-slate-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['', 'active', 'draft', 'closed'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <LoadingScreen /> : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Create your first job listing to start receiving applications."
          action={<Link to="/recruiter/jobs/new" className="btn-primary">Post Your First Job</Link>}
        />
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job._id} className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{job.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />{job.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[job.status] || 'bg-slate-100 text-slate-600'}`}>
                        {job.status}
                      </span>

                      {/* Actions Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === job._id ? null : job._id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </button>
                        {openMenu === job._id && (
                          <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-10 w-44 py-1" onClick={e => e.stopPropagation()}>
                            <Link
                              to={`/recruiter/jobs/${job._id}/applicants`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Users className="w-3.5 h-3.5" />View Applicants
                            </Link>
                            <Link
                              to={`/jobs/${job._id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="w-3.5 h-3.5" />Preview Listing
                            </Link>
                            <Link
                              to={`/recruiter/jobs/${job._id}/edit`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Edit2 className="w-3.5 h-3.5" />Edit Job
                            </Link>
                            {job.status === 'active' ? (
                              <button onClick={() => handleStatusChange(job._id, 'closed')} className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 w-full">
                                <Clock className="w-3.5 h-3.5" />Close Job
                              </button>
                            ) : (
                              <button onClick={() => handleStatusChange(job._id, 'active')} className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 w-full">
                                <TrendingUp className="w-3.5 h-3.5" />Reopen Job
                              </button>
                            )}
                            <button onClick={() => handleDelete(job._id)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full border-t border-slate-100">
                              <Trash2 className="w-3.5 h-3.5" />Delete Job
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <Link
                      to={`/recruiter/jobs/${job._id}/applicants`}
                      className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Users className="w-4 h-4" />
                      {job.applicationCount || 0} applicant{job.applicationCount !== 1 ? 's' : ''}
                    </Link>
                    <span className="text-xs text-slate-400 capitalize">{job.jobType} · {job.experienceLevel} level</span>
                    {job.salary?.min && (
                      <span className="text-xs text-slate-500">
                        ${job.salary.min.toLocaleString()}–${job.salary.max?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      {/* Close menu on outside click */}
      {openMenu && <div className="fixed inset-0 z-0" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
