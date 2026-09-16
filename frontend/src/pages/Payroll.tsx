import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, FileText, Plus, Eye, CheckCircle2 } from 'lucide-react';
import { payrollService, Payslip } from '../services/payroll.service';
import { employeeService } from '../services/employee.service';
import { useAuth } from '../context/AuthContext';
import { DataTable, Column } from '../components/ui/DataTable';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';

const generatePayslipSchema = z.object({
  employeeId: z.string().min(1, 'Please select an employee'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2030),
});

type GeneratePayslipFormData = z.infer<typeof generatePayslipSchema>;

export const Payroll: React.FC = () => {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [isGenerateOpen, setIsGenerateOpen] = useState<boolean>(false);
  const [viewingPayslip, setViewingPayslip] = useState<Payslip | null>(null);

  const isEmployee = role === 'EMPLOYEE';
  const canManage = ['ORGANIZATION_ADMIN', 'HR', 'SUPER_ADMIN'].includes(role || '');

  // Fetch Payslips (My vs All based on role)
  const { data: payslipsData, isLoading } = useQuery({
    queryKey: ['payslips', isEmployee],
    queryFn: () => (isEmployee ? payrollService.getMyPayslips() : payrollService.getPayslips()),
  });

  // Fetch Salary Structure (if employee)
  const { data: salaryData } = useQuery({
    queryKey: ['my-salary'],
    queryFn: () => payrollService.getSalary(),
    enabled: isEmployee,
  });

  // Fetch Employees for Generate Modal
  const { data: empData } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => employeeService.getAll({ limit: 100 }),
    enabled: canManage,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GeneratePayslipFormData>({
    resolver: zodResolver(generatePayslipSchema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  });

  const generateMutation = useMutation({
    mutationFn: (data: GeneratePayslipFormData) => payrollService.generatePayslip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
      setIsGenerateOpen(false);
      reset();
    },
  });

  const bulkGenerateMutation = useMutation({
    mutationFn: () =>
      payrollService.generateBulkPayslips({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
    },
  });

  const onGenerateSubmit = (data: GeneratePayslipFormData) => {
    generateMutation.mutate(data);
  };

  const columns: Column<Payslip>[] = [
    ...(!isEmployee
      ? [
          {
            header: 'Employee',
            cell: (ps: Payslip) => (
              <div>
                <span className="font-semibold text-slate-900 block text-xs">
                  {ps.employee?.firstName} {ps.employee?.lastName}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {ps.employee?.employeeCode} • {ps.employee?.department?.name}
                </span>
              </div>
            ),
          },
        ]
      : []),
    {
      header: 'Period',
      cell: (ps) => (
        <span className="font-semibold text-xs text-slate-800">
          {new Date(ps.year, ps.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Basic Salary',
      cell: (ps) => <span className="text-xs text-slate-600">${ps.basicSalary.toLocaleString()}</span>,
    },
    {
      header: 'Allowances',
      cell: (ps) => <span className="text-xs text-emerald-600">+${ps.allowances.toLocaleString()}</span>,
    },
    {
      header: 'Deductions',
      cell: (ps) => <span className="text-xs text-rose-600">-${ps.deductions.toLocaleString()}</span>,
    },
    {
      header: 'Net Pay',
      cell: (ps) => <span className="font-bold text-xs text-blue-600">${ps.netSalary.toLocaleString()}</span>,
    },
    {
      header: 'Actions',
      cell: (ps) => (
        <button
          onClick={() => setViewingPayslip(ps)}
          className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-semibold"
        >
          <Eye className="w-3.5 h-3.5 mr-1" /> View Slip
        </button>
      ),
    },
  ];

  const empOptions = (empData?.data || []).map((e) => ({
    label: `${e.firstName} ${e.lastName} (${e.employeeCode})`,
    value: e.id,
  }));

  const mySalary = salaryData?.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll & Payslips</h1>
          <p className="text-sm text-slate-500">View compensation details and access monthly payslips</p>
        </div>
        {canManage && (
          <div className="flex space-x-3">
            <Button
              variant="outline"
              isLoading={bulkGenerateMutation.isPending}
              onClick={() => bulkGenerateMutation.mutate()}
            >
              Generate All (Current Month)
            </Button>
            <Button onClick={() => setIsGenerateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Generate Individual Slip
            </Button>
          </div>
        )}
      </div>

      {/* Salary Overview for Employee */}
      {isEmployee && mySalary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-slate-50 border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Basic Salary</div>
            <div className="text-xl font-bold text-slate-900 mt-1">${mySalary.basicSalary.toLocaleString()}</div>
          </Card>
          <Card className="p-4 bg-emerald-50/50 border-emerald-100">
            <div className="text-xs text-emerald-700 font-medium">Total Allowances</div>
            <div className="text-xl font-bold text-emerald-800 mt-1">+${mySalary.allowances.toLocaleString()}</div>
          </Card>
          <Card className="p-4 bg-rose-50/50 border-rose-100">
            <div className="text-xs text-rose-700 font-medium">Total Deductions</div>
            <div className="text-xl font-bold text-rose-800 mt-1">-${mySalary.deductions.toLocaleString()}</div>
          </Card>
          <Card className="p-4 bg-blue-50/50 border-blue-100">
            <div className="text-xs text-blue-700 font-medium">Net Monthly Pay</div>
            <div className="text-xl font-bold text-blue-800 mt-1">${mySalary.netSalary.toLocaleString()}</div>
          </Card>
        </div>
      )}

      {/* Payslips Table */}
      <DataTable
        columns={columns}
        data={payslipsData?.data || []}
        isLoading={isLoading}
        emptyTitle="No payslips available"
        emptyDescription="There are no payslip records for the selected period."
      />

      {/* Generate Individual Payslip Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Employee Payslip"
      >
        <form onSubmit={handleSubmit(onGenerateSubmit)} className="space-y-4">
          <Select
            label="Select Employee"
            placeholder="Choose an employee"
            options={empOptions}
            error={errors.employeeId?.message}
            {...register('employeeId')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Month (1 - 12)"
              min={1}
              max={12}
              error={errors.month?.message}
              {...register('month')}
            />
            <Input
              type="number"
              label="Year"
              min={2020}
              max={2030}
              error={errors.year?.message}
              {...register('year')}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsGenerateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Generate Payslip
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Payslip Modal */}
      {viewingPayslip && (
        <Modal
          isOpen={!!viewingPayslip}
          onClose={() => setViewingPayslip(null)}
          title={`Payslip - ${new Date(viewingPayslip.year, viewingPayslip.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Generated For</span>
                <span className="text-sm font-bold text-slate-900 block">
                  {viewingPayslip.employee
                    ? `${viewingPayslip.employee.firstName} ${viewingPayslip.employee.lastName}`
                    : 'Employee'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {viewingPayslip.employee?.employeeCode} • {viewingPayslip.employee?.designation}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Net Pay Amount</span>
                <span className="text-2xl font-black text-blue-600">
                  ${viewingPayslip.netSalary.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600">Basic Salary</span>
                <span className="font-semibold text-slate-900">${viewingPayslip.basicSalary.toLocaleString()}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-emerald-700 font-medium">+ Allowances</span>
                <span className="font-semibold text-emerald-700">+${viewingPayslip.allowances.toLocaleString()}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-rose-700 font-medium">- Deductions</span>
                <span className="font-semibold text-rose-700">-${viewingPayslip.deductions.toLocaleString()}</span>
              </div>
              <div className="py-3 flex justify-between text-base font-bold bg-blue-50/50 px-3 rounded-lg border border-blue-100">
                <span className="text-blue-900">Total Net Disbursed</span>
                <span className="text-blue-900">${viewingPayslip.netSalary.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
