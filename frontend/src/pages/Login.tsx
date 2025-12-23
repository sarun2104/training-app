import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      // Navigation will be handled by the router after login
      const user = localStorage.getItem('user');
      const role = user ? JSON.parse(user).role : null;
      navigate(role === 'admin' ? '/admin' : '/employee');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4 py-10">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-apple-xl shadow-apple-lg mb-5">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-headline text-apple-gray-6">
            Welcome back
          </h1>
          <p className="mt-2 text-body-large text-apple-gray-4">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-apple rounded-apple-xl shadow-apple-xl border border-white/30 p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-apple animate-scale-in">
                <div className="flex-shrink-0 w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-apple-red" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-body text-apple-red">{error}</p>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
              variant="filled"
              icon={<Mail size={18} />}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              variant="filled"
              icon={<Lock size={18} />}
            />

            <Button 
              type="submit" 
              className="w-full mt-2" 
              size="lg"
              loading={loading}
            >
              {!loading && (
                <>
                  Sign In
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-apple-gray-2"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-caption text-apple-gray-4">
                Demo credentials
              </span>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setUsername('admin@company.com');
                setPassword('admin123');
              }}
              className="w-full flex items-center gap-3 p-4 bg-apple-gray-1 hover:bg-apple-gray-2 rounded-apple transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-apple flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-body font-medium text-apple-gray-6">Admin Account</p>
                <p className="text-caption text-apple-gray-4">admin@company.com</p>
              </div>
              <ArrowRight size={18} className="text-apple-gray-4 group-hover:text-apple-gray-6 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => {
                setUsername('john.doe@company.com');
                setPassword('admin123');
              }}
              className="w-full flex items-center gap-3 p-4 bg-apple-gray-1 hover:bg-apple-gray-2 rounded-apple transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-apple flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-body font-medium text-apple-gray-6">Employee Account</p>
                <p className="text-caption text-apple-gray-4">john.doe@company.com</p>
              </div>
              <ArrowRight size={18} className="text-apple-gray-4 group-hover:text-apple-gray-6 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-body text-apple-gray-4 mt-6">
          © 2025 NeuLearn. Crafted with care.
        </p>
      </div>
    </div>
  );
};
