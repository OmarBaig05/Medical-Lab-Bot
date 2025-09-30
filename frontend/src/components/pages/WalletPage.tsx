import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, Plus, CreditCard, DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
}

export default function WalletPage() {
  const { user, updateWalletBalance } = useAuth();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('10.00');

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'credit',
      amount: 20.00,
      description: 'Wallet top-up via Credit Card',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: '2',
      type: 'debit',
      amount: 2.99,
      description: 'Lab Report Analysis - CBC',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: '3',
      type: 'debit',
      amount: 1.00,
      description: 'Follow-up Question',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: '4',
      type: 'credit',
      amount: 10.00,
      description: 'Wallet top-up via PayPal',
      date: '2024-01-10',
      status: 'completed'
    },
    {
      id: '5',
      type: 'debit',
      amount: 4.99,
      description: 'Lab Report Analysis - Lipid Panel',
      date: '2024-01-10',
      status: 'completed'
    }
  ];

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (amount < 5) {
      toast.error('Minimum top-up amount is $5.00');
      return;
    }
    
    updateWalletBalance(amount);
    setShowTopUpModal(false);
    toast.success(`Successfully added $${amount.toFixed(2)} to your wallet!`);
  };

  const quickAmounts = ['5.00', '10.00', '25.00', '50.00'];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet & Billing</h1>
            <p className="text-gray-600 mt-1">
              Manage your account balance and view transaction history
            </p>
          </div>
          <Button onClick={() => setShowTopUpModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Top Up Wallet
          </Button>
        </div>

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Wallet className="h-5 w-5 mr-2 text-green-600" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600 mb-2">
                ${user?.walletBalance.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600">Available for use</p>
              <Button 
                className="w-full mt-4" 
                onClick={() => setShowTopUpModal(true)}
              >
                Add Funds
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                $7.98
              </div>
              <p className="text-sm text-gray-600 mb-2">Total spent</p>
              <div className="text-sm">
                <span className="text-green-600">2 reports analyzed</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Next Billing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                Pay-as-go
              </div>
              <p className="text-sm text-gray-600 mb-2">Billing model</p>
              <div className="text-sm text-purple-600">
                No monthly fees
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Current Pricing</CardTitle>
            <CardDescription>
              Transparent pay-as-you-go pricing for {user?.role} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Lab Report Analysis</span>
                  <Badge variant="outline">
                    ${user?.role === 'Doctor' ? '4.99' : '2.99'} per report
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Follow-up Questions</span>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      2 free per report
                    </Badge>
                    <p className="text-sm text-gray-600">$1.00 each after</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>PDF Export</span>
                  <Badge variant="secondary">Free</Badge>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Account Type: {user?.role}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {user?.role === 'Doctor' 
                    ? 'Advanced clinical interpretation with medical terminology and recommendations.'
                    : 'Patient-friendly explanations with easy-to-understand language.'
                  }
                </p>
                <Button variant="outline" size="sm">
                  {user?.role === 'Doctor' ? 'Downgrade to Patient' : 'Upgrade to Doctor'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Your recent wallet activity and billing history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      transaction.type === 'credit' 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <ArrowDownRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'credit' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}
                      ${transaction.amount.toFixed(2)}
                    </p>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No transactions yet</p>
                <p className="text-sm">Your transaction history will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Up Modal */}
        <Dialog open={showTopUpModal} onOpenChange={setShowTopUpModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Top Up Wallet
              </DialogTitle>
              <DialogDescription>
                Add funds to your wallet to continue using the service
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="5"
                  step="0.01"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                />
                <p className="text-sm text-gray-600">Minimum top-up: $5.00</p>
              </div>

              <div className="space-y-2">
                <Label>Quick amounts</Label>
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setTopUpAmount(amount)}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Payment Summary</h4>
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span>${parseFloat(topUpAmount || '0').toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing Fee:</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${parseFloat(topUpAmount || '0').toFixed(2)}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTopUpModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleTopUp}>
                <CreditCard className="h-4 w-4 mr-2" />
                Add Funds
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}