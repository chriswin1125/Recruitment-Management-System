import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Users, Download, ChevronDown,
  Mail, Phone, User, Star, Filter
} from 'lucide-react';
import { LoadingScreen, EmptyState, StatusBadge, Pagination } from '../components/common/UI';
import { formatDistanceToNow } from 'date-fns';

const STATUS_OPTIONS = [
  { value: 'reviewing', label: 'Mark Reviewing', color: 'text-yellow-700' },
  { value: 'shortlisted', label: 'Shortlist', color: 'text-violet-700' },
  { value: 'interview', label: 'Schedule Interview', color: 'text-indigo-700' },
  { value: 'offered', label: 'Send Offer', color: 'text-emerald-700' },
  { value: 'hired', label: 'Mark Hired', color: 'text-green-700' },
  { value: 'rejected', label: 'Reject', color: 'text-red-600' },
];

export default function RecruiterApplicantsPage() {
  const { id: jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/applications/job/${jobId}?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ''}`)
      ]);
      setJob(jobRes.data.job);
      setApplications(appsRes.data.applications);
      setPagination(appsRes.data.pagination);
    } catch { toast.error('Failed to load applicants'); }
    finally { setLoading(false); }
  }, [jobId, page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusUpdate = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      toast.success(`Status updated to ${status}`);
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setOpenDropdown(null);
  };

  const handleDownloadResume = async (appId, candidateName) => {
    try {
      const response = await api.get(`/applications/${appId}/resume`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${candidateName}-resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Resume downloaded');
    } catch {
      toast.error('Failed to download resume');
    }
  };

  if (loading) return <LoadingScreen />;

  const statusCounts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <Link to="/recruiter/jobs" className="btn-ghost mb-4 -ml-2 inline-flex">
        <ArrowLeft className="w-4 h-4" />Back to Jobs
      </Link>

      <div className="page-header">
        <h1 className="page-title">{job?.title}</h1>
        <p className="page-subtitle">{job?.company} · {job?.location} · {pagination.total || 0} total applicants</p>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${!statusFilter ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}
        >
          All ({pagination.total || 0})
        </button>
        {Object.entries(statusCounts).map(([s, count]) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}
          >
            {s} ({count})
          </button>
        ))}
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applicants yet"
          description="Applications will appear here when candidates apply."
        />
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <div key={app._id} className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {app.candidate?.name?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{app.candidate?.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Mail className="w-3 h-3" />{app.candidate?.email}
                        </span>
                        {app.candidate?.phone && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Phone className="w-3 h-3" />{app.candidate.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={app.status} />
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs font-medium text-slate-500 mb-1">Cover Letter</p>
                      <p className="text-sm text-slate-700 line-clamp-2">{app.coverLetter}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-xs text-slate-400">
                      Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                    </span>
                    {app.expectedSalary && (
                      <span className="text-xs text-slate-500">· Expected: ${app.expectedSalary.toLocaleString()}/yr</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleDownloadResume(app._id, app.candidate?.name)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      <Download className="w-3.5 h-3.5" />Resume
                    </button>

                    {/* Status dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === app._id ? null : app._id)}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        Update Status <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      {openDropdown === app._id && (
                        <div className="absolute left-0 top-9 bg-white border border-slate-200 rounded-xl shadow-lg z-10 w-48 py-1">
                          {STATUS_OPTIONS.map(({ value, label, color }) => (
                            <button
                              key={value}
                              onClick={() => handleStatusUpdate(app._id, value)}
                              className={`flex items-center gap-2 px-3 py-2 text-sm w-full hover:bg-slate-50 ${color}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/admin/users/${app.candidate?._id}`}
                      className="btn-ghost text-xs py-1.5 px-3"
                    >
                      <User className="w-3.5 h-3.5" />View Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      {openDropdown && <div className="fixed inset-0 z-0" onClick={() => setOpenDropdown(null)} />}
    </div>
  );
}
