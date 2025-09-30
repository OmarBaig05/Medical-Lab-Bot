import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Check, Upload, Brain, MessageSquare, FileText, Stethoscope, User } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'patient' | 'doctor'>('patient');

  const patientFeatures = [
    'Upload lab reports instantly',
    'AI-powered interpretation in simple terms',
    '2 free follow-up questions per report',
    'Secure report storage',
    'PDF export with results'
  ];

  const doctorFeatures = [
    'All Patient features included',
    'Advanced medical terminology',
    'Clinical recommendations',
    'Unlimited follow-up questions',
    'Priority support',
    'Bulk report processing'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">MedLab AI</h1>
                <p className="text-sm text-gray-600">Report Interpreter</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Medical Analysis
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Understand Your
            <span className="text-blue-600"> Lab Reports</span>
            <br />Instantly
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your medical lab reports and get instant, easy-to-understand interpretations 
            powered by advanced AI. Perfect for patients and healthcare professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3" onClick={() => navigate('/auth')}>
              <Upload className="mr-2 h-5 w-5" />
              Upload Your First Report
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              <Brain className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, fast, and accurate lab report interpretation in three easy steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload Report</h3>
              <p className="text-gray-600">
                Simply drag and drop your lab report image or PDF. Our AI processes it instantly.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Analysis</h3>
              <p className="text-gray-600">
                Advanced AI extracts data and provides interpretation tailored to your role.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Get Results</h3>
              <p className="text-gray-600">
                Receive clear explanations, ask follow-up questions, and download PDF reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the plan that best fits your needs. Both plans include secure storage and PDF exports.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Patient Plan */}
            <Card className={`relative ${selectedPlan === 'patient' ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Patient Plan</CardTitle>
                <CardDescription>Perfect for individuals managing their health</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$2.99</span>
                  <span className="text-gray-600">/report</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {patientFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={selectedPlan === 'patient' ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedPlan('patient');
                    navigate('/auth');
                  }}
                >
                  Get Started as Patient
                </Button>
              </CardContent>
            </Card>

            {/* Doctor Plan */}
            <Card className={`relative ${selectedPlan === 'doctor' ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle className="text-2xl">Doctor Plan</CardTitle>
                <CardDescription>Advanced features for healthcare professionals</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$4.99</span>
                  <span className="text-gray-600">/report</span>
                </div>
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-teal-500">
                  Popular
                </Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {doctorFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600" 
                  onClick={() => {
                    setSelectedPlan('doctor');
                    navigate('/auth');
                  }}
                >
                  Get Started as Doctor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <Activity className="h-8 w-8 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-xl font-bold">MedLab AI</h3>
              <p className="text-gray-400 text-sm">Report Interpreter</p>
            </div>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 MedLab AI. All rights reserved.</p>
            <p className="mt-2">Secure • HIPAA Compliant • AI-Powered</p>
          </div>
        </div>
      </footer>
    </div>
  );
}