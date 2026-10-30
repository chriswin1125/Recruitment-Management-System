import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  User, Lock, Bell, Shield, Camera, Eye, EyeOff,
  Save, Loader2, AlertTriangle, LogOut, Trash2,
  CheckCircle, Mail, Phone, ChevronRight
} from 'lucide-react';

/* ─── tiny helpers ─────────────────────────────────────────── */
const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User   },
  { id: 'security',      label: 'Security',       icon: Lock   },
  { id: 'notifications', label: 'Notifications',  icon: Bell   },
  { id: 'account',       label: 'Account',        icon: Shield },
];

function Alert({ type, message }) {
  if (!message) return null;
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error:   'bg-red-50 border-red-200 text-red-800',
  };
  const Icon = type === 'success' ? CheckCircle : AlertTriangle;
  return (
    <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-sm mb-5 ${styles[type]}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          checked ? 'bg-primary-600' : 'bg-slate-200'
        }`}
        aria-checked={checked}
        role="switch"
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences and security</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar tabs */}
        <nav className="sm:w-48 flex-shrink-0">
          <div className="card p-2 flex sm:flex-col gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all ${
                  activeTab === id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Tab panels */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile'       && <ProfileTab user={user} updateUser={updateUser} />}
          {activeTab === 'security'      && <SecurityTab />}
          {activeTab === 'notifications' && <NotificationsTab user={user} updateUser={updateUser} />}
          {activeTab === 'account'       && <AccountTab user={user} logout={logout} />}
        </div>
      </div>
    </div>
  );
}

/* ─── PROFILE TAB ───────────────────────────────────────────── */
function ProfileTab({ user, updateUser }) {
  const fileInputRef = useRef();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
      setPreview(user.profileImage || user.avatar || null);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setAlert({ type: 'error', message: 'Please select an image file (JPEG, PNG, WebP)' });
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setAlert({ type: 'error', message: 'Image must be smaller than 2 MB' });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setAlert(null);
  };

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2)
      return 'Name must be at least 2 characters';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      return 'Please enter a valid email address';
    if (form.phone && !/^[+]?[\d\s\-().]{7,20}$/.test(form.phone.trim()))
      return 'Please enter a valid phone number';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    const err = validate();
    if (err) { setAlert({ type: 'error', message: err }); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('email', form.email.trim());
      fd.append('phone', form.phone.trim());
      if (file) fd.append('profileImage', file);

      const { data } = await api.put('/users/update-profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(data.user);
      setFile(null);
      setAlert({ type: 'success', message: data.message });
      toast.success(data.message);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const avatarLetter = (form.name || user?.name || '?').charAt(0).toUpperCase();
  const avatarSrc    = preview
    ? (preview.startsWith('blob:') ? preview : preview)
    : null;

  return (
    <div className="card p-6 animate-fade-in">
      <h2 className="font-display font-bold text-slate-900 mb-5">Profile Information</h2>
      <Alert type={alert?.type} message={alert?.message} />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-5 pb-5 border-b border-slate-100">
          <div className="relative group flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-display font-bold text-3xl">{avatarLetter}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Profile picture</p>
            <p className="text-xs text-slate-400 mt-0.5">JPEG, PNG or WebP · max 2 MB</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-medium text-primary-600 hover:underline"
            >
              {preview ? 'Change photo' : 'Upload photo'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Fields */}
        <div>
          <label className="label">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="John Smith"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              className="input pl-10"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              className="input pl-10"
              placeholder="+1 555 000 0000"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── SECURITY TAB ──────────────────────────────────────────── */
function SecurityTab() {
  const [form, setForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow]   = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]    = useState(null);

  const strength = (pwd) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8)              s++;
    if (/[A-Z]/.test(pwd))            s++;
    if (/[0-9]/.test(pwd))            s++;
    if (/[^A-Za-z0-9]/.test(pwd))    s++;
    return s;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-500'];
  const pwdStrength   = strength(form.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword)
      return setAlert({ type: 'error', message: 'All fields are required' });
    if (form.newPassword.length < 6)
      return setAlert({ type: 'error', message: 'New password must be at least 6 characters' });
    if (form.newPassword !== form.confirmPassword)
      return setAlert({ type: 'error', message: 'New password and confirm password do not match' });
    if (form.currentPassword === form.newPassword)
      return setAlert({ type: 'error', message: 'New password must differ from current password' });

    setLoading(true);
    try {
      const { data } = await api.put('/users/change-password', form);
      setAlert({ type: 'success', message: data.message });
      toast.success(data.message);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ field, label, placeholder }) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={show[field] ? 'text' : 'password'}
          className="input pl-10 pr-11"
          placeholder={placeholder}
          value={form[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
          onChange={e => {
            const key = field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword';
            setForm({ ...form, [key]: e.target.value });
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="card p-6 animate-fade-in">
      <h2 className="font-display font-bold text-slate-900 mb-5">Change Password</h2>
      <Alert type={alert?.type} message={alert?.message} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput field="current" label="Current Password" placeholder="••••••••" />
        <PasswordInput field="new"     label="New Password"     placeholder="Min. 6 characters" />

        {/* Password strength bar */}
        {form.newPassword && (
          <div className="space-y-1.5 -mt-2">
            <div className="flex gap-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwdStrength ? strengthColor[pwdStrength] : 'bg-slate-200'}`} />
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Strength: <span className="font-medium">{strengthLabel[pwdStrength]}</span>
              {pwdStrength < 3 && <span className="text-slate-400"> — add uppercase letters, numbers and symbols</span>}
            </p>
          </div>
        )}

        <PasswordInput field="confirm" label="Confirm New Password" placeholder="Re-enter new password" />

        <div className="pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── NOTIFICATIONS TAB ─────────────────────────────────────── */
