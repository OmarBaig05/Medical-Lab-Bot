import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/components/pages/LandingPage';
import AuthPage from '@/components/pages/AuthPage';
import Dashboard from '@/components/pages/Dashboard';
import UploadReport from '@/components/pages/UploadReport';
import LaTeXReview from '@/components/pages/LaTeXReview';
import InterpretationPage from '@/components/pages/InterpretationPage';
import ReportBank from '@/components/pages/ReportBank';
import WalletPage from '@/components/pages/WalletPage';
import AccountPage from '@/components/pages/AccountPage';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<UploadReport />} />
              <Route path="/review/:reportId" element={<LaTeXReview />} />
              <Route path="/interpretation/:reportId" element={<InterpretationPage />} />
              <Route path="/reports" element={<ReportBank />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/account" element={<AccountPage />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;