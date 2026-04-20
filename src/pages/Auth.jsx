import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { isFirebaseConfigured } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isLoadingAuth } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });

  // Redirect to lobby if already authenticated
  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      navigate('/lobby');
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
        toast.success('Logged in successfully!');
        navigate('/lobby');
      } else {
        if (!formData.displayName) {
          toast.error('Please enter a display name');
          setLoading(false);
          return;
        }
        await register(formData.email, formData.password, formData.displayName);
        toast.success('Account created! Welcome!');
        navigate('/lobby');
      }
    } catch (error) {
      // If user tries to login but account doesn't exist
      if (error.code === 'auth/user-not-found' && isLoginMode) {
        toast.info('No account found. Please create one!');
        setIsLoginMode(false);
        // Clear password for security
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 shadow-xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">♟️ Stratego</h1>
            <p className="text-slate-400">Multiplayer Board Game Arena</p>
          </div>
          {!isFirebaseConfigured && (
            <div className="mb-6 rounded-lg border border-yellow-500 bg-yellow-500/10 p-4 text-sm text-yellow-100">
              <strong>Firebase is not configured.</strong> Update <code>src/lib/firebase.js</code> with your real Firebase web app credentials and enable Authentication.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginMode && (
              <div>
                <Label htmlFor="displayName" className="text-slate-300">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="Your nickname"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                disabled={loading}
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !isFirebaseConfigured}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isLoginMode ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLoginMode ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-slate-400 text-sm mb-3">
              {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <Button
              variant="ghost"
              onClick={() => setIsLoginMode(!isLoginMode)}
              disabled={loading}
              className="text-blue-400 hover:text-blue-300"
            >
              {isLoginMode ? 'Create one' : 'Sign in instead'}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              By signing in, you agree to our terms of service
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