function NotificationsTab({ user, updateUser }) {
  const [prefs, setPrefs]   = useState({
    emailNotifications: true, jobAlerts: true,
    applicationUpdates: true, marketingEmails: false,
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPrefs({ ...prefs, ...user.notificationPreferences });
    }
  }, [user]);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const { data } = await api.put('/users/notification-preferences', prefs);
      updateUser({ notificationPreferences: data.notificationPreferences });
      setAlert({ type: 'success', message: data.message });
      toast.success(data.message);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to save preferences' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 animate-fade-in">
      <h2 className="font-display font-bold text-slate-900 mb-1">Notification Preferences</h2>
      <p className="text-sm text-slate-500 mb-5">Choose which notifications you'd like to receive</p>
      <Alert type={alert?.type} message={alert?.message} />

      <div className="divide-y divide-slate-100">
        <Toggle
          checked={prefs.emailNotifications}
          onChange={() => toggle('emailNotifications')}
          label="Email Notifications"
          description="Receive system notifications and important updates via email"
        />
        <Toggle
          checked={prefs.jobAlerts}
          onChange={() => toggle('jobAlerts')}
          label="Job Alerts"
          description="Get notified about new job openings matching your profile"
        />
        <Toggle
          checked={prefs.applicationUpdates}
          onChange={() => toggle('applicationUpdates')}
          label="Application Updates"
          description="Stay informed when your application status changes"
        />
        <Toggle
          checked={prefs.marketingEmails}
          onChange={() => toggle('marketingEmails')}
          label="Marketing Emails"
          description="Receive tips, product updates and career advice"
        />
      </div>

      <div className="pt-5 mt-2">
        <button onClick={handleSave} disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Saving…' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

/* ─── ACCOUNT TAB ───────────────────────────────────────────── */
function AccountTab({ user, logout }) {
  const [logoutLoading,  setLogoutLoading]  = useState(false);
  const [deleteModal,    setDeleteModal]    = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading,  setDeleteLoading]  = useState(false);
  const [deleteAlert,    setDeleteAlert]    = useState(null);
  const [showDeletePwd,  setShowDeletePwd]  = useState(false);

  const handleLogoutAll = async () => {
    setLogoutLoading(true);
    try {
      await api.post('/settings/logout-all');
      toast.success('Signed out from all devices');
      logout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to logout all sessions');
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteAlert(null);
    if (!deletePassword)
      return setDeleteAlert({ type: 'error', message: 'Please enter your password' });

    setDeleteLoading(true);
    try {
      await api.delete('/settings/delete-account', { data: { password: deletePassword } });
      toast.success('Account deleted successfully');
      logout();
    } catch (err) {
      setDeleteAlert({ type: 'error', message: err.response?.data?.message || 'Failed to delete account' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Account info */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-slate-900 mb-4">Account Information</h2>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Account ID',    value: user?._id || user?.id },
            { label: 'Role',          value: <span className="capitalize badge bg-primary-50 text-primary-700">{user?.role}</span> },
            { label: 'Member since',  value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-slate-500">{label}</span>
              <span className="font-medium text-slate-800 truncate ml-4 max-w-xs text-right text-xs font-mono">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout all devices */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Sign out everywhere</h3>
            <p className="text-sm text-slate-500 mt-0.5 mb-4">
              Immediately invalidates all active sessions across every device. You will need to sign in again on this device too.
            </p>
            <button
              onClick={handleLogoutAll}
              disabled={logoutLoading}
              className="btn-secondary text-amber-700 border-amber-200 hover:bg-amber-50"
            >
              {logoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              {logoutLoading ? 'Signing out…' : 'Sign out all devices'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete account */}
      {user?.role !== 'admin' && (
        <div className="card p-6 border-red-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Delete account</h3>
              <p className="text-sm text-slate-500 mt-0.5 mb-4">
                Permanently removes your account, profile, and all application history. This action cannot be undone.
              </p>
              <button
                onClick={() => setDeleteModal(true)}
                className="btn-danger"
              >
                <Trash2 className="w-4 h-4" /> Delete my account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setDeleteModal(false); setDeleteAlert(null); setDeletePassword(''); }} />
          <div className="relative card p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900">Delete account?</h3>
                <p className="text-xs text-slate-400">This cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              All your data — profile, applications, and account history — will be permanently deleted. Enter your password to confirm.
            </p>

            <Alert type={deleteAlert?.type} message={deleteAlert?.message} />

            <div className="mb-5">
              <label className="label">Your password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showDeletePwd ? 'text' : 'password'}
                  className="input pl-10 pr-11"
                  placeholder="Enter password to confirm"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleDeleteAccount()}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showDeletePwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteModal(false); setDeleteAlert(null); setDeletePassword(''); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="btn-danger flex-1"
              >
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleteLoading ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
