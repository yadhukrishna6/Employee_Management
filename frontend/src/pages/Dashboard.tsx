import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Building2,
  CalendarDays,
  CalendarCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { dashboardService } from '../services/dashboard.service';
import { attendanceService } from '../services/attendance.service';
import { leaveService } from '../services/leave.service';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export const Dashboard: React.FC = () => {
  const { role } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboardData,
  });

  // Employee Check-In Mutation
  const checkInMutation = useMutation({
    mutationFn: () => attendanceService.checkIn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Employee Check-Out Mutation
  const checkOutMutation = useMutation({
    mutationFn: () => attendanceService.checkOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Manager Approve Leave Mutation
  const approveLeaveMutation = useMutation({
    mutationFn: (id: string) => leaveService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-100 p-4 animate-pulse"></div>
          ))}
        </div>
        <LoadingSkeleton rows={4} columns={4} />
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h3 className="font-bold">Failed to load dashboard</h3>
        <p className="text-sm mt-1">Please ensure the backend API server is running.</p>
      </div>
    );
  }

  const d = data.data;

  // ----------------------------------------------------
  // 1. SUPER ADMIN DASHBOARD
  // ----------------------------------------------------
  if (role === 'SUPER_ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
          <p className="text-sm text-slate-500">Multi-tenant platform statistics</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{d.stats.totalOrganizations}</div>
              <div className="text-xs text-slate-500">Total Organizations</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{d.stats.activeOrganizations}</div>
              <div className="text-xs text-slate-500">Active Tenants</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{d.stats.totalUsers}</div>
              <div className="text-xs text-slate-500">System Users</div>
            </div>
          </Card>
        </div>

        <Card title="Recent Organizations">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Code</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Employees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {d.recentOrganizations.map((org: any) => (
                  <tr key={org.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{org.name}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{org.code}</td>
                    <td className="px-4 py-3 text-slate-600">{org.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={org.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {org.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {org._count.employees}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. ORGANIZATION ADMIN / HR DASHBOARD
  // ----------------------------------------------------
  if (role === 'ORGANIZATION_ADMIN' || role === 'HR') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organization Dashboard</h1>
          <p className="text-sm text-slate-500">Workforce metrics & operations overview</p>
        </div>

        {/* 4 Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{d.stats.totalEmployees}</div>
              <div className="text-xs text-slate-500">Total Headcount</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{d.stats.attendanceToday.present}</div>
              <div className="text-xs text-slate-500">Present Today</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{d.stats.pendingLeaves}</div>
              <div className="text-xs text-slate-500">Pending Leave Requests</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{d.stats.totalDepartments}</div>
              <div className="text-xs text-slate-500">Departments</div>
            </div>
          </Card>
        </div>

        {/* Chart & Attendance Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Headcount by Department" className="lg:col-span-2">
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.charts.employeesByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="department" stroke="#94a3b8" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Employees" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Today's Attendance Status">
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-800">Present</span>
                <span className="text-sm font-bold text-emerald-700">{d.stats.attendanceToday.present}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-lg border border-amber-100">
                <span className="text-xs font-semibold text-amber-800">Half Day</span>
                <span className="text-sm font-bold text-amber-700">{d.stats.attendanceToday.halfDay}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-sky-50/60 rounded-lg border border-sky-100">
                <span className="text-xs font-semibold text-sky-800">On Leave</span>
                <span className="text-sm font-bold text-sky-700">{d.stats.attendanceToday.onLeave}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50/60 rounded-lg border border-rose-100">
                <span className="text-xs font-semibold text-rose-800">Absent / Unmarked</span>
                <span className="text-sm font-bold text-rose-700">{d.stats.attendanceToday.absent}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. MANAGER DASHBOARD
  // ----------------------------------------------------
  if (role === 'MANAGER') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manager Dashboard</h1>
          <p className="text-sm text-slate-500">Team oversight, attendance, and leave approvals</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{d.stats.teamSize}</div>
              <div className="text-xs text-slate-500">Direct Reports</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{d.stats.teamPresentToday}</div>
              <div className="text-xs text-slate-500">Present Today</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{d.stats.pendingTeamLeaves}</div>
              <div className="text-xs text-slate-500">Leave Approvals</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {d.stats.averageTeamRating ? `${d.stats.averageTeamRating} / 5` : 'N/A'}
              </div>
              <div className="text-xs text-slate-500">Avg Performance</div>
            </div>
          </Card>
        </div>

        {/* Pending Team Leaves */}
        <Card title="Pending Team Leave Approvals">
          {d.pendingLeaves.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No pending leave requests from your team.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {d.pendingLeaves.map((req: any) => (
                <div key={req.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-slate-900">
                      {req.employee.firstName} {req.employee.lastName}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {req.leaveType.name} ({req.numberOfDays} days) • {req.startDate.split('T')[0]} to {req.endDate.split('T')[0]}
                    </span>
                    <p className="text-xs text-slate-600 italic mt-0.5">"{req.reason}"</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={approveLeaveMutation.isPending}
                      onClick={() => approveLeaveMutation.mutate(req.id)}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------
  // 4. EMPLOYEE DASHBOARD
  // ----------------------------------------------------
  const todayAtt = d.todayAttendance;
  const isCheckedIn = !!todayAtt?.checkIn;
  const isCheckedOut = !!todayAtt?.checkOut;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Workspace</h1>
        <p className="text-sm text-slate-500">Daily check-in, leave balances, and salary overview</p>
      </div>

      {/* Check-In Card & Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Punch Card */}
        <Card title="Today's Attendance" className="flex flex-col justify-between">
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Current Status:</span>
              <Badge variant={isCheckedIn ? (isCheckedOut ? 'neutral' : 'success') : 'warning'}>
                {isCheckedOut ? 'Checked Out' : isCheckedIn ? 'Checked In (Active)' : 'Not Checked In'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-center">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Check In</span>
                <div className="text-sm font-bold text-slate-800 mt-0.5">
                  {isCheckedIn ? new Date(todayAtt.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Check Out</span>
                <div className="text-sm font-bold text-slate-800 mt-0.5">
                  {isCheckedOut ? new Date(todayAtt.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
              </div>
            </div>

            {isCheckedIn && (
              <div className="text-center text-xs text-slate-600 font-medium">
                ⏱️ Logged: <span className="font-bold text-blue-600">{todayAtt.workingHours || 0} hrs</span>
              </div>
            )}
          </div>

          <div className="pt-6">
            {!isCheckedIn ? (
              <Button
                className="w-full"
                variant="primary"
                size="lg"
                isLoading={checkInMutation.isPending}
                onClick={() => checkInMutation.mutate()}
              >
                <Clock className="w-4 h-4 mr-2" /> Clock In Now
              </Button>
            ) : !isCheckedOut ? (
              <Button
                className="w-full"
                variant="danger"
                size="lg"
                isLoading={checkOutMutation.isPending}
                onClick={() => checkOutMutation.mutate()}
              >
                <Clock className="w-4 h-4 mr-2" /> Clock Out
              </Button>
            ) : (
              <div className="text-center text-xs text-emerald-600 font-semibold py-2">
                ✓ Attendance completed for today!
              </div>
            )}
          </div>
        </Card>

        {/* Leave Balances Progress */}
        <Card title="Leave Balances" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {d.leaveBalances.map((bal: any) => {
              const percent = bal.allocated > 0 ? (bal.remaining / bal.allocated) * 100 : 0;
              return (
                <div key={bal.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <span className="text-xs font-semibold text-slate-800">{bal.leaveType.name}</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-bold text-blue-600">{bal.remaining}</span>
                    <span className="text-xs text-slate-500">/ {bal.allocated} days</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
