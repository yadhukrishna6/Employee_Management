import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Trash2, Edit } from 'lucide-react';
import { employeeService } from '../services/employee.service';
import { departmentService } from '../services/department.service';
import { DataTable, Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Avatar } from '../components/ui/Avatar';
import { Employee } from '../types';

const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  designation: z.string().min(1, 'Designation is required'),
  departmentId: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).default('FULL_TIME'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  createUserAccount: z.boolean().default(true),
  userPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
  userRole: z.enum(['ORGANIZATION_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']).default('EMPLOYEE'),
});

type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

export const Employees: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch Employees with server state caching
  const { data, isLoading } = useQuery({
    queryKey: ['employees', page, search, status, departmentId],
    queryFn: () =>
      employeeService.getAll({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
        departmentId: departmentId || undefined,
      }),
  });

  // Fetch Departments for filter & create form
  const { data: deptData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll({ limit: 100 }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      employmentType: 'FULL_TIME',
      userRole: 'EMPLOYEE',
      createUserAccount: true,
      userPassword: 'Password@123',
      joiningDate: new Date().toISOString().split('T')[0],
    },
  });

  // Create Employee Mutation
  const createMutation = useMutation({
    mutationFn: (formData: CreateEmployeeFormData) => employeeService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsModalOpen(false);
      reset();
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const onSubmit = (formData: CreateEmployeeFormData) => {
    createMutation.mutate(formData);
  };

  const columns: Column<Employee>[] = [
    {
      header: 'Code',
      accessorKey: 'employeeCode',
      cell: (emp) => <span className="font-mono text-xs font-bold text-slate-700">{emp.employeeCode}</span>,
    },
    {
      header: 'Employee Name',
      cell: (emp) => (
        <div className="flex items-center space-x-3">
          <Avatar
            src={emp.profileImage}
            firstName={emp.firstName}
            lastName={emp.lastName}
            employeeCode={emp.employeeCode}
            email={emp.email}
            size="sm"
          />
          <div>
            <span className="font-semibold text-slate-900 block">{emp.firstName} {emp.lastName}</span>
            <span className="text-xs text-slate-400 block">{emp.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      cell: (emp) => <span className="text-xs text-slate-600">{emp.department?.name || 'Unassigned'}</span>,
    },
    {
      header: 'Designation',
      accessorKey: 'designation',
      cell: (emp) => <span className="text-xs font-medium text-slate-700">{emp.designation}</span>,
    },
    {
      header: 'Type',
      accessorKey: 'employmentType',
      cell: (emp) => (
        <span className="text-xs text-slate-500 capitalize">{emp.employmentType.toLowerCase().replace('_', ' ')}</span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (emp) => (
        <Badge
          variant={
            emp.status === 'ACTIVE'
              ? 'success'
              : emp.status === 'ON_NOTICE'
              ? 'warning'
              : 'danger'
          }
        >
          {emp.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (emp) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/employees/${emp.id}`)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${emp.firstName} ${emp.lastName}?`)) {
                deleteMutation.mutate(emp.id);
              }
            }}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete Employee"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const deptOptions = (deptData?.data || []).map((d) => ({
    label: d.name,
    value: d.id,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees Directory</h1>
          <p className="text-sm text-slate-500">Manage employee records, profiles, and access accounts</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or employee code..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            placeholder="All Departments"
            options={deptOptions}
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full md:w-40">
          <Select
            placeholder="All Statuses"
            options={[
              { label: 'Active', value: 'ACTIVE' },
              { label: 'On Notice', value: 'ON_NOTICE' },
              { label: 'Inactive', value: 'INACTIVE' },
              { label: 'Terminated', value: 'TERMINATED' },
            ]}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Employees Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No employees found"
        emptyDescription="Try adjusting your search criteria or add a new employee."
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

      {/* Add Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Employee Profile"
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last Name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Work Email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone Number"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Designation / Job Title"
              placeholder="e.g. Senior Software Engineer"
              error={errors.designation?.message}
              {...register('designation')}
            />
            <Select
              label="Department"
              placeholder="Select Department"
              options={deptOptions}
              error={errors.departmentId?.message}
              {...register('departmentId')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Employment Type"
              options={[
                { label: 'Full Time', value: 'FULL_TIME' },
                { label: 'Part Time', value: 'PART_TIME' },
                { label: 'Contract', value: 'CONTRACT' },
                { label: 'Intern', value: 'INTERN' },
              ]}
              {...register('employmentType')}
            />
            <Input
              label="Joining Date"
              type="date"
              error={errors.joiningDate?.message}
              {...register('joiningDate')}
            />
          </div>

          {/* User Account Provisioning */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              System Access Account
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="System Role"
                options={[
                  { label: 'Employee', value: 'EMPLOYEE' },
                  { label: 'Manager', value: 'MANAGER' },
                  { label: 'HR', value: 'HR' },
                  { label: 'Org Admin', value: 'ORGANIZATION_ADMIN' },
                ]}
                {...register('userRole')}
              />
              <Input
                label="Initial Password"
                type="text"
                error={errors.userPassword?.message}
                {...register('userPassword')}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Employee Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
