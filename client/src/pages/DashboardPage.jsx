import { useAuth } from '../context/AuthContext';
import AdminDashboardPage from './AdminDashboardPage';
import RecruiterDashboard from '../components/recruiter/RecruiterDashboard';
import CandidateDashboard from '../components/candidate/CandidateDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'admin') return <AdminDashboardPage />;
  if (user?.role === 'recruiter') return <RecruiterDashboard />;
  return <CandidateDashboard />;
}
