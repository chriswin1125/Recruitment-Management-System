import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, DollarSign, Clock, Users, Calendar, ArrowLeft, Building2, CheckCircle, Share2 } from 'lucide-react';
import { LoadingScreen, JobTypeBadge, StatusBadge } from '../components/common/UI';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data.job);
        if (user?.role === 'candidate') {
          try {
            const appRes = await api.get('/applications/my-applications', { params: { limit: 100 } });
            setHasApplied(appRes.data.applications.some(a => a.job?._id === id));
          } catch {}
        }
      } catch {
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!job) return null;

  const salaryStr = job.salary?.isVisible && job.salary?.min
    ? `$${(job.salary.min / 1000).toFixed(0)}k${job.salary.max ? `–$${(job.salary.max / 1000).toFixed(0)}k` : '+'} / ${job.salary.period}`
    : 'Not disclosed';

  return (
    <div className="max-w-5xl">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="card p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-display font-bold text-2xl flex-shrink-0">
                {job.company.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h1 className="font-display text-xl font-bold text-slate-900">{job.title}</h1>
                    <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" /> {job.company}
                    </p>
                  </div>
                  {job.isFeatured && (
                    <span className="badge bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">⭐ Featured</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <JobTypeBadge type={job.jobType} />
                  <span className="badge bg-slate-100 text-slate-600 capitalize">{job.experienceLevel} level</span>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4 border-t border-slate-100">
              {[
                { icon: MapPin, label: 'Location', value: job.location },
                { icon: DollarSign, label: 'Salary', value: salaryStr },
                { icon: Users, label: 'Openings', value: `${job.vacancies} position${job.vacancies > 1 ? 's' : ''}` },
                { icon: Calendar, label: 'Deadline', value: job.deadline ? format(new Date(job.deadline), 'MMM d, yyyy') : 'Open' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-medium text-slate-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-slate-900 mb-4">Job Description</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display font-bold text-slate-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display font-bold text-slate-900 mb-4">Responsibilities</h2>
              <ul className="space-y-2">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display font-bold text-slate-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium border border-primary-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Apply Card */}
          <div className="card p-5 sticky top-4">
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-1">
                Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
              </p>
              <p className="text-sm font-medium text-slate-700">{job.applicationCount || 0} people applied</p>
            </div>

            {user?.role === 'candidate' && (
              <>
                {hasApplied ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Applied</p>
                      <p className="text-xs text-emerald-600">You have applied for this job</p>
                    </div>
                  </div>
                ) : job.status === 'active' ? (
                  <Link to={`/jobs/${job._id}/apply`} className="btn-primary w-full justify-center py-3 text-base">
                    Apply Now
                  </Link>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-center text-sm text-slate-500">
                    This job is no longer accepting applications
                  </div>
                )}
              </>
            )}

            {user?.role === 'recruiter' && job.postedBy?._id === user.id && (
              <div className="space-y-2">
                <Link to={`/recruiter/jobs/${job._id}/applicants`} className="btn-primary w-full justify-center">
                  View Applicants
                </Link>
                <Link to={`/recruiter/jobs/${job._id}/edit`} className="btn-secondary w-full justify-center">
                  Edit Job
                </Link>
              </div>
            )}

            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
              className="btn-ghost w-full mt-3 text-slate-500"
            >
              <Share2 className="w-4 h-4" /> Share Job
            </button>
          </div>

          {/* About Company */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-3">About the Recruiter</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-semibold text-sm">
                {job.postedBy?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{job.postedBy?.name}</p>
                <p className="text-xs text-slate-400">{job.postedBy?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
