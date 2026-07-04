import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Shield, Trash2, UserPlus, Loader2, AlertCircle, Crown, Award } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  tier: string;
  created_at: string;
}

interface PlatformStats {
  total_users: number;
  super_users: number;
  ops: number;
  early_access: number;
  vips: number;
  premium_users: number;
  free_users: number;
}

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (currentUser?.role !== 'op' && currentUser?.role !== 'super_user') {
      router.push('/app');
      return;
    }
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, statsRes] = await Promise.all([
        adminAPI.listUsers(),
        adminAPI.getStats()
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;
    
    try {
      await adminAPI.deleteUser(userId);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      super_user: 'bg-red-600 text-white',
      op: 'bg-orange-600 text-white',
      vip: 'bg-purple-600 text-white',
      early_access: 'bg-blue-600 text-white',
      user: 'bg-gray-600 text-white',
      guest: 'bg-gray-800 text-gray-400',
    };
    return colors[role] || colors.guest;
  };

  const getTierBadge = (tier: string) => {
    return tier === 'premium' ? (
      <span className="px-2 py-1 bg-violet-600 text-white text-xs font-bold rounded">
        PREMIUM
      </span>
    ) : (
      <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs font-bold rounded">
        FREE
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0e17] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Platform management and user administration</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg mb-8 flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">{stats.total_users}</div>
              <div className="text-xs text-gray-500 uppercase">Total Users</div>
            </div>
            <div className="bg-gray-900 border border-red-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-400">{stats.super_users}</div>
              <div className="text-xs text-gray-500 uppercase">Super Users</div>
            </div>
            <div className="bg-gray-900 border border-orange-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-400">{stats.ops}</div>
              <div className="text-xs text-gray-500 uppercase">Operators</div>
            </div>
            <div className="bg-gray-900 border border-purple-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.vips}</div>
              <div className="text-xs text-gray-500 uppercase">VIPs</div>
            </div>
            <div className="bg-gray-900 border border-blue-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.early_access}</div>
              <div className="text-xs text-gray-500 uppercase">Early Access</div>
            </div>
            <div className="bg-gray-900 border border-violet-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-violet-400">{stats.premium_users}</div>
              <div className="text-xs text-gray-500 uppercase">Premium</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-400">{stats.free_users}</div>
              <div className="text-xs text-gray-500 uppercase">Free</div>
            </div>
          </div>
        )}

        {/* User Management */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-2xl font-bold">User Management</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{user.username}</span>
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-violet-400">(You)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{user.email}</td>
                    <td className="px-6 py-4">
                      {currentUser?.role === 'super_user' && user.id !== currentUser?.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`px-3 py-1 rounded text-xs font-bold ${getRoleBadge(user.role)}`}
                        >
                          <option value="guest">Guest</option>
                          <option value="user">User</option>
                          <option value="early_access">Early Access</option>
                          <option value="vip">VIP</option>
                          <option value="op">Operator</option>
                          <option value="super_user">Super User</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded text-xs font-bold ${getRoleBadge(user.role)}`}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getTierBadge(user.tier)}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {currentUser?.role === 'super_user' && user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="p-2 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-lg transition"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchData();
            }}
          />
        )}
      </div>
    </div>
  );
};

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal = ({ onClose, onSuccess }: CreateUserModalProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [tier, setTier] = useState('free');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!username || !email || !password) {
      setError('All fields are required');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await adminAPI.createUser({ username, email, password, role, tier });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1f] border border-gray-800 rounded-lg w-full max-w-md">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold">Create New User</h2>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-lg focus:border-violet-500 outline-none"
              placeholder="username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-lg focus:border-violet-500 outline-none"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-lg focus:border-violet-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-lg focus:border-violet-500 outline-none"
              >
                <option value="guest">Guest</option>
                <option value="user">User</option>
                <option value="early_access">Early Access</option>
                <option value="vip">VIP</option>
                <option value="op">Operator</option>
                <option value="super_user">Super User</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-lg focus:border-violet-500 outline-none"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
