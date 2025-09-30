import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}