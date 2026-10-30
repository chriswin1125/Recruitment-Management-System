import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Search, UserX, UserCheck, Trash2, Filter } from 'lucide-react';
import { LoadingScreen, EmptyState, Pagination } from '../components/common/UI';
import { format } from 'date-fns';

const ROLE_STYLES = {
  admin: 'bg-purple-50 text-purple-700 border border-purple-200',
  recruiter: 'bg-blue-50 text-blue-700 border border-blue-200',
  candidate: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (roleFilter) params.append('role', roleFilter);
      if (search) params.append('search', search);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, roleFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleToggle = async (userId, isActive) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-status`);
      toast.success(data.message);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const handleDelete = async (userId, name) => {
    if (!confirm(`Permanently delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Users</h1>
        <p className="page-subtitle">View and manage all users across the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary px-4">Search</button>
        </form>
        <div className="flex gap-2">
          {['', 'candidate', 'recruiter', 'admin'].map(r => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${
                roleFilter === r ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {r === '' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingScreen /> : users.length === 0 ? (
        <EmptyState icon={Search} title="No users found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="table-container mb-4">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge capitalize text-xs ${ROLE_STYLES[u.role]}`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`badge text-xs ${u.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="text-slate-500 text-xs">
                      {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {u.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleToggle(u._id, u.isActive)}
                              title={u.isActive ? 'Suspend user' : 'Activate user'}
                              className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                            >
                              {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(u._id, u.name)}
                              title="Delete user"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
