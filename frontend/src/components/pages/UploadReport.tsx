import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { Upload, FileImage, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadReport() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [expectedSymptoms, setExpectedSymptoms] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const { addReport } = useApp();
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPG, PNG) or PDF file');
      return;
    }
    
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setUploadedFile(file);
    toast.success('File uploaded successfully!');
  };

  const processReport = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a file first');
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate processing steps
    const steps = [
      { message: 'Uploading file...', progress: 20 },
      { message: 'Extracting text from image...', progress: 40 },
      { message: 'Parsing medical data...', progress: 60 },
      { message: 'Generating LaTeX table...', progress: 80 },
      { message: 'Analysis complete!', progress: 100 }
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(step.progress);
      if (step.progress < 100) {
        toast.info(step.message);
      }
    }
    
    // Create new report
    const newReport = {
      id: Date.now().toString(),
      title: expectedSymptoms || 'Lab Report Analysis',
      date: new Date().toISOString().split('T')[0],
      status: 'completed' as const
    };
    
    addReport(newReport);
    
    setIsProcessing(false);
    toast.success('Report processed successfully!');
    navigate(`/review/${newReport.id}`);
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Lab Report</h1>
          <p className="text-gray-600 mt-1">
            Upload your medical lab report for AI-powered analysis and interpretation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Report</CardTitle>
                <CardDescription>
                  Drag and drop your lab report image or PDF file, or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : uploadedFile 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <FileImage className="h-12 w-12 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-700">{uploadedFile.name}</p>
                        <p className="text-sm text-green-600">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={removeFile}>
                        <X className="h-4 w-4 mr-2" />
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">Drop your file here, or click to browse</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Supports JPG, PNG, PDF up to 10MB
                        </p>
                      </div>
                      <Button variant="outline">
                        Choose File
                      </Button>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Expected Symptoms Input */}
                <div className="mt-6 space-y-2">
                  <Label htmlFor="symptoms">Expected Symptoms / Disease (Optional)</Label>
                  <Input
                    id="symptoms"
                    placeholder="e.g., CBC for anemia, diabetes screening, thyroid function..."
                    value={expectedSymptoms}
                    onChange={(e) => setExpectedSymptoms(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Help our AI provide more targeted analysis by describing what you're looking for
                  </p>
                </div>

                {/* Process Button */}
                <div className="mt-6">
                  <Button 
                    onClick={processReport} 
                    disabled={!uploadedFile || isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? 'Processing Report...' : 'Analyze Report'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Processing Progress */}
            {isProcessing && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Processing Your Report
                  </CardTitle>
                  <CardDescription>
                    Our AI is analyzing your medical report. This may take a few moments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="mb-2" />
                  <p className="text-sm text-gray-600 text-center">{progress}% complete</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Upload</h4>
                    <p className="text-sm text-gray-600">Upload your lab report image or PDF</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Extract</h4>
                    <p className="text-sm text-gray-600">AI extracts data from your report</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Review</h4>
                    <p className="text-sm text-gray-600">Review and edit extracted data</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Interpret</h4>
                    <p className="text-sm text-gray-600">Get AI-powered interpretation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span>File types:</span>
                  <span className="text-gray-600">JPG, PNG, PDF</span>
                </p>
                <p className="flex justify-between">
                  <span>Max size:</span>
                  <span className="text-gray-600">10 MB</span>
                </p>
                <p className="flex justify-between">
                  <span>Resolution:</span>
                  <span className="text-gray-600">High quality preferred</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}