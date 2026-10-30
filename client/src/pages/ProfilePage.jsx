import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  User, MapPin, Globe, Linkedin, Github, Upload,
  Plus, Trash2, Save, Briefcase, GraduationCap, Star, FileText
} from 'lucide-react';
import { LoadingScreen } from '../components/common/UI';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [profile, setProfile] = useState({
    name: '', phone: '', headline: '', bio: '', location: '',
    website: '', linkedin: '', github: '',
    skills: [], experience: [], education: [],
    expectedSalary: '', jobType: 'full-time'
  });
  const [skillInput, setSkillInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeInfo, setResumeInfo] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/users/profile');
        const p = data.profile;
        setProfile({
          name: p.user?.name || '',
          phone: p.user?.phone || '',
          headline: p.headline || '',
          bio: p.bio || '',
          location: p.location || '',
          website: p.website || '',
          linkedin: p.linkedin || '',
          github: p.github || '',
          skills: p.skills || [],
          experience: p.experience || [],
          education: p.education || [],
          expectedSalary: p.expectedSalary || '',
          jobType: p.jobType || 'full-time'
        });
        if (p.resume?.originalName) setResumeInfo(p.resume);
      } catch { toast.error('Failed to load profile'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/profile', profile);
      updateUser({ name: profile.name });
      toast.success('Profile saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', resumeFile);
      const { data } = await api.post('/users/upload-resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeInfo(data.resume);
      setResumeFile(null);
      toast.success('Resume uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !profile.skills.includes(skill)) {
      setProfile(p => ({ ...p, skills: [...p.skills, skill] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setProfile(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));

  const addExperience = () => setProfile(p => ({
    ...p,
    experience: [...p.experience, { title: '', company: '', location: '', from: '', to: '', current: false, description: '' }]
  }));

  const updateExperience = (i, field, value) => {
    const exp = [...profile.experience];
    exp[i] = { ...exp[i], [field]: value };
    setProfile(p => ({ ...p, experience: exp }));
  };

  const removeExperience = (i) => setProfile(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));

  const addEducation = () => setProfile(p => ({
    ...p,
    education: [...p.education, { school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false }]
  }));

  const updateEducation = (i, field, value) => {
    const edu = [...profile.education];
    edu[i] = { ...edu[i], [field]: value };
    setProfile(p => ({ ...p, education: edu }));
  };

  const removeEducation = (i) => setProfile(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));

  if (loading) return <LoadingScreen />;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'skills', label: 'Skills', icon: Star },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'resume', label: 'Resume', icon: FileText },
  ];

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Keep your profile up to date to attract recruiters</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="card p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {profile.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{profile.name || 'Your Name'}</h2>
          <p className="text-sm text-slate-500">{profile.headline || 'Add your professional headline'}</p>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1 border border-slate-200 w-fit flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Professional Headline</label>
              <input className="input" value={profile.headline} onChange={e => setProfile(p => ({ ...p, headline: e.target.value }))} placeholder="Senior React Developer at TechCorp" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Bio</label>
              <textarea className="input min-h-[100px] resize-y" value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell recruiters about yourself..." />
            </div>
            <div>
              <label className="label"><MapPin className="w-3.5 h-3.5 inline mr-1" />Location</label>
              <input className="input" value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} placeholder="San Francisco, CA" />
            </div>
            <div>
              <label className="label">Expected Salary (USD/year)</label>
              <input type="number" className="input" value={profile.expectedSalary} onChange={e => setProfile(p => ({ ...p, expectedSalary: e.target.value }))} placeholder="80000" />
            </div>
            <div>
              <label className="label"><Globe className="w-3.5 h-3.5 inline mr-1" />Website</label>
              <input className="input" value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} placeholder="https://yourwebsite.com" />
            </div>
            <div>
              <label className="label">Job Type Preference</label>
              <select className="input" value={profile.jobType} onChange={e => setProfile(p => ({ ...p, jobType: e.target.value }))}>
                {['full-time', 'part-time', 'contract', 'freelance', 'internship'].map(t => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label"><Linkedin className="w-3.5 h-3.5 inline mr-1" />LinkedIn URL</label>
              <input className="input" value={profile.linkedin} onChange={e => setProfile(p => ({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/yourprofile" />
            </div>
            <div>
              <label className="label"><Github className="w-3.5 h-3.5 inline mr-1" />GitHub URL</label>
              <input className="input" value={profile.github} onChange={e => setProfile(p => ({ ...p, github: e.target.value }))} placeholder="https://github.com/yourusername" />
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-4">Your Skills</h3>
            <div className="flex gap-2 mb-4">
              <input
                className="input flex-1"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill (e.g. React, Python, SQL)"
              />
              <button onClick={addSkill} className="btn-primary px-4">
                <Plus className="w-4 h-4" />Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-200">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {profile.skills.length === 0 && (
                <p className="text-sm text-slate-400">No skills added yet. Add your top skills above.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Work Experience</h3>
              <button onClick={addExperience} className="btn-secondary text-sm">
                <Plus className="w-4 h-4" />Add Experience
              </button>
            </div>
            <div className="space-y-6">
              {profile.experience.map((exp, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-end">
                    <button onClick={() => removeExperience(i)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="label">Job Title</label>
                      <input className="input" value={exp.title} onChange={e => updateExperience(i, 'title', e.target.value)} placeholder="Software Engineer" />
                    </div>
                    <div>
                      <label className="label">Company</label>
                      <input className="input" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} placeholder="Google" />
                    </div>
                    <div>
                      <label className="label">Location</label>
                      <input className="input" value={exp.location} onChange={e => updateExperience(i, 'location', e.target.value)} placeholder="Mountain View, CA" />
                    </div>
                    <div>
                      <label className="label">From</label>
                      <input type="date" className="input" value={exp.from ? exp.from.slice(0, 10) : ''} onChange={e => updateExperience(i, 'from', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">To</label>
                      <input type="date" className="input" value={exp.to ? exp.to.slice(0, 10) : ''} onChange={e => updateExperience(i, 'to', e.target.value)} disabled={exp.current} />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <input type="checkbox" id={`current-${i}`} checked={exp.current} onChange={e => updateExperience(i, 'current', e.target.checked)} className="w-4 h-4 accent-primary-600" />
                      <label htmlFor={`current-${i}`} className="text-sm text-slate-600">Currently working here</label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Description</label>
                      <textarea className="input min-h-[80px] resize-y" value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} placeholder="Describe your role and achievements..." />
                    </div>
                  </div>
                </div>
              ))}
              {profile.experience.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">No experience added yet.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Education</h3>
              <button onClick={addEducation} className="btn-secondary text-sm">
                <Plus className="w-4 h-4" />Add Education
              </button>
            </div>
            <div className="space-y-6">
              {profile.education.map((edu, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-end">
                    <button onClick={() => removeEducation(i)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="label">School / University</label>
                      <input className="input" value={edu.school} onChange={e => updateEducation(i, 'school', e.target.value)} placeholder="MIT" />
                    </div>
                    <div>
                      <label className="label">Degree</label>
                      <input className="input" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} placeholder="Bachelor's" />
                    </div>
                    <div>
                      <label className="label">Field of Study</label>
                      <input className="input" value={edu.fieldOfStudy} onChange={e => updateEducation(i, 'fieldOfStudy', e.target.value)} placeholder="Computer Science" />
                    </div>
                    <div>
                      <label className="label">From</label>
                      <input type="date" className="input" value={edu.from ? edu.from.slice(0, 10) : ''} onChange={e => updateEducation(i, 'from', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">To</label>
                      <input type="date" className="input" value={edu.to ? edu.to.slice(0, 10) : ''} onChange={e => updateEducation(i, 'to', e.target.value)} disabled={edu.current} />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <input type="checkbox" id={`edu-current-${i}`} checked={edu.current} onChange={e => updateEducation(i, 'current', e.target.checked)} className="w-4 h-4 accent-primary-600" />
                      <label htmlFor={`edu-current-${i}`} className="text-sm text-slate-600">Currently studying</label>
                    </div>
                  </div>
                </div>
              ))}
              {profile.education.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">No education added yet.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'resume' && (
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-4">Resume / CV</h3>
            {resumeInfo && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">{resumeInfo.originalName}</p>
                  <p className="text-xs text-green-600">Uploaded successfully</p>
                </div>
              </div>
            )}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700 mb-1">Upload your resume</p>
              <p className="text-xs text-slate-400 mb-4">PDF or Word document, max 5MB</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={e => setResumeFile(e.target.files[0])}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="btn-secondary cursor-pointer inline-flex">
                Choose File
              </label>
              {resumeFile && (
                <div className="mt-3">
                  <p className="text-sm text-slate-600 mb-2">Selected: {resumeFile.name}</p>
                  <button onClick={handleResumeUpload} disabled={uploading} className="btn-primary">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Resume'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
