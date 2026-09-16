import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, Plus, Check, X, AlertCircle } from 'lucide-react';
import { leaveService, LeaveRequest } from '../services/leave.service';
import { useAuth } from '../context/AuthContext';
import { DataTable, Column } from '../components/ui/DataTable';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Avatar } from '../components/ui/Avatar';

const applyLeaveSchema = z.object({
  leaveTypeId: z.string().min(1, 'Please select a leave type'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});

type ApplyLeaveFormData = z.infer<typeof applyLeaveSchema>;

export const Leave: React.FC = () => {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [isApplyOpen, setIsApplyOpen] = useState<boolean>(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const isEmployee = role === 'EMPLOYEE';
  const canApprove = ['ORGANIZATION_ADMIN', 'HR', 'MANAGER', 'SUPER_ADMIN'].includes(role || '');

  // Fetch Leave Types
  const { data: typesData } = useQuery({
    queryKey: ['leave-types'],
    queryFn: () => leaveService.getTypes(),
  });

  // Fetch Balances
  const { data: balancesData } = useQuery({
    queryKey: ['leave-balances'],
    queryFn: () => leaveService.getBalances(),
  });

  // Fetch Leave Requests (My vs All based on role)
  const { data: leavesData, isLoading } = useQuery({
    queryKey: ['leaves', isEmployee],
    queryFn: () => (isEmployee ? leaveService.getMyLeaves() : leaveService.getAllLeaves()),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplyLeaveFormData>({
    resolver: zodResolver(applyLeaveSchema),
  });

  // Apply Leave Mutation
  const applyMutation = useMutation({
    mutationFn: (data: ApplyLeaveFormData) => leaveService.apply(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
      setIsApplyOpen(false);
      reset();
    },
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => leaveService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      leaveService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      setRejectingId(null);
      setRejectionReason('');
    },
  });

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => leaveService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    },
  });

  const onApplySubmit = (data: ApplyLeaveFormData) => {
    applyMutation.mutate(data);
  };

  const columns: Column<LeaveRequest>[] = [
    ...(!isEmployee
      ? [
          {
            header: 'Employee',
            cell: (req: LeaveRequest) => (
              <div className="flex items-center space-x-3">
                <Avatar
                  src={req.employee?.profileImage}
                  firstName={req.employee?.firstName}
                  lastName={req.employee?.lastName}
                  employeeCode={req.employee?.employeeCode}
                  email={req.employee?.email}
                  size="sm"
                />
                <div>
                  <span className="font-semibold text-slate-900 block text-xs">
                    {req.employee?.firstName} {req.employee?.lastName}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {req.employee?.employeeCode} • {req.employee?.department?.name}
                  </span>
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      header: 'Leave Type',
      cell: (req) => <span className="font-semibold text-xs text-slate-800">{req.leaveType?.name}</span>,
    },
    {
      header: 'Dates',
      cell: (req) => (
        <span className="text-xs text-slate-600">
          {req.startDate.split('T')[0]} to {req.endDate.split('T')[0]}
        </span>
      ),
    },
    {
      header: 'Duration',
      cell: (req) => <span className="font-bold text-xs text-blue-600">{req.numberOfDays} Day(s)</span>,
    },
    {
      header: 'Reason',
      cell: (req) => <span className="text-xs text-slate-600 italic max-w-xs truncate block">{req.reason}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (req) => (
        <Badge
          variant={
            req.status === 'APPROVED'
              ? 'success'
              : req.status === 'PENDING'
              ? 'warning'
              : req.status === 'CANCELLED'
              ? 'neutral'
              : 'danger'
          }
        >
          {req.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (req) => (
        <div className="flex items-center space-x-2">
          {canApprove && req.status === 'PENDING' && (
            <>
              <button
                onClick={() => approveMutation.mutate(req.id)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                title="Approve"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRejectingId(req.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                title="Reject"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          {isEmployee && req.status === 'PENDING' && (
            <button
              onClick={() => cancelMutation.mutate(req.id)}
              className="text-xs text-slate-500 hover:text-red-600 font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  const typeOptions = (typesData?.data || []).map((t) => ({
    label: `${t.name} (Limit: ${t.annualLimit} days/yr)`,
    value: t.id,
  }));

  const balances = balancesData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-sm text-slate-500">Apply for time off and manage team leave requests</p>
        </div>
        <Button onClick={() => setIsApplyOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Request Time Off
        </Button>
      </div>

      {/* Balance Cards */}
      {balances.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.map((b) => (
            <Card key={b.id} className="p-4 bg-slate-50/60">
              <span className="text-xs font-semibold text-slate-700">{b.leaveType.name}</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-600">{b.remaining}</span>
                <span className="text-xs text-slate-500">/ {b.allocated} remaining</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Used: {b.used} days</div>
            </Card>
          ))}
        </div>
      )}

      {/* Requests Table */}
      <DataTable
        columns={columns}
        data={leavesData?.data || []}
        isLoading={isLoading}
        emptyTitle="No leave requests"
        emptyDescription="There are no pending or historic leave requests."
      />

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title="Apply for Time Off"
      >
        <form onSubmit={handleSubmit(onApplySubmit)} className="space-y-4">
          <Select
            label="Leave Type"
            placeholder="Select leave type"
            options={typeOptions}
            error={errors.leaveTypeId?.message}
            {...register('leaveTypeId')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Start Date"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              type="date"
              label="End Date"
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>

          <Input
            label="Reason for Leave"
            placeholder="e.g. Medical appointment, family vacation..."
            error={errors.reason?.message}
            {...register('reason')}
          />

          <div className="flex justify-end space-x-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        title="Reject Leave Request"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please provide a reason for rejecting this leave application:
          </p>
          <Input
            placeholder="e.g. Critical project deadline, staffing shortage..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={() => setRejectingId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={!rejectionReason.trim()}
              isLoading={rejectMutation.isPending}
              onClick={() =>
                rejectingId &&
                rejectMutation.mutate({ id: rejectingId, reason: rejectionReason })
              }
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
