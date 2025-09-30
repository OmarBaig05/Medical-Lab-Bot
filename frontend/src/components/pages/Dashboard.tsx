import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Wallet, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { reports } = useApp();
  const navigate = useNavigate();

  const completedReports = reports.filter(r => r.status === 'completed').length;
  const processingReports = reports.filter(r => r.status === 'processing').length;
  
  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's an overview of your medical reports and account status.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-green-100 px-3 py-2 rounded-lg">
              <Wallet className="h-4 w-4 text-green-600 mr-2" />
              <span className="font-medium text-green-700">
                ${user?.walletBalance.toFixed(2)}
              </span>
            </div>
            <Badge variant={user?.role === 'Doctor' ? 'default' : 'secondary'}>
              {user?.role}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">
                {completedReports} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processingReports}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${user?.walletBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Available credits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Reports analyzed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/upload')}>
            <CardHeader>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Upload New Report</CardTitle>
                  <CardDescription>Analyze a new lab report with AI</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Start New Analysis
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/reports')}>
            <CardHeader>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">View Report Bank</CardTitle>
                  <CardDescription>Access your previous reports</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Browse Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/wallet')}>
            <CardHeader>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Manage Wallet</CardTitle>
                  <CardDescription>Top up credits and view billing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Wallet
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest report analyses and interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.slice(0, 3).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-gray-600">{report.date}</p>
                    </div>
                  </div>
                  <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                    {report.status}
                  </Badge>
                </div>
              ))}
              
              {reports.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No reports uploaded yet</p>
                  <p className="text-sm">Upload your first lab report to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}