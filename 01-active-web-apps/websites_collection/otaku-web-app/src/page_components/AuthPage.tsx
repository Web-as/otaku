import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { markJustRegistered } from '@/shared/membership/passPrompt';
import { getReadableAuthError } from '@/lib/firebase/auth';

const AuthPage: React.FC = () => {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setApiError('');

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!isLogin && !formData.username) newErrors.username = 'Username is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // For login, use username (email can be username)
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
        markJustRegistered();
      }
      router.push(isLogin ? '/app/library' : '/app/membership?new_member=1');
    } catch (error: any) {
      setApiError(getReadableAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-400 text-center text-sm">
          {isLogin
            ? 'Sign in to your account'
            : 'Create your account — then get your Library Admission Card in inventory'}
        </p>
      </div>

      {!isLogin && (
        <div className="mb-4 p-3 rounded-lg border border-amber-500/30 bg-amber-950/20 text-sm text-amber-100/90">
          <strong>Registered guest:</strong> after sign-up we&apos;ll prompt you for the Library Pass
          (~€2.50/mo) to mint your card and unlock inventory + member stacks.
        </div>
      )}

      {apiError && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <Input
            label="Username"
            type="text"
            placeholder="Enter your username"
            icon={User}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            error={errors.username}
          />
        )}

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          icon={Mail}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={Lock}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
        />

        {isLogin && (
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-violet-400 hover:text-violet-300"
            >
              Forgot password?
            </button>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-gray-400 hover:text-white"
        >
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span className="text-violet-400 font-semibold">
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </Card>
  );
};

export default AuthPage;
