import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import { attendanceService, AttendanceRecord } from '../services/attendance.service';
import { useAuth } from '../context/AuthContext';
import { DataTable, Column } from '../components/ui/DataTable';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Avatar } from '../components/ui/Avatar';

export const Attendance: React.FC = () => {
  const { role, user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isEmployee = role === 'EMPLOYEE';
  const hasEmployeeProfile = !!user?.employeeId;

  // Fetch Attendance records
  const { data, isLoading } = useQuery({
    queryKey: ['attendance', isEmployee, page, startDate, endDate, status],
    queryFn: () => {
      const params: any = { page, limit: 15 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status) params.status = status;
      return isEmployee
        ? attendanceService.getMy(params)
        : attendanceService.getAll(params);
    },
  });

  // Fetch Monthly summary
  const { data: summaryData } = useQuery({
    queryKey: ['attendance-summary'],
    queryFn: () => attendanceService.getSummary(),
  });

  // Check today's personal attendance
  const { data: myTodayData } = useQuery({
    queryKey: ['my-today-attendance'],
    queryFn: () => attendanceService.getMy({ limit: 1 }),
    enabled: hasEmployeeProfile,
  });

  const latestMyRecord = myTodayData?.data?.[0];
  const isTodayRecord =
    latestMyRecord &&
    new Date(latestMyRecord.date).toISOString().split('T')[0] ===
      new Date().toISOString().split('T')[0];
  const isCheckedIn = isTodayRecord && !!latestMyRecord?.checkIn;
  const isCheckedOut = isTodayRecord && !!latestMyRecord?.checkOut;

  // Check In Mutation
  const checkInMutation = useMutation({
    mutationFn: () => attendanceService.checkIn(),
    onSuccess: () => {
      setActionMessage({ text: 'Checked in successfully! Have a productive day.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['my-today-attendance'] });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err: any) => {
      setActionMessage({
        text: err.response?.data?.message || 'Failed to check in. Please try again.',
        type: 'error',
      });
      setTimeout(() => setActionMessage(null), 4000);
    },
  });

  // Check Out Mutation
  const checkOutMutation = useMutation({
    mutationFn: () => attendanceService.checkOut(),
    onSuccess: () => {
      setActionMessage({ text: 'Checked out successfully! Total hours recorded.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['my-today-attendance'] });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err: any) => {
      setActionMessage({
        text: err.response?.data?.message || 'Failed to check out. Please try again.',
        type: 'error',
      });
      setTimeout(() => setActionMessage(null), 4000);
    },
  });

  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (r) => <span className="font-medium text-slate-800 text-xs">{r.date.split('T')[0]}</span>,
    },
    ...(!isEmployee
      ? [
          {
            header: 'Employee',
            cell: (r: AttendanceRecord) => (
              <div className="flex items-center space-x-3">
                <Avatar
                  src={r.employee?.profileImage}
                  firstName={r.employee?.firstName}
                  lastName={r.employee?.lastName}
                  employeeCode={r.employee?.employeeCode}
                  email={r.employee?.email}
                  size="sm"
                />
                <div>
                  <span className="font-semibold text-slate-900 block text-xs">
                    {r.employee?.firstName} {r.employee?.lastName}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {r.employee?.employeeCode} • {r.employee?.department?.name}
                  </span>
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      header: 'Check In',
      cell: (r) => (
        <span className="text-xs text-slate-700">
          {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </span>
      ),
    },
    {
      header: 'Check Out',
      cell: (r) => (
        <span className="text-xs text-slate-700">
          {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </span>
      ),
    },
    {
      header: 'Working Hours',
      cell: (r) => (
        <span className="font-semibold text-xs text-blue-600">
          {r.workingHours > 0 ? `${r.workingHours} hrs` : '--'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (r) => (
        <Badge
          variant={
            r.status === 'PRESENT'
              ? 'success'
              : r.status === 'HALF_DAY'
              ? 'warning'
              : r.status === 'ON_LEAVE'
              ? 'info'
              : 'danger'
          }
        >
          {r.status}
        </Badge>
      ),
    },
    {
      header: 'Remarks',
      cell: (r) => <span className="text-xs text-slate-500">{r.remarks || '—'}</span>,
    },
  ];

  const s = summaryData?.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Tracker</h1>
          <p className="text-sm text-slate-500">Monitor daily working hours and attendance logs</p>
        </div>
        {hasEmployeeProfile && (
          <div className="flex items-center space-x-3">
            {!isCheckedIn ? (
              <Button
                variant="primary"
                isLoading={checkInMutation.isPending}
                onClick={() => checkInMutation.mutate()}
              >
                <Clock className="w-4 h-4 mr-2" /> Punch In
              </Button>
            ) : !isCheckedOut ? (
              <Button
                variant="danger"
                isLoading={checkOutMutation.isPending}
                onClick={() => checkOutMutation.mutate()}
              >
                <Clock className="w-4 h-4 mr-2" /> Punch Out
              </Button>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> Completed Today ({latestMyRecord?.workingHours || 0} hrs)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-fadeIn ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {s && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-emerald-50/40 border-emerald-100">
            <div className="text-xs text-emerald-700 font-semibold uppercase">Present Days</div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">{s.present}</div>
          </Card>
          <Card className="p-4 bg-amber-50/40 border-amber-100">
            <div className="text-xs text-amber-700 font-semibold uppercase">Half Days</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{s.halfDay}</div>
          </Card>
          <Card className="p-4 bg-rose-50/40 border-rose-100">
            <div className="text-xs text-rose-700 font-semibold uppercase">Absent Days</div>
            <div className="text-2xl font-bold text-rose-900 mt-1">{s.absent}</div>
          </Card>
          <Card className="p-4 bg-blue-50/40 border-blue-100">
            <div className="text-xs text-blue-700 font-semibold uppercase">Logged Hours</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{s.totalWorkingHours} hrs</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          <Input
            type="date"
            label="From Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="To Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        {!isEmployee && (
          <div className="w-full sm:w-44">
            <Select
              label="Status"
              placeholder="All Statuses"
              options={[
                { label: 'Present', value: 'PRESENT' },
                { label: 'Absent', value: 'ABSENT' },
                { label: 'Half Day', value: 'HALF_DAY' },
                { label: 'On Leave', value: 'ON_LEAVE' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Attendance Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No attendance records"
        emptyDescription="There are no attendance records matching the selected period."
        pagination={
          data?.pagination
            ? {
                currentPage: data.pagination.page,
                totalPages: data.pagination.totalPages,
                totalRecords: data.pagination.total,
                limit: data.pagination.limit,
                onPageChange: (p) => setPage(p),
              }
            : undefined
        }
      />
    </div>
  );
};
