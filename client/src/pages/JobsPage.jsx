import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Briefcase, Clock, DollarSign, Filter, X, ChevronRight } from 'lucide-react';
import { LoadingScreen, EmptyState, Pagination, JobTypeBadge, StatusBadge } from '../components/common/UI';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = ['All', 'Technology', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations', 'Design', 'Engineering', 'Healthcare', 'Education', 'Legal', 'Other'];
const JOB_TYPES = ['', 'full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote'];
const EXP_LEVELS = ['', 'entry', 'mid', 'senior', 'lead', 'executive'];

export default function JobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ search: '', category: '', jobType: '', experienceLevel: '', location: '', page: 1 });
  const [showFilters, setShowFilters] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 12 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await api.get('/jobs', { params });
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(f => ({ ...f, search: inputVal, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', jobType: '', experienceLevel: '', location: '', page: 1 });
    setInputVal('');
  };

  const hasFilters = filters.search || filters.category || filters.jobType || filters.experienceLevel || filters.location;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Explore Jobs</h1>
        <p className="page-subtitle">Discover your next career opportunity</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="card p-4 mb-6 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search jobs, companies, skills..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-10 w-44"
            placeholder="Location"
            value={filters.location}
            onChange={e => setFilters(f => ({ ...f, location: e.target.value, page: 1 }))}
          />
        </div>
        <button type="submit" className="btn-primary px-6">Search</button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary gap-2 ${showFilters ? 'bg-slate-100' : ''}`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </form>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="card p-4 mb-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Job Type</label>
              <select className="input" value={filters.jobType} onChange={e => setFilters(f => ({ ...f, jobType: e.target.value, page: 1 }))}>
                <option value="">All Types</option>
                {JOB_TYPES.slice(1).map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Experience Level</label>
              <select className="input" value={filters.experienceLevel} onChange={e => setFilters(f => ({ ...f, experienceLevel: e.target.value, page: 1 }))}>
                <option value="">All Levels</option>
                {EXP_LEVELS.slice(1).map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}>
                {CATEGORIES.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilters(f => ({ ...f, category: cat === 'All' ? '' : cat, page: 1 }))}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
              (cat === 'All' && !filters.category) || filters.category === cat
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            {cat}
          </button>
        ))}
        {hasFilters && (
          <button onClick={clearFilters} className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 border border-red-200 whitespace-nowrap flex items-center gap-1 flex-shrink-0">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-slate-500 mb-4">
          Found <span className="font-semibold text-slate-800">{pagination.total || 0}</span> jobs
        </p>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <LoadingScreen />
      ) : jobs.length === 0 ? (
        <div className="card">
          <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting your search filters to find more opportunities." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {jobs.map(job => (
              <JobCard key={job._id} job={job} user={user} navigate={navigate} />
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={p => setFilters(f => ({ ...f, page: p }))} />
        </>
      )}
    </div>
  );
}

function JobCard({ job, user, navigate }) {
  const salaryStr = job.salary?.isVisible && job.salary?.min
    ? `$${(job.salary.min / 1000).toFixed(0)}k${job.salary.max ? `–$${(job.salary.max / 1000).toFixed(0)}k` : '+'}`
    : null;

  return (
    <div
      className="card p-5 hover:shadow-card-hover transition-all duration-200 cursor-pointer group animate-fade-in"
      onClick={() => navigate(`/jobs/${job._id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-display font-bold text-lg flex-shrink-0">
          {job.company.charAt(0)}
        </div>
        {job.isFeatured && (
          <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-xs">
            ⭐ Featured
          </span>
        )}
      </div>

      <h3 className="font-semibold text-slate-900 text-base mb-0.5 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
        {job.title}
      </h3>
      <p className="text-sm text-slate-500 mb-3">{job.company}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <JobTypeBadge type={job.jobType} />
        <span className="badge bg-slate-100 text-slate-600 capitalize">{job.experienceLevel}</span>
        {job.category && <span className="badge bg-slate-100 text-slate-600">{job.category}</span>}
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        {salaryStr && (
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{salaryStr} / year</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">{job.applicationCount || 0} applicants</span>
        <span className="text-xs font-medium text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          View details <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
