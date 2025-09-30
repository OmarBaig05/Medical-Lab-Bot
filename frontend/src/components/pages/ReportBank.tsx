import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { FileText, Download, Eye, Trash2, Search, Calendar, Filter, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportBank() {
  const { reports, deleteReport } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.date.includes(searchTerm)
  );

  const handleView = (reportId: string) => {
    navigate(`/interpretation/${reportId}`);
  };

  const handleDownload = (reportTitle: string) => {
    toast.success(`Downloaded ${reportTitle} PDF`);
  };

  const handleDelete = (reportId: string) => {
    deleteReport(reportId);
    setDeleteDialog(null);
    toast.success('Report deleted successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'processing': return '⏳';
      case 'failed': return '✗';
      default: return '?';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report Bank</h1>
            <p className="text-gray-600 mt-1">
              Manage and access all your previous lab report analyses
            </p>
          </div>
          <Button onClick={() => navigate('/upload')}>
            <Upload className="h-4 w-4 mr-2" />
            Upload New Report
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reports by title or date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Range
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No matching reports found' : 'No reports yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Upload your first lab report to get started with AI-powered analysis'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/upload')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Report
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{report.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(report.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(report.status)}>
                      <span className="mr-1">{getStatusIcon(report.status)}</span>
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleView(report.id)}
                      disabled={report.status !== 'completed'}
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(report.title)}
                      disabled={report.status !== 'completed'}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      PDF
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteDialog(report.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {report.status === 'processing' && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                        Processing...
                      </div>
                    </div>
                  )}
                  
                  {report.status === 'failed' && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-red-600">
                        Analysis failed. Please try uploading again.
                      </p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-red-600"
                        onClick={() => navigate('/upload')}
                      >
                        Re-upload
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reports.filter(r => r.status === 'processing').length}
                </div>
                <div className="text-sm text-gray-600">Processing</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {new Date().getMonth() + 1}
                </div>
                <div className="text-sm text-gray-600">This Month</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog !== null} onOpenChange={() => setDeleteDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Report</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this report? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteDialog && handleDelete(deleteDialog)}
              >
                Delete Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}