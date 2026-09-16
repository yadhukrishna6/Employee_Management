import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  organizationCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      organizationCode: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      const res = await authService.login(data);
      login(res.data.tokens.accessToken, res.data.tokens.refreshToken, res.data.user);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setApiError(
        err.response?.data?.message || 'Login failed. Please verify your credentials and try again.'
      );
    }
  };

  // Quick fill helper for testing demo roles
  const fillDemo = (email: string, orgCode = 'ABCTECH') => {
    setValue('email', email);
    setValue('password', 'Password@123');
    setValue('organizationCode', email.includes('superadmin') ? '' : orgCode);
    setApiError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600 items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 mb-4">
          EM
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Enterprise Employee Management
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Multi-Tenant SaaS Human Capital System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          {apiError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Work Email"
              placeholder="e.g. admin@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Organization Code (Optional)"
              placeholder="e.g. ABCTECH"
              leftIcon={<Building2 className="w-4 h-4" />}
              helperText="Required if your email is registered in multiple companies"
              error={errors.organizationCode?.message}
              {...register('organizationCode')}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isSubmitting}
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick Demo Accounts (Click to test):
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo('admin@example.com')}
                className="p-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 text-left font-medium transition-colors"
              >
                🏢 Org Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('hr@example.com')}
                className="p-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 text-left font-medium transition-colors"
              >
                👥 HR Lead
              </button>
              <button
                type="button"
                onClick={() => fillDemo('manager@example.com')}
                className="p-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 text-left font-medium transition-colors"
              >
                👔 Manager
              </button>
              <button
                type="button"
                onClick={() => fillDemo('employee@example.com')}
                className="p-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 text-left font-medium transition-colors"
              >
                💻 Employee
              </button>
              <button
                type="button"
                onClick={() => fillDemo('superadmin@example.com')}
                className="col-span-2 p-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 rounded border border-slate-200 text-center font-medium transition-colors"
              >
                ⚡ Super Admin (System Wide)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
