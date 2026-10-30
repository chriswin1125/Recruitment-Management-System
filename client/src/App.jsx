import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import ApplyJobPage from './pages/ApplyJobPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ProfilePage from './pages/ProfilePage';
import RecruiterJobsPage from './pages/RecruiterJobsPage';
import RecruiterJobFormPage from './pages/RecruiterJobFormPage';
import RecruiterApplicantsPage from './pages/RecruiterApplicantsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminJobsPage from './pages/AdminJobsPage';
import NotFoundPage from './pages/NotFoundPage';
import SettingsPage from './pages/SettingsPage';

// Layout
import DashboardLayout from './components/common/DashboardLayout';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected */}
      <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />

        {/* Candidate */}
        <Route path="jobs/:id/apply" element={<PrivateRoute roles={['candidate']}><ApplyJobPage /></PrivateRoute>} />
        <Route path="my-applications" element={<PrivateRoute roles={['candidate']}><MyApplicationsPage /></PrivateRoute>} />
        <Route path="profile" element={<PrivateRoute roles={['candidate']}><ProfilePage /></PrivateRoute>} />

        {/* Recruiter */}
        <Route path="recruiter/jobs" element={<PrivateRoute roles={['recruiter']}><RecruiterJobsPage /></PrivateRoute>} />
        <Route path="recruiter/jobs/new" element={<PrivateRoute roles={['recruiter']}><RecruiterJobFormPage /></PrivateRoute>} />
        <Route path="recruiter/jobs/:id/edit" element={<PrivateRoute roles={['recruiter']}><RecruiterJobFormPage /></PrivateRoute>} />
        <Route path="recruiter/jobs/:id/applicants" element={<PrivateRoute roles={['recruiter']}><RecruiterApplicantsPage /></PrivateRoute>} />

        {/* Admin */}
        <Route path="admin" element={<PrivateRoute roles={['admin']}><AdminDashboardPage /></PrivateRoute>} />
        <Route path="admin/users" element={<PrivateRoute roles={['admin']}><AdminUsersPage /></PrivateRoute>} />
        <Route path="admin/jobs" element={<PrivateRoute roles={['admin']}><AdminJobsPage /></PrivateRoute>} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
