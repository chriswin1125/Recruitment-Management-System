import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Search, CheckCircle, XCircle, Trash2, Eye, MapPin } from 'lucide-react';
import { LoadingScreen, EmptyState, StatusBadge, Pagination } from '../components/common/UI';
import { formatDistanceToNow } from 'date-fns';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (statusFilter) params.append('status', statusFilter);
      else params.append('status', 'all');
      if (search) params.append('search', search);

      // Use admin endpoint to get all jobs regardless of status
      const { data } = await api.get(`/jobs?${params}&status=${statusFilter || 'active'}`);
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleStatusUpdate = async (jobId, status) => {
    try {
      await api.put(`/admin/jobs/${jobId}/status`, { status });
      toast.success(`Job ${status}`);
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status } : j));
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (jobId, title) => {
    if (!confirm(`Delete job "${title}"? All applications will be removed.`)) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted');
      fetchJobs();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Jobs</h1>
        <p className="page-subtitle">Review, approve, and manage all job listings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9" placeholder="Search jobs..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary px-4">Search</button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {['', 'active', 'closed', 'draft'].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${
                statusFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {s === '' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingScreen /> : jobs.length === 0 ? (
        <EmptyState icon={Search} title="No jobs found" description="Try adjusting your filters." />
      ) : (
        <>
          <div className="table-container mb-4">
            <table className="table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Recruiter</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j._id}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-800">{j.title}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />{j.location}
                        </p>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-slate-700">{j.postedBy?.name || '—'}</p>
                      <p className="text-xs text-slate-400">{j.company}</p>
                    </td>
                    <td>
                      <span className="badge bg-slate-100 text-slate-600 text-xs">{j.category}</span>
                    </td>
                    <td><StatusBadge status={j.status} /></td>
                    <td className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(j.createdAt), { addSuffix: true })}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link to={`/jobs/${j._id}`} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" title="Preview">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {j.status !== 'active' && (
                          <button
                            onClick={() => handleStatusUpdate(j._id, 'active')}
                            title="Activate"
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {j.status === 'active' && (
                          <button
                            onClick={() => handleStatusUpdate(j._id, 'closed')}
                            title="Close"
                            className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(j._id, j.title)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
