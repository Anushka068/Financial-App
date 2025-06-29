import React from 'react';
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  Wallet, 
  BarChart3, 
  User, 
  MessageSquare,
  Settings
} from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { activeMenuItem, setActiveMenuItem, isSidebarOpen, setIsSidebarOpen } = useMenu();
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowUpDown },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'message', label: 'Message', icon: MessageSquare },
    { id: 'setting', label: 'Setting', icon: Settings },
  ];

  const handleMenuClick = (itemId: string) => {
    setActiveMenuItem(itemId);
    setIsSidebarOpen(false);
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-gray-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h1 className="ml-3 text-xl font-bold text-white">Penta</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenuItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-800 text-white border-r-2 border-green-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-green-400' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;