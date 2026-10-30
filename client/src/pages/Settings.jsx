import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  User, Lock, Bell, Shield, Camera, Eye, EyeOff,
  Save, Loader2, AlertTriangle, LogOut, Trash2,
  CheckCircle, Upload, Phone, Mail, ChevronRight
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────
const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User   },
  { id: 'security',      label: 'Security',       icon: Lock   },
  { id: 'notifications', label: 'Notifications',  icon: Bell   },
  { id: 'account',       label: 'Account',        icon: Shield },
];

function Alert({ type = 'success', message, onClose }) {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error:   'bg-red-50   border-red-200   text-red-800',
  };
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${styles[type]} animate-fade-in`}>
      {type === 'success'
        ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        : <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none">×</button>
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40 ${
        checked ? 'bg-primary-600' : 'bg-slate-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── Tab: Profile ────────────────────────────────────────────
function ProfileTab({ user, onUserUpdate }) {
  const fileRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
      setPreview(user.profileImage || user.avatar || null);
    }
  }, [user]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = 'Please enter a valid email address';
    if (form.phone && form.phone.trim() && !/^[+]?[\d\s\-().]{7,20}$/.test(form.phone.trim()))
      errs.phone = 'Please enter a valid phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2 MB');
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('email', form.email.trim());
      fd.append('phone', form.phone.trim());
      if (file) fd.append('profileImage', file);

      const { data } = await api.put('/users/update-profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onUserUpdate(data.user);
      setFile(null);
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
      toast.success('Profile saved');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const avatarLetter = (form.name || user?.name || '?').charAt(0).toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900 mb-1">Profile Information</h2>
        <p className="text-sm text-slate-500">Update your name, email, and photo</p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center flex-shrink-0">
            {preview
              ? <img src={preview.startsWith('data:') ? preview : preview} alt="Avatar" className="w-full h-full object-cover" />
              : <span className="text-3xl font-display font-bold text-white">{avatarLetter}</span>
            }
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-secondary text-sm gap-2"
          >
            <Upload className="w-4 h-4" /> Change Photo
          </button>
          <p className="text-xs text-slate-400 mt-1.5">JPEG, PNG, WebP or GIF · Max 2 MB</p>
          {file && <p className="text-xs text-primary-600 mt-1">📎 {file.name}</p>}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name <span className="text-red-500">*</span></label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className={`input pl-10 ${errors.name ? 'border-red-400 focus:ring-red-300/30' : ''}`}
              placeholder="John Smith"
              value={form.name}
              onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="label">Email Address <span className="text-red-500">*</span></label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              className={`input pl-10 ${errors.email ? 'border-red-400 focus:ring-red-300/30' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="label">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              className={`input pl-10 ${errors.phone ? 'border-red-400 focus:ring-red-300/30' : ''}`}
              placeholder="+1 555 000 0000"
              value={form.phone}
              onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="label">Role</label>
          <div className="input bg-slate-50 text-slate-500 capitalize flex items-center">
            {user?.role || '—'}
            <span className="ml-auto text-xs text-slate-400">read-only</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary gap-2 px-8">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

// ─── Tab: Security ───────────────────────────────────────────
function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required';
    if (!form.newPassword) errs.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) errs.newPassword = 'Must be at least 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your new password';
    else if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (form.currentPassword && form.currentPassword === form.newPassword)
      errs.newPassword = 'New password must be different from current';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const strength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let s = 0;
    if (pwd.length >= 8)   s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    const map = [
      { label: '', color: '' },
      { label: 'Weak',   color: 'bg-red-400'    },
      { label: 'Fair',   color: 'bg-amber-400'  },
      { label: 'Good',   color: 'bg-yellow-400' },
      { label: 'Strong', color: 'bg-emerald-500' },
    ];
    return { score: s, ...map[s] };
  };

  const pwdStrength = strength(form.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await api.put('/users/change-password', form);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setAlert({ type: 'success', message: 'Password changed successfully!' });
      toast.success('Password updated');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const PasswordField = ({ id, label, field, showKey }) => (
    <div>
      <label className="label">{label} <span className="text-red-500">*</span></label>
      <div className="relative">
        <input
          type={show[showKey] ? 'text' : 'password'}
          className={`input pr-11 ${errors[field] ? 'border-red-400 focus:ring-red-300/30' : ''}`}
          placeholder="••••••••"
          value={form[field]}
          onChange={e => { setForm({ ...form, [field]: e.target.value }); setErrors({ ...errors, [field]: '' }); }}
        />
        <button
          type="button"
          onClick={() => setShow({ ...show, [showKey]: !show[showKey] })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900 mb-1">Change Password</h2>
        <p className="text-sm text-slate-500">Use a strong password you don't use elsewhere</p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <PasswordField label="Current Password"  field="currentPassword" showKey="current" />
      <PasswordField label="New Password"       field="newPassword"     showKey="new"     />

      {/* Strength meter */}
      {form.newPassword && (
        <div className="-mt-2">
          <div className="flex gap-1 mb-1">
            {[1,2,3,4].map(i => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= pwdStrength.score ? pwdStrength.color : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          {pwdStrength.label && (
            <p className="text-xs text-slate-500">Password strength: <span className="font-medium">{pwdStrength.label}</span></p>
          )}
        </div>
      )}

      <PasswordField label="Confirm New Password" field="confirmPassword" showKey="confirm" />

      <div className="pt-2 bg-slate-50 rounded-xl p-4 border border-slate-100">
        <p className="text-xs font-semibold text-slate-700 mb-2">Password requirements</p>
        <ul className="space-y-1">
          {[
            ['At least 6 characters',           form.newPassword.length >= 6],
            ['Contains a number',                /[0-9]/.test(form.newPassword)],
            ['Contains an uppercase letter',     /[A-Z]/.test(form.newPassword)],
            ['Contains a special character',     /[^A-Za-z0-9]/.test(form.newPassword)],
          ].map(([rule, met]) => (
            <li key={rule} className={`text-xs flex items-center gap-2 ${met && form.newPassword ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[9px] flex-shrink-0 ${met && form.newPassword ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                {met && form.newPassword ? '✓' : ''}
              </span>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary gap-2 px-8">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </form>
  );
}

// ─── Tab: Notifications ──────────────────────────────────────
function NotificationsTab({ user }) {
  const defaultPrefs = {
    emailNotifications: true,
    jobAlerts: true,
    applicationUpdates: true,
    marketingEmails: false,
  };
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPrefs({ ...defaultPrefs, ...user.notificationPreferences });
    }
  }, [user]);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setAlert(null);
    setLoading(true);
    try {
      await api.put('/users/notification-preferences', prefs);
      setAlert({ type: 'success', message: 'Notification preferences saved!' });
      toast.success('Preferences saved');
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to save preferences' });
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'emailNotifications',
      label: 'Email notifications',
      desc: 'Receive important updates via email',
      icon: '📧',
    },
    {
      key: 'jobAlerts',
      label: 'Job alerts',
      desc: 'Get notified about new job postings matching your profile',
      icon: '💼',
      roles: ['candidate'],
    },
    {
      key: 'applicationUpdates',
      label: 'Application updates',
      desc: 'Updates when your application status changes',
      icon: '📋',
      roles: ['candidate'],
    },
    {
      key: 'marketingEmails',
      label: 'Marketing emails',
      desc: 'Occasional product updates and newsletters',
      icon: '📣',
    },
  ];

  const visibleItems = items.filter(i => !i.roles || i.roles.includes(user?.role));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900 mb-1">Notification Preferences</h2>
        <p className="text-sm text-slate-500">Choose what you want to be notified about</p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="space-y-3">
        {visibleItems.map(({ key, label, desc, icon }) => (
          <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/60 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </div>
            <ToggleSwitch
              checked={prefs[key] ?? false}
              onChange={() => toggle(key)}
              disabled={loading}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={loading} className="btn-primary gap-2 px-8">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Saving…' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Account ────────────────────────────────────────────
function AccountTab({ user }) {
  const { logout } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeletePw, setShowDeletePw] = useState(false);

  const handleLogoutAll = async () => {
    if (!confirm('This will log you out of all devices including this one. Continue?')) return;
    setLogoutLoading(true);
    try {
      await api.post('/users/logout-all');
      toast.success('Logged out from all devices');
      setTimeout(() => logout(), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to logout from all devices');
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    if (!deletePassword) { setDeleteError('Please enter your password'); return; }
    setDeleteLoading(true);
    try {
      await api.delete('/users/delete-account', { data: { password: deletePassword } });
      toast.success('Account deleted');
      setTimeout(() => logout(), 1200);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900 mb-1">Account Settings</h2>
        <p className="text-sm text-slate-500">Manage session security and account lifecycle</p>
      </div>

      {/* Account summary */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-500 mb-2">Signed in as</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email} · <span className="capitalize">{user?.role}</span></p>
          </div>
        </div>
      </div>

      {/* Logout all devices */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900 text-sm">Logout from all devices</p>
            <p className="text-xs text-slate-500 mt-1">
              Invalidates all active sessions everywhere — you'll need to log in again on each device.
            </p>
          </div>
          <button
            onClick={handleLogoutAll}
            disabled={logoutLoading}
            className="btn-secondary shrink-0 gap-2 text-sm"
          >
            {logoutLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <LogOut className="w-4 h-4" />}
            {logoutLoading ? 'Logging out…' : 'Logout All'}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border-2 border-red-200 bg-red-50/40 p-5">
        <p className="font-semibold text-red-800 text-sm mb-1 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </p>
        <p className="text-xs text-red-600 mb-4">
          Deleting your account is permanent and cannot be undone. All your data will be removed.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn-danger gap-2 text-sm"
        >
          <Trash2 className="w-4 h-4" /> Delete My Account
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }}
          />
          <div className="relative card p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900">Delete Account</h3>
                <p className="text-xs text-slate-500">This cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-5">
              All your data — profile, applications, and settings — will be permanently deleted.
              Enter your password to confirm.
            </p>

            <div className="mb-4">
              <label className="label">Your Password</label>
              <div className="relative">
                <input
                  type={showDeletePw ? 'text' : 'password'}
                  className={`input pr-11 ${deleteError ? 'border-red-400' : ''}`}
                  placeholder="Enter your current password"
                  value={deletePassword}
                  onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePw(!showDeletePw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showDeletePw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {deleteError && <p className="text-xs text-red-500 mt-1">{deleteError}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="btn-danger flex-1 gap-2"
              >
                {deleteLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />}
                {deleteLoading ? 'Deleting…' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Settings Page ──────────────────────────────────────
export default function Settings() {
  const { user: authUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/users/settings');
        setUser(data.user);
      } catch {
        // fallback to auth context user
        setUser(authUser);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    updateUser(updatedUser); // sync auth context → header avatar, name etc.
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-sm text-slate-500">Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account, security, and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="card p-2 space-y-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  activeTab === id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeTab === id ? 'rotate-90 text-primary-500' : 'text-slate-300'}`} />
              </button>
            ))}
          </nav>
        </aside>

        {/* Tab content */}
        <main className="flex-1 card p-6 min-w-0 animate-fade-in">
          {activeTab === 'profile'       && <ProfileTab       user={user} onUserUpdate={handleUserUpdate} />}
          {activeTab === 'security'      && <SecurityTab />}
          {activeTab === 'notifications' && <NotificationsTab user={user} />}
          {activeTab === 'account'       && <AccountTab       user={user} />}
        </main>
      </div>
    </div>
  );
}
