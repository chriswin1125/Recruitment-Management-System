import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FileText, Briefcase, MapPin, Calendar, ExternalLink, XCircle, Clock } from 'lucide-react';
import { LoadingScreen, EmptyState, StatusBadge, Pagination } from '../components/common/UI';
import { formatDistanceToNow, format } from 'date-fns';

const STATUS_FILTERS = ['', 'applied', 'reviewing', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'withdrawn'];

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 8 });
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/applications/my-applications?${params}`);
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleWithdraw = async (id) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.put(`/applications/${id}/withdraw`);
      toast.success('Application withdrawn');
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">Track the status of your job applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === s
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <LoadingScreen /> : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Start applying to jobs to see your applications here."
          action={<Link to="/jobs" className="btn-primary">Browse Jobs</Link>}
        />
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app._id} className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {app.job?.title || 'Job no longer available'}
                      </h3>
                      <p className="text-sm text-slate-500">{app.job?.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3 ml-13">
                    {app.job?.location && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />{app.job.location}
                      </span>
                    )}
                    {app.job?.jobType && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 capitalize">
                        <Briefcase className="w-3 h-3" />{app.job.jobType}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge status={app.status} />
                  <div className="flex items-center gap-1">
                    {app.job?._id && (
                      <Link to={`/jobs/${app.job._id}`} className="btn-ghost py-1 px-2 text-xs">
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Job
                      </Link>
                    )}
                    {!['hired', 'rejected', 'withdrawn'].includes(app.status) && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        className="btn-ghost py-1 px-2 text-xs text-red-500 hover:bg-red-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status timeline */}
              {app.statusHistory?.length > 1 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-400 mb-2">Status History</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {app.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <StatusBadge status={h.status} />
                        {i < app.statusHistory.length - 1 && (
                          <span className="text-slate-300 text-xs">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
