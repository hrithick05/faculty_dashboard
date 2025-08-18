import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ChangePasswordForm = ({ facultyId, onClose }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.oldPassword) {
      toast({
        title: "Validation Error",
        description: "Please enter your Faculty ID as the current password.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.newPassword) {
      toast({
        title: "Validation Error",
        description: "Please enter a new password.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.newPassword.length < 3) {
      toast({
        title: "Validation Error",
        description: "New password must be at least 3 characters long.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New password and confirm password do not match.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.oldPassword === formData.newPassword) {
      toast({
        title: "Validation Error",
        description: "New password must be different from your Faculty ID.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/faculty/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facultyId,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
        toast({
          title: "Password Changed Successfully! 🎉",
          description: "Your password has been updated. Please log in again with your new password.",
        });
        
        // Clear form and close modal after a delay
        setTimeout(() => {
          onClose();
          // Clear session and redirect to login
          localStorage.removeItem('loggedInFaculty');
          navigate('/login');
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('❌ Password change error:', error);
      toast({
        title: "Password Change Failed",
        description: error.message || "Could not change password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Changed Successfully!</h3>
        <p className="text-gray-600">You will be redirected to login in a moment...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Old Password */}
      <div className="space-y-2">
        <Label htmlFor="oldPassword" className="text-sm font-medium text-gray-700">
          Current Password (Your Faculty ID)
        </Label>
        <div className="relative">
          <Input
            id="oldPassword"
            type={showPasswords.oldPassword ? "text" : "password"}
            value={formData.oldPassword}
            onChange={(e) => handleInputChange('oldPassword', e.target.value)}
            placeholder="Enter your Faculty ID (e.g., CSE001)"
            className="pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => togglePasswordVisibility('oldPassword')}
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          >
            {showPasswords.oldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Your current password is your Faculty ID (e.g., CSE001)
        </p>
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
          New Password
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPasswords.newPassword ? "text" : "password"}
            value={formData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            placeholder="Enter new password (min 3 characters)"
            className="pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => togglePasswordVisibility('newPassword')}
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          >
            {showPasswords.newPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirm New Password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showPasswords.confirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your new password"
            className="pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => togglePasswordVisibility('confirmPassword')}
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          >
            {showPasswords.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Password Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Current password is your Faculty ID (e.g., CSE001)</li>
          <li>• New password must be at least 3 characters long</li>
          <li>• Must be different from your Faculty ID</li>
          <li>• New password and confirm password must match</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Changing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
