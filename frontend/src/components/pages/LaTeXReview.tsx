import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, X, AlertTriangle, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

interface TableData {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low';
}

export default function LaTeXReview() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  
  const [reportTitle, setReportTitle] = useState('Complete Blood Count (CBC)');
  const [isEditing, setIsEditing] = useState(false);
  
  const [tableData, setTableData] = useState<TableData[]>([
    {
      parameter: 'Hemoglobin',
      value: '12.5',
      unit: 'g/dL',
      referenceRange: '12.0-15.5',
      status: 'normal'
    },
    {
      parameter: 'Red Blood Cells',
      value: '4.2',
      unit: 'million/μL',
      referenceRange: '3.8-5.1',
      status: 'normal'
    },
    {
      parameter: 'White Blood Cells',
      value: '8.5',
      unit: 'thousand/μL',
      referenceRange: '4.0-11.0',
      status: 'normal'
    },
    {
      parameter: 'Platelets',
      value: '350',
      unit: 'thousand/μL',
      referenceRange: '150-450',
      status: 'normal'
    },
    {
      parameter: 'Hematocrit',
      value: '38.5',
      unit: '%',
      referenceRange: '36-46',
      status: 'normal'
    }
  ]);

  const handleCellEdit = (index: number, field: keyof TableData, value: string) => {
    setTableData(prev => prev.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    ));
  };

  const addRow = () => {
    setTableData(prev => [...prev, {
      parameter: 'New Parameter',
      value: '',
      unit: '',
      referenceRange: '',
      status: 'normal'
    }]);
  };

  const removeRow = (index: number) => {
    setTableData(prev => prev.filter((_, i) => i !== index));
  };

  const handleApprove = () => {
    toast.success('Report data approved!');
    navigate(`/interpretation/${reportId}`);
  };

  const handleReupload = () => {
    navigate('/upload');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review & Edit Report</h1>
            <p className="text-gray-600 mt-1">
              Verify the extracted data is correct before generating interpretation
            </p>
          </div>
          <Badge variant="outline" className="text-blue-600">
            Step 2 of 3
          </Badge>
        </div>

        {/* Warning Alert */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Important:</strong> If the extraction looks wrong, please edit the data or re-upload a clearer image. 
            Accurate data ensures better AI interpretation.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Report Title */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Report Information
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isEditing ? 'Save' : 'Edit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-gray-50'}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Extracted Table */}
            <Card>
              <CardHeader>
                <CardTitle>Extracted Lab Values</CardTitle>
                <CardDescription>
                  Review and edit the extracted values. Click on any cell to modify the data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left font-medium">Parameter</th>
                        <th className="border border-gray-300 p-3 text-left font-medium">Value</th>
                        <th className="border border-gray-300 p-3 text-left font-medium">Unit</th>
                        <th className="border border-gray-300 p-3 text-left font-medium">Reference Range</th>
                        <th className="border border-gray-300 p-3 text-left font-medium">Status</th>
                        <th className="border border-gray-300 p-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2">
                            <Input
                              value={row.parameter}
                              onChange={(e) => handleCellEdit(index, 'parameter', e.target.value)}
                              className="border-0 p-1 h-auto"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              value={row.value}
                              onChange={(e) => handleCellEdit(index, 'value', e.target.value)}
                              className="border-0 p-1 h-auto"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              value={row.unit}
                              onChange={(e) => handleCellEdit(index, 'unit', e.target.value)}
                              className="border-0 p-1 h-auto"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              value={row.referenceRange}
                              onChange={(e) => handleCellEdit(index, 'referenceRange', e.target.value)}
                              className="border-0 p-1 h-auto"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <select
                              value={row.status}
                              onChange={(e) => handleCellEdit(index, 'status', e.target.value as any)}
                              className="w-full p-1 border-0 bg-transparent"
                            >
                              <option value="normal">Normal</option>
                              <option value="high">High</option>
                              <option value="low">Low</option>
                            </select>
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRow(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <Button variant="outline" onClick={addRow}>
                    Add Row
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleApprove} className="flex-1" size="lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Approve & Continue
              </Button>
              <Button variant="outline" onClick={handleReupload} className="flex-1" size="lg">
                <Upload className="h-5 w-5 mr-2" />
                Re-upload Image
              </Button>
              <Button variant="ghost" onClick={() => navigate('/dashboard')} size="lg">
                Cancel
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total Parameters:</span>
                  <span className="font-medium">{tableData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Normal Values:</span>
                  <span className="font-medium text-green-600">
                    {tableData.filter(row => row.status === 'normal').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Abnormal Values:</span>
                  <span className="font-medium text-red-600">
                    {tableData.filter(row => row.status !== 'normal').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center">
                  <Badge className={getStatusColor('normal')}>Normal</Badge>
                  <span className="ml-2 text-sm">Within reference range</span>
                </div>
                <div className="flex items-center">
                  <Badge className={getStatusColor('high')}>High</Badge>
                  <span className="ml-2 text-sm">Above reference range</span>
                </div>
                <div className="flex items-center">
                  <Badge className={getStatusColor('low')}>Low</Badge>
                  <span className="ml-2 text-sm">Below reference range</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• Double-check numeric values for accuracy</p>
                <p>• Verify units match your original report</p>
                <p>• Ensure reference ranges are correct</p>
                <p>• Mark abnormal values appropriately</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}