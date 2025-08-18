import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { CustomButton } from '../ui/CustomButton';
import { CustomInput } from '../ui/CustomInput';
import { supabase } from '../../lib/supabase';

interface ResetPasswordFormProps {
  onBack: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password-confirm`,
      });
      if (error) throw error;
      setMessage('Password reset email sent! Please check your inbox.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email. Please try again.';
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
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600">Enter your email to receive a password reset link</p>
        </div>

        {message ? (
          <div className="text-center">
            <p className="text-green-600 mb-6">{message}</p>
            <CustomButton variant="outline" onClick={onBack} className="w-full">
              Back to Login
            </CustomButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <CustomInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              error={error}
              placeholder="Enter your email"
            />
            {error && <p className="text-red-600">{error}</p>}
            <CustomButton type="submit" className="w-full" loading={loading}>
              Send Reset Link
            </CustomButton>
            <CustomButton type="button" variant="outline" onClick={onBack} className="w-full">
              Back to Login
            </CustomButton>
          </form>
        )}
      </div>
    </div>
  );
};