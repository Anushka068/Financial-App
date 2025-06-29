import React from 'react';
import { Users, Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UsersPage: React.FC = () => {
  const { user } = useAuth();

  // Only show for admin users
  if (user?.role !== 'admin') {
    return (
      <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
        <Users className="h-16  w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to access user management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts, permissions, and access controls
          </p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">User Management Coming Soon</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Comprehensive user management features including role-based access control, user permissions, and team collaboration tools are under development.
        </p>
      </div>
    </div>
  );
};

export default UsersPage;