import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Building,
  Shield,
  ShieldCheck,
  Users,
  Briefcase,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';

const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid work email'),
  password: z.string().min(1, 'Password is required'),
  organizationCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

interface PersonaOption {
  id: string;
  roleTitle: string;
  description: string;
  email: string;
  orgCode: string;
  icon: React.ElementType;
}

const DEMO_PERSONAS: PersonaOption[] = [
  {
    id: 'admin',
    roleTitle: 'Organization Admin',
    description: 'Full governance & workforce control',
    email: 'admin@example.com',
    orgCode: 'ABCTECH',
    icon: ShieldCheck,
  },
  {
    id: 'hr',
    roleTitle: 'HR Director',
    description: 'Employees, records & attendance',
    email: 'hr@example.com',
    orgCode: 'ABCTECH',
    icon: Users,
  },
  {
    id: 'manager',
    roleTitle: 'Team Manager',
    description: 'Team approvals & appraisals',
    email: 'manager@example.com',
    orgCode: 'ABCTECH',
    icon: Briefcase,
  },
  {
    id: 'employee',
    roleTitle: 'Staff Employee',
    description: 'Daily punch clock & self-service',
    email: 'employee@example.com',
    orgCode: 'ABCTECH',
    icon: User,
  },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<string | null>('admin');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'Password@123',
      organizationCode: 'ABCTECH',
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
        err.response?.data?.message || 'Invalid credentials. Please verify your email and password.'
      );
    }
  };

  const handleSelectPersona = (p: PersonaOption) => {
    setSelectedPersona(p.id);
    setValue('email', p.email);
    setValue('password', 'Password@123');
    setValue('organizationCode', p.orgCode);
    setApiError(null);
  };

  const handleSelectSuperAdmin = () => {
    setSelectedPersona('superadmin');
    setValue('email', 'superadmin@example.com');
    setValue('password', 'Password@123');
    setValue('organizationCode', '');
    setApiError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-blue-500 selection:text-white antialiased font-sans">
      {/* Left Showcase Banner - Desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 p-12 flex-col justify-between border-r border-slate-800/80 overflow-hidden">
        {/* Subtle grid background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

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
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">Enterprise</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              Modern Workforce & Human Capital Operations
            </span>
          </div>
        </div>

        {/* Hero Narrative */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Emplyo Cloud Suite v2.0</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Orchestrate your workforce with precision.
          </h1>

          <p className="mt-4 text-base text-slate-400 leading-relaxed font-normal">
            A unified human resources and payroll engine built for modern multi-entity
            organizations. Strict tenant data isolation, granular RBAC, and real-time operational analytics.
          </p>

          {/* Feature Pillars */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-800/80">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-200">Organization Hierarchy</div>
              <div className="text-xs text-slate-500">Self-referencing tree & direct reporting chains</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-200">Automated Attendance</div>
              <div className="text-xs text-slate-500">Precision working hour calculations & logs</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-200">Leave Workflows</div>
              <div className="text-xs text-slate-500">Balance tracking with overlap prevention</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-200">Security & Auditing</div>
              <div className="text-xs text-slate-500">Immutable audit logs with JWT token rotation</div>
            </div>
          </div>
        </div>

        {/* Trust Badges Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>SOC-2 & ISO 27001 Compliant Architecture</span>
          </div>
          <div className="font-mono text-[11px]">99.99% Uptime</div>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md space-y-7">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-2.5 lg:hidden mb-4">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-600/30">
                E
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">Emplyo</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Sign in to your portal
            </h2>
            <p className="mt-1.5 text-xs text-slate-400">
              Enter your enterprise credentials or choose a demonstration persona below.
            </p>
          </div>

          {/* Demo Persona Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-slate-400 uppercase tracking-wider">
                Select a Demo Account
              </span>
              <button
                type="button"
                onClick={handleSelectSuperAdmin}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  selectedPersona === 'superadmin'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-purple-400 hover:text-purple-300'
                }`}
              >
                ⚡ Super Admin
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_PERSONAS.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    className={`p-2.5 rounded-lg border text-left transition-all duration-150 flex items-start space-x-2.5 ${
                      isSelected
                        ? 'border-blue-500/80 bg-blue-500/10 text-white shadow-sm ring-1 ring-blue-500/30'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-md mt-0.5 ${
                        isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold truncate text-slate-200 block">
                        {p.roleTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {p.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {apiError && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start space-x-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className={`block w-full pl-9 pr-3 py-2 bg-slate-900/80 border text-xs text-white rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500/60 bg-red-950/20' : 'border-slate-800 hover:border-slate-700'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-500 hover:text-slate-400 cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className={`block w-full pl-9 pr-10 py-2 bg-slate-900/80 border text-xs text-white rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-500/60 bg-red-950/20' : 'border-slate-800 hover:border-slate-700'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Organization Code Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Organization Slug <span className="text-slate-500 font-normal">(Optional for Super Admins)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. ABCTECH"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs text-white rounded-lg uppercase tracking-wider font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  {...register('organizationCode')}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-slate-950"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-500">
              Need assistance? Contact your organization administrator or IT desk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
