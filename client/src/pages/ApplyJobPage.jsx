import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, FileText, CheckCircle } from 'lucide-react';
import { LoadingScreen } from '../components/common/UI';

export default function ApplyJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [profileResume, setProfileResume] = useState(null);
  const [form, setForm] = useState({ coverLetter: '', expectedSalary: '', availableFrom: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [jobRes, profileRes] = await Promise.all([
          api.get(`/jobs/${id}`),
          api.get('/users/profile').catch(() => null)
        ]);
        setJob(jobRes.data.job);
        if (profileRes?.data?.profile?.resume?.filename) {
          setProfileResume(profileRes.data.profile.resume);
        }
      } catch {
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile && !profileResume) {
      toast.error('Please upload a resume or add one to your profile');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('jobId', id);
      if (form.coverLetter) formData.append('coverLetter', form.coverLetter);
      if (form.expectedSalary) formData.append('expectedSalary', form.expectedSalary);
      if (form.availableFrom) formData.append('availableFrom', form.availableFrom);
      if (resumeFile) formData.append('resume', resumeFile);

      await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Application submitted successfully!');
      navigate('/my-applications');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!job) return null;

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="page-header">
        <h1 className="page-title">Apply for Position</h1>
        <p className="page-subtitle">{job.title} at {job.company}</p>
      </div>

      {/* Job Summary */}
      <div className="card p-4 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-display font-bold text-xl flex-shrink-0">
          {job.company.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{job.title}</h3>
          <p className="text-sm text-slate-500">{job.company} · {job.location}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resume Upload */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-600" /> Resume
          </h3>

          {profileResume && !resumeFile && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-800">Using profile resume</p>
                <p className="text-xs text-emerald-600 truncate">{profileResume.originalName}</p>
              </div>
              <button
                type="button"
                className="text-xs text-emerald-700 hover:underline"
                onClick={() => setProfileResume(null)}
              >
                Change
              </button>
            </div>
          )}

          {(!profileResume || resumeFile) && (
            <label className="block">
              <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                resumeFile ? 'border-primary-300 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
              }`}>
                {resumeFile ? (
                  <div className="flex items-center justify-center gap-2 text-primary-700">
                    <FileText className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{resumeFile.name}</p>
                      <p className="text-xs text-primary-500">{(resumeFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">Click to upload resume</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={e => setResumeFile(e.target.files[0] || null)}
              />
            </label>
          )}
        </div>

        {/* Cover Letter */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Cover Letter <span className="text-slate-400 font-normal text-sm">(optional)</span></h3>
          <textarea
            className="input min-h-32 resize-none"
            placeholder="Tell the employer why you're a great fit for this role..."
            value={form.coverLetter}
            onChange={e => setForm({ ...form, coverLetter: e.target.value })}
            maxLength={3000}
          />
          <p className="text-xs text-slate-400 mt-1.5 text-right">{form.coverLetter.length}/3000</p>
        </div>

        {/* Additional Info */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Additional Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Expected Salary (USD/year)</label>
              <input
                type="number"
                className="input"
                placeholder="e.g. 80000"
                value={form.expectedSalary}
                onChange={e => setForm({ ...form, expectedSalary: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Available From</label>
              <input
                type="date"
                className="input"
                value={form.availableFrom}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({ ...form, availableFrom: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3">
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
