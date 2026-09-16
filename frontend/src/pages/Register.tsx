import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Building,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  User,
  Globe,
  Phone,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService, RegisterPayload } from '../services/auth.service';

const registerFormSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  organizationCode: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code must not exceed 20 characters')
    .regex(/^[A-Z0-9_-]+$/i, 'Only letters, numbers, hyphens, and underscores allowed'),
  organizationEmail: z.string().email('Please enter a valid company email'),
  adminFirstName: z.string().min(1, 'First name is required'),
  adminLastName: z.string().min(1, 'Last name is required'),
  adminEmail: z.string().email('Please enter a valid admin email'),
  adminPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
    .regex(/[a-z]/, 'Must contain at least 1 lowercase letter')
    .regex(/[0-9]/, 'Must contain at least 1 number'),
  phone: z.string().optional(),
  website: z.string().url('Must be a valid URL (e.g. https://company.com)').optional().or(z.literal('')),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      organizationName: '',
      organizationCode: '',
      organizationEmail: '',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPassword: '',
      phone: '',
      website: '',
    },
  });

  const passwordVal = watch('adminPassword') || '';
  const hasMinLength = passwordVal.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordVal);
  const hasLower = /[a-z]/.test(passwordVal);
  const hasNumber = /[0-9]/.test(passwordVal);

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('organizationName', val);
    // Auto-generate uppercase slug without spaces/symbols
    const slug = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    setValue('organizationCode', slug);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      const payload: RegisterPayload = {
        ...data,
        organizationCode: data.organizationCode.toUpperCase(),
        adminEmail: data.adminEmail.toLowerCase(),
        organizationEmail: data.organizationEmail.toLowerCase(),
      };

      const res = await authService.register(payload);
      login(res.data.tokens.accessToken, res.data.tokens.refreshToken, res.data.user);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setApiError(
        err.response?.data?.message || 'Registration failed. Please check the details and try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-blue-500 selection:text-white antialiased font-sans">
      {/* Left Showcase Banner - Desktop */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 p-12 flex-col justify-between border-r border-slate-800/80 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg tracking-tighter shadow-lg shadow-blue-600/30">
            E
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-white text-base tracking-tight block">
                Emplyo
              </span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                Self-Service Onboarding
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              Enterprise Workforce Management Platform
            </span>
          </div>
        </div>

        {/* Feature Narrative */}
        <div className="relative z-10 max-w-md my-auto py-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Organization Provisioning</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.2]">
            Launch your company workspace in seconds.
          </h1>

          <p className="mt-4 text-sm text-slate-400 leading-relaxed font-normal">
            Get instant multi-tenant isolation, default leave policies, org hierarchy charting, and complete workforce governance out of the box.
          </p>

          <div className="space-y-3.5 mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300">Dedicated Tenant Organization & Slug</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300">Automatic Leave Policies (Casual, Sick, Annual)</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300">Super Admin & Organization Admin Control</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300">Precision Attendance Clock & Payslip Engine</span>
            </div>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>Zero-Trust Data Isolation</span>
          </div>
          <div className="font-mono text-[11px]">Free Tier Enabled</div>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2.5 lg:hidden mb-3">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-600/30">
                  E
                </div>
                <span className="font-extrabold text-white text-lg tracking-tight">Emplyo</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Create Organization Account
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Register your organization to start managing employees, attendance, and payroll.
              </p>
            </div>
            <Link
              to="/login"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Back to Sign In →
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {apiError && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start space-x-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Section 1: Organization Information */}
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-800/60 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Building className="w-4 h-4 text-blue-400" />
                <span>1. Organization Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Org Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corporation"
                    className={`block w-full px-3 py-2 bg-slate-900 border text-xs text-white rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.organizationName ? 'border-red-500/60 bg-red-950/20' : 'border-slate-800 hover:border-slate-700'
                    }`}
                    {...register('organizationName', { onChange: handleOrgNameChange })}
                  />
                  {errors.organizationName && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.organizationName.message}</p>
                  )}
                </div>

                {/* Org Code / Slug */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Organization Slug * <span className="text-slate-500 font-normal">(Login Code)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ACMECORP"
                    className={`block w-full px-3 py-2 bg-slate-900 border text-xs text-white uppercase font-mono tracking-wider rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.organizationCode ? 'border-red-500/60 bg-red-950/20' : 'border-slate-800 hover:border-slate-700'
                    }`}
                    {...register('organizationCode')}
                  />
                  {errors.organizationCode && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.organizationCode.message}</p>
                  )}
                </div>

                {/* Org Email */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Official Company Email *
                  </label>
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    className={`block w-full px-3 py-2 bg-slate-900 border text-xs text-white rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.organizationEmail ? 'border-red-500/60 bg-red-950/20' : 'border-slate-800 hover:border-slate-700'
                    }`}
                    {...register('organizationEmail')}
                  />
                  {errors.organizationEmail && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.organizationEmail.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Administrator Profile */}
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-800/60 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <User className="w-4 h-4 text-indigo-400" />
                <span>2. Organization Administrator Profile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John"
                    className={`block w-full px-3 py-2 bg-slate-900 border text-xs text-white rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.adminFirstName ? 'border-red-500/60 bg-red-950/20' : 'border-slate-800 hover:border-slate-700'
                    }`}
                    {...register('adminFirstName')}
                  />
                  {errors.adminFirstName && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.adminFirstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Doe"
                    className={`block w-full px-3 py-2 bg-slate-900 border text-xs text-white rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.adminLastName ? 'border-red-500/60 bg-red-950/20' : 'border-slate-800 hover:border-slate-700'
                    }`}
                    {...register('adminLastName')}
                  />
                  {errors.adminLastName && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.adminLastName.message}</p>
                  )}
                </div>

                {/* Admin Email */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Admin Work Email (Login Email) *
                  </label>
                  <input
                    type="email"
                    placeholder="admin@company.com"
                    className={`block w-full px-3 py-2 bg-slate-900 border text-xs text-white rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.adminEmail ? 'border-red-500/60 bg-red-950/20' : 'border-slate-800 hover:border-slate-700'
                    }`}
                    {...register('adminEmail')}
                  />
                  {errors.adminEmail && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.adminEmail.message}</p>
                  )}
                </div>

                {/* Admin Password */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Admin Secure Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      className={`block w-full px-3 pr-10 py-2 bg-slate-900 border text-xs text-white rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.adminPassword ? 'border-red-500/60 bg-red-950/20' : 'border-slate-800 hover:border-slate-700'
                      }`}
                      {...register('adminPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password rules indicator */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[10px]">
                    <span className={hasMinLength ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                      {hasMinLength ? '✓' : '○'} 8+ Characters
                    </span>
                    <span className={hasUpper ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                      {hasUpper ? '✓' : '○'} Uppercase (A-Z)
                    </span>
                    <span className={hasLower ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                      {hasLower ? '✓' : '○'} Lowercase (a-z)
                    </span>
                    <span className={hasNumber ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                      {hasNumber ? '✓' : '○'} Number (0-9)
                    </span>
                  </div>
                  {errors.adminPassword && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.adminPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-blue-600/30 transition-all duration-150 flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Provisioning Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Organization & Launch Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Back to Login link */}
            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">
                Already registered?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4"
                >
                  Sign in here
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
