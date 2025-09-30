import { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import ChatWidget from '@/components/widgets/ChatWidget';
import { Download, FileText, MessageCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TableData {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low';
}

export default function InterpretationPage() {
  const { reportId } = useParams();
  const { user } = useAuth();
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  
  const reportTitle = 'Complete Blood Count (CBC)';
  
  const tableData: TableData[] = [
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
  ];

  const patientInterpretation = `
    Your Complete Blood Count (CBC) results look good overall! Here's what your numbers mean:

    **Good News:** All your main blood counts are within the healthy range, which suggests your blood is functioning well.

    **What this means for you:**
    • Your red blood cells are carrying oxygen properly throughout your body
    • Your immune system (white blood cells) appears to be at normal levels
    • Your blood clotting ability (platelets) is functioning normally
    • No signs of anemia or blood disorders

    **Recommendations:**
    • Continue maintaining a healthy lifestyle
    • Keep up with regular check-ups
    • Stay hydrated and eat a balanced diet rich in iron and vitamins

    If you have any concerns or symptoms, don't hesitate to discuss them with your healthcare provider.
  `;

  const doctorInterpretation = `
    **Clinical Summary:** Complete Blood Count within normal limits

    **Laboratory Findings:**
    • Hemoglobin: 12.5 g/dL (WNL) - Adequate oxygen-carrying capacity
    • RBC: 4.2 million/μL (WNL) - Normal erythropoiesis
    • WBC: 8.5 thousand/μL (WNL) - No evidence of infection or immunosuppression  
    • Platelets: 350 thousand/μL (WNL) - Adequate hemostatic function
    • Hematocrit: 38.5% (WNL) - Normal blood volume composition

    **Clinical Interpretation:**
    No evidence of anemia, polycythemia, leukocytosis, leukopenia, or thrombocytopenia. 
    Results suggest normal hematopoietic function.

    **Recommendations:**
    • Continue routine monitoring as clinically indicated
    • No immediate intervention required
    • Consider trending if patient has ongoing symptoms
    • Follow standard guidelines for age-appropriate screening

    **Differential Considerations:**
    Normal CBC does not exclude iron deficiency without stores evaluation or B12/folate deficiency without specific testing.
  `;

  const interpretation = user?.role === 'Doctor' ? doctorInterpretation : patientInterpretation;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const handleDownloadPdf = (includeChat: boolean) => {
    setShowPdfDialog(false);
    const chatText = includeChat ? ' with chat conversation' : '';
    toast.success(`PDF report${chatText} downloaded successfully!`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report Interpretation</h1>
            <p className="text-gray-600 mt-1">{reportTitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Analysis Complete
            </Badge>
            <Button onClick={() => setShowPdfDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lab Results Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Lab Results Summary
                </CardTitle>
                <CardDescription>
                  Final approved lab values from your report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left font-medium">Parameter</th>
                        <th className="border border-gray-300 p-3 text-left font-medium">Your Value</th>
                        <th className="border border-gray-300 p-3 text-left font-medium">Unit</th>
                        <th className="border border-gray-300 p-3 text-left font-medium">Reference Range</th>
                        <th className="border border-gray-300 p-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3 font-medium">{row.parameter}</td>
                          <td className="border border-gray-300 p-3">{row.value}</td>
                          <td className="border border-gray-300 p-3 text-gray-600">{row.unit}</td>
                          <td className="border border-gray-300 p-3 text-gray-600">{row.referenceRange}</td>
                          <td className="border border-gray-300 p-3">
                            <Badge className={getStatusColor(row.status)}>
                              {row.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* AI Interpretation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  AI Interpretation
                  <Badge variant="secondary" className="ml-2">
                    {user?.role} View
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {user?.role === 'Doctor' ? 
                    'Clinical interpretation with medical terminology' : 
                    'Easy-to-understand explanation of your results'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {interpretation}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Widget */}
            <ChatWidget reportTitle={reportTitle} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Report Type:</span>
                  <span className="font-medium">{reportTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="font-medium">Today</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Parameters:</span>
                  <span className="font-medium">{tableData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowPdfDialog(true)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Save to Bank
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Understanding Your Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p><strong>Normal:</strong> Your values are within the healthy range</p>
                <p><strong>High:</strong> Values above the reference range</p>
                <p><strong>Low:</strong> Values below the reference range</p>
                <p className="mt-4 text-xs">
                  Always consult with your healthcare provider for medical advice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* PDF Download Dialog */}
        <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Download Report PDF</DialogTitle>
              <DialogDescription>
                Would you like to include the chat conversation in your PDF report?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => handleDownloadPdf(false)}>
                PDF Without Chat
              </Button>
              <Button onClick={() => handleDownloadPdf(true)}>
                PDF With Chat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}