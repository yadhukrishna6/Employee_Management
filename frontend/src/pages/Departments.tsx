import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, Users, UserCheck } from 'lucide-react';
import { departmentService } from '../services/department.service';
import { employeeService } from '../services/employee.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

const createDeptSchema = z.object({
  name: z.string().min(2, 'Department name is required'),
  code: z.string().min(2, 'Code is required').max(10),
  description: z.string().optional(),
  managerId: z.string().optional(),
});

type CreateDeptFormData = z.infer<typeof createDeptSchema>;

export const Departments: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll({ limit: 50 }),
  });

  const { data: empData } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => employeeService.getAll({ limit: 100 }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDeptFormData>({
    resolver: zodResolver(createDeptSchema),
  });

  const createMutation = useMutation({
    mutationFn: (formData: CreateDeptFormData) => departmentService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setIsModalOpen(false);
      reset();
    },
  });

  const onSubmit = (formData: CreateDeptFormData) => {
    createMutation.mutate(formData);
  };

  const managerOptions = (empData?.data || []).map((e) => ({
    label: `${e.firstName} ${e.lastName} (${e.designation})`,
    value: e.id,
  }));

  if (isLoading) {
    return <LoadingSkeleton rows={4} columns={3} />;
  }

  const departments = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
          <p className="text-sm text-slate-500">Manage organizational departments and department heads</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept: any) => (
          <Card key={dept.id} className="hover:border-blue-200 transition-colors">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">
                {dept.code}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-4">{dept.name}</h3>
            <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
              {dept.description || 'No description provided'}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center text-slate-600">
                <UserCheck className="w-4 h-4 mr-1 text-slate-400" />
                <span>
                  {dept.manager
                    ? `${dept.manager.firstName} ${dept.manager.lastName}`
                    : 'No Manager Assigned'}
                </span>
              </div>
              <div className="flex items-center font-semibold text-slate-700">
                <Users className="w-4 h-4 mr-1 text-blue-500" />
                <span>{dept._count?.employees || 0}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Department"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Department Name"
            placeholder="e.g. Finance & Accounting"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Department Code"
            placeholder="e.g. FIN"
            error={errors.code?.message}
            {...register('code')}
          />
          <Input
            label="Description"
            placeholder="Brief overview of department scope"
            error={errors.description?.message}
            {...register('description')}
          />
          <Select
            label="Department Manager"
            placeholder="Select Manager"
            options={managerOptions}
            error={errors.managerId?.message}
            {...register('managerId')}
          />

          <div className="flex justify-end space-x-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
