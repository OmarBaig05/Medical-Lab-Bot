import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, Camera, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [verificationFile, setVerificationFile] = useState<File | null>(null);

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
    toast.success('Password updated successfully!');
  };

  const handleVerificationUpload = (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, JPG, or PNG file');
      return;
    }
    
    setVerificationFile(file);
    toast.success('Verification document uploaded! Review in progress.');
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your profile information and account preferences
          </p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your account details and contact information
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-medium text-blue-700">
                  {user?.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium">{user?.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center mt-2">
                  <Badge variant={user?.role === 'Doctor' ? 'default' : 'secondary'}>
                    {user?.role}
                  </Badge>
                  {user?.role === 'Doctor' && user?.verified && (
                    <Badge variant="outline" className="ml-2 text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <Button onClick={handleSaveProfile}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage your password and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-gray-600">Last changed 30 days ago</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                Change Password
              </Button>
            </div>

            {showPasswordForm && (
              <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
                <h4 className="font-medium">Change Password</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input
                    id="current"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input
                      id="new"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleChangePassword}>
                    Update Password
                  </Button>
                  <Button variant="outline" onClick={() => setShowPasswordForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <Button variant="outline">
                  Enable 2FA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Verification */}
        {user?.role === 'Doctor' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Doctor Verification
              </CardTitle>
              <CardDescription>
                Upload credentials to verify your medical license
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {user?.verified ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your account is verified! You have access to all Doctor plan features.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Your account is not yet verified. Upload your medical license or credentials to access advanced features.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label>Upload Medical License or Credentials</Label>
                  <div className="mt-2">
                    {verificationFile ? (
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                        <div>
                          <p className="font-medium text-green-700">{verificationFile.name}</p>
                          <p className="text-sm text-green-600">
                            {(verificationFile.size / 1024 / 1024).toFixed(2)} MB - Under Review
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setVerificationFile(null)}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="text-gray-600 mb-4">
                          Drag and drop your credentials, or click to browse
                        </p>
                        <Button variant="outline">
                          Choose File
                        </Button>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => e.target.files && handleVerificationUpload(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Accepted formats: PDF, JPG, PNG. Max size: 10MB
                  </p>
                </div>

                {!user?.verified && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Required Documentation</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Medical license or board certification</li>
                      <li>• Professional identification with photo</li>
                      <li>• Hospital or clinic affiliation letter (if applicable)</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Type */}
        <Card>
          <CardHeader>
            <CardTitle>Account Plan</CardTitle>
            <CardDescription>
              Manage your subscription and billing preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{user?.role} Plan</h4>
                <p className="text-sm text-gray-600">
                  Pay-as-you-go billing • ${user?.role === 'Doctor' ? '4.99' : '2.99'} per report
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  {user?.role === 'Doctor' ? 'Downgrade' : 'Upgrade'} Plan
                </Button>
                <Button variant="outline">
                  View Billing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-600">Delete Account</h4>
                <p className="text-sm text-gray-600">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}