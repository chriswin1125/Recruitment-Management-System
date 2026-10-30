import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { LoadingScreen } from '../components/common/UI';

const CATEGORIES = ['Technology', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations', 'Design', 'Engineering', 'Healthcare', 'Education', 'Legal', 'Other'];

const defaultForm = {
  title: '', company: '', description: '',
  requirements: [''], responsibilities: [''], skills: '',
  location: '', jobType: 'full-time', experienceLevel: 'mid',
  category: 'Technology', vacancies: 1,
  salary: { min: '', max: '', currency: 'USD', period: 'yearly', isVisible: true },
  status: 'active', tags: '',
};

export default function RecruiterJobFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/jobs/${id}`).then(({ data }) => {
      const j = data.job;
      setForm({
        ...j,
        skills: Array.isArray(j.skills) ? j.skills.join(', ') : '',
        tags: Array.isArray(j.tags) ? j.tags.join(', ') : '',
        requirements: j.requirements?.length ? j.requirements : [''],
        responsibilities: j.responsibilities?.length ? j.responsibilities : [''],
        salary: j.salary || defaultForm.salary,
      });
    }).catch(() => toast.error('Failed to load job'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const setSalary = (field, value) => setForm(f => ({ ...f, salary: { ...f.salary, [field]: value } }));

  const addListItem = (field) => setForm(f => ({ ...f, [field]: [...f[field], ''] }));
  const updateListItem = (field, i, value) => {
    const arr = [...form[field]];
    arr[i] = value;
    setForm(f => ({ ...f, [field]: arr }));
  };
  const removeListItem = (field, i) => setForm(f => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        requirements: form.requirements.filter(Boolean),
        responsibilities: form.responsibilities.filter(Boolean),
      };
      if (isEdit) {
        await api.put(`/jobs/${id}`, payload);
        toast.success('Job updated successfully!');
      } else {
        await api.post('/jobs', payload);
        toast.success('Job posted successfully!');
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4" />Back
        </button>
        <h1 className="page-title">{isEdit ? 'Edit Job Listing' : 'Post a New Job'}</h1>
        <p className="page-subtitle">{isEdit ? 'Update the details of your job listing' : 'Fill in the details to attract the right candidates'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Job Title *</label>
              <input className="input" required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Senior React Developer" />
            </div>
            <div>
              <label className="label">Company Name *</label>
              <input className="input" required value={form.company} onChange={e => set('company', e.target.value)} placeholder="Your company name" />
            </div>
            <div>
              <label className="label">Location *</label>
              <input className="input" required value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. San Francisco, CA or Remote" />
            </div>
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Job Type</label>
              <select className="input" value={form.jobType} onChange={e => set('jobType', e.target.value)}>
                {['full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote'].map(t => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Experience Level</label>
              <select className="input" value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                {['entry', 'mid', 'senior', 'lead', 'executive'].map(l => (
                  <option key={l} value={l} className="capitalize">{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Number of Vacancies</label>
              <input type="number" className="input" min="1" value={form.vacancies} onChange={e => set('vacancies', e.target.value)} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {['active', 'draft', 'closed'].map(s => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Job Description</h2>
          <textarea
            className="input min-h-[140px] resize-y"
            required
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Describe the role, team culture, and what makes this opportunity unique..."
          />
        </div>

        {/* Requirements & Responsibilities */}
        {[
          { field: 'requirements', label: 'Requirements', placeholder: 'e.g. 3+ years of React experience' },
          { field: 'responsibilities', label: 'Responsibilities', placeholder: 'e.g. Build scalable UI components' }
        ].map(({ field, label, placeholder }) => (
          <div key={field} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">{label}</h2>
              <button type="button" onClick={() => addListItem(field)} className="btn-secondary text-sm py-1.5">
                <Plus className="w-3.5 h-3.5" />Add
              </button>
            </div>
            <div className="space-y-2">
              {form[field].map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input flex-1"
                    value={item}
                    onChange={e => updateListItem(field, i, e.target.value)}
                    placeholder={placeholder}
                  />
                  {form[field].length > 1 && (
                    <button type="button" onClick={() => removeListItem(field, i)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Skills & Tags */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Skills & Tags</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Required Skills (comma separated)</label>
              <input className="input" value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="React, TypeScript, Node.js, GraphQL" />
            </div>
            <div>
              <label className="label">Tags (comma separated)</label>
              <input className="input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="startup, remote-friendly, equity" />
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Compensation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Min Salary</label>
              <input type="number" className="input" value={form.salary.min} onChange={e => setSalary('min', e.target.value)} placeholder="80000" />
            </div>
            <div>
              <label className="label">Max Salary</label>
              <input type="number" className="input" value={form.salary.max} onChange={e => setSalary('max', e.target.value)} placeholder="120000" />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.salary.currency} onChange={e => setSalary('currency', e.target.value)}>
                {['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Period</label>
              <select className="input" value={form.salary.period} onChange={e => setSalary('period', e.target.value)}>
                {['hourly', 'monthly', 'yearly'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input type="checkbox" id="salary-visible" checked={form.salary.isVisible} onChange={e => setSalary('isVisible', e.target.checked)} className="w-4 h-4 accent-primary-600" />
            <label htmlFor="salary-visible" className="text-sm text-slate-600">Show salary on listing</label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary px-8">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEdit ? 'Update Job' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
