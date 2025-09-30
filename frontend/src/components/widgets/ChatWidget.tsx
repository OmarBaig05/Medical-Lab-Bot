import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { MessageCircle, Send, Bot, User, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ChatWidgetProps {
  reportTitle: string;
}

export default function ChatWidget({ reportTitle }: ChatWidgetProps) {
  const { user, updateWalletBalance } = useAuth();
  const { chatMessages, addChatMessage, freeQuestionsLeft, decrementFreeQuestions } = useApp();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Check if user has free questions or sufficient wallet balance
    if (freeQuestionsLeft === 0 && user && user.walletBalance < 1.00) {
      setShowUpgradeModal(true);
      return;
    }

    // Add user message
    addChatMessage(message, 'user');
    const userMessage = message;
    setMessage('');
    setIsLoading(true);

    // Deduct question or wallet balance
    if (freeQuestionsLeft > 0) {
      decrementFreeQuestions();
    } else {
      updateWalletBalance(-1.00);
    }

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('hemoglobin') || lowerMessage.includes('anemia')) {
        response = user?.role === 'Doctor' ? 
          'The hemoglobin level of 12.5 g/dL is within normal range (12.0-15.5 g/dL) for this demographic. No evidence of anemia. Consider trending if patient reports fatigue or other symptoms.' :
          'Your hemoglobin level is normal! This means your blood is carrying oxygen well throughout your body. Hemoglobin helps deliver oxygen from your lungs to the rest of your body.';
      } else if (lowerMessage.includes('white blood') || lowerMessage.includes('infection')) {
        response = user?.role === 'Doctor' ? 
          'WBC count of 8.5K/μL is within normal limits (4.0-11.0K/μL). No evidence of active infection or immunosuppression. Normal neutrophil-to-lymphocyte ratio would require differential analysis.' :
          'Your white blood cell count is in the healthy range! These cells help fight infections, and your levels suggest your immune system is working normally.';
      } else if (lowerMessage.includes('platelet') || lowerMessage.includes('bleeding')) {
        response = user?.role === 'Doctor' ? 
          'Platelet count of 350K/μL is adequate for hemostasis (normal range 150-450K/μL). No bleeding risk indicated. Patient can proceed with routine procedures without coagulation concerns.' :
          'Your platelet count looks great! Platelets help your blood clot when you get a cut or injury, and your levels are perfectly normal for this function.';
      } else {
        response = user?.role === 'Doctor' ? 
          'Based on the CBC results, all parameters are within normal limits. The patient shows no evidence of hematologic abnormalities. Consider clinical correlation with presenting symptoms.' :
          'Your overall blood test results are normal and healthy. If you have specific concerns about any symptoms, it\'s best to discuss them with your healthcare provider.';
      }
      
      addChatMessage(response, 'assistant');
      setIsLoading(false);
    }, 1500);
  };

  const handleTopUp = () => {
    updateWalletBalance(10.00);
    setShowUpgradeModal(false);
    toast.success('Wallet topped up with $10.00!');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              <CardTitle>Ask Follow-up Questions</CardTitle>
            </div>
            {freeQuestionsLeft > 0 && (
              <Badge variant="secondary">
                {freeQuestionsLeft} free questions left
              </Badge>
            )}
          </div>
          <CardDescription>
            Context: Report - {reportTitle}, Date: Today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Ask me anything about your lab results!</p>
                <p className="text-sm mt-1">
                  I can explain specific values, symptoms, or recommendations.
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-sm px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 text-gray-900 max-w-sm px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.1s' }}></div>
                    <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Usage Warning */}
          {freeQuestionsLeft === 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <CreditCard className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                You've used your free questions. Each additional question costs $1.00. 
                Current balance: <strong>${user?.walletBalance.toFixed(2)}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your results..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !message.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Example Questions */}
          {chatMessages.length === 0 && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Example questions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "What does my hemoglobin level mean?",
                  "Are my white blood cells normal?",
                  "Should I be concerned about anything?"
                ].map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setMessage(question)}
                    className="text-xs"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
              Insufficient Balance
            </DialogTitle>
            <DialogDescription>
              You need at least $1.00 to ask additional questions. 
              Current balance: ${user?.walletBalance.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleTopUp}>
              <CreditCard className="h-4 w-4 mr-2" />
              Top Up $10.00
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}