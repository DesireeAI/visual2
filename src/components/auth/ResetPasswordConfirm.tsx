import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import { CustomButton } from '../ui/CustomButton';
import { CustomInput } from '../ui/CustomInput';
import { supabase } from '../../lib/supabase';

const ResetPasswordConfirm: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = new URLSearchParams(location.hash.slice(1));
    const accessToken = hash.get('access_token');
    if (accessToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: '' });
    } else {
      setError('Invalid or expired reset link. Please try again.');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage('Password updated successfully! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        {message ? (
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-green-600 mb-6">{message}</p>
            <CustomButton variant="outline" onClick={() => navigate('/login')} className="w-full">
              Back to Login
            </CustomButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <CustomInput
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setNewPassword(e.target.value);
                if (error) setError('');
              }}
              error={error && newPassword === '' ? error : ''}
              placeholder="Enter new password"
            />
            <CustomInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              error={error && confirmPassword === '' ? error : ''}
              placeholder="Confirm new password"
            />
            {error && <p className="text-red-600">{error}</p>}
            <CustomButton type="submit" className="w-full" loading={loading}>
              Update Password
            </CustomButton>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;