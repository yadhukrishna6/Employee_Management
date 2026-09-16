import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCircle, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const Profile: React.FC = () => {
  const { user, organization } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setSuccessMsg(null);
    setApiError(null);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccessMsg('Password updated successfully. Other active sessions have been invalidated.');
      reset();
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to update password.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Profile</h1>
        <p className="text-sm text-slate-500">Manage security settings and review your organization profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <Avatar
              src={user?.employee?.profileImage}
              firstName={user?.employee?.firstName}
              lastName={user?.employee?.lastName}
              employeeCode={user?.employee?.employeeCode}
              email={user?.email}
              size="2xl"
            />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.employee?.designation || user?.role?.replace('_', ' ')}
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-2 text-xs">
            <div>
              <span className="text-slate-400 block">Email:</span>
              <span className="font-semibold text-slate-800">{user?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Role:</span>
              <span className="font-semibold text-slate-800">{user?.role}</span>
            </div>
            {organization && (
              <div>
                <span className="text-slate-400 block">Organization:</span>
                <span className="font-semibold text-slate-800">{organization.name}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Change Password */}
        <Card title="Change Password" className="md:col-span-2">
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" /> {successMsg}
            </div>
          )}

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-semibold">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              placeholder="••••••••"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              type="password"
              label="New Password"
              placeholder="••••••••"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              type="password"
              label="Confirm New Password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isSubmitting}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
