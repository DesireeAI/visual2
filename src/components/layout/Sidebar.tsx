import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Clock, 
  MessageCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'profile', label: 'Clinic Profile', icon: Settings },
    { id: 'hours', label: 'Operating Hours', icon: Clock },
    { id: 'channels', label: 'WhatsApp Channels', icon: MessageCircle },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center">
          <LayoutDashboard className="w-8 h-8 text-blue-600" />
          <h1 className="ml-3 text-xl font-bold text-gray-900">Clinic Dashboard</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors
                ${activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};