import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  FileText,
  Wallet,
  Settings,
  LogOut,
  Activity
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Upload Report', href: '/upload', icon: Upload },
  { name: 'Report Bank', href: '/reports', icon: FileText },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Account', href: '/account', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-gray-200", className)}>
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <Activity className="h-8 w-8 text-blue-600" />
        <div className="ml-3">
          <h1 className="text-lg font-semibold text-gray-900">MedLab AI</h1>
          <p className="text-xs text-gray-500">Report Interpreter</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive && "bg-blue-50 text-blue-700 hover:bg-blue-100"
              )}
              onClick={() => handleNavigation(item.href)}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Button>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center mb-4">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700">
              {user?.name.charAt(0)}
            </span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}