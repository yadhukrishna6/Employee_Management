import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, Users, Search, CheckCircle } from 'lucide-react';
import { organizationService } from '../services/organization.service';
import { DataTable, Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Organization } from '../types';

const createOrgSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required').max(20),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

type CreateOrgFormData = z.infer<typeof createOrgSchema>;

export const Organizations: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['organizations', search],
    queryFn: () => organizationService.getAll({ search: search || undefined }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrgFormData>({
    resolver: zodResolver(createOrgSchema),
  });

  const createMutation = useMutation({
    mutationFn: (formData: CreateOrgFormData) => organizationService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setIsModalOpen(false);
      reset();
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      organizationService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  const onSubmit = (formData: CreateOrgFormData) => {
    createMutation.mutate(formData);
  };

  const columns: Column<Organization>[] = [
    {
      header: 'Organization',
      cell: (org) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{org.name}</span>
          <span className="text-[10px] text-slate-400 block font-mono">{org.code}</span>
        </div>
      ),
    },
    {
      header: 'Contact Email',
      accessorKey: 'email',
      cell: (org) => <span className="text-xs text-slate-600">{org.email}</span>,
    },
    {
      header: 'Location',
      cell: (org) => (
        <span className="text-xs text-slate-500">
          {org.city ? `${org.city}, ${org.country || ''}` : 'Not Specified'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (org) => (
        <Badge variant={org.status === 'ACTIVE' ? 'success' : org.status === 'SUSPENDED' ? 'danger' : 'neutral'}>
          {org.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (org) => (
        <div className="flex space-x-2">
          {org.status === 'ACTIVE' ? (
            <button
              onClick={() => statusMutation.mutate({ id: org.id, status: 'SUSPENDED' })}
              className="text-xs text-amber-600 hover:text-amber-800 font-medium"
            >
              Suspend
            </button>
          ) : (
            <button
              onClick={() => statusMutation.mutate({ id: org.id, status: 'ACTIVE' })}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
            >
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organizations (Tenants)</h1>
          <p className="text-sm text-slate-500">Manage customer tenants, lifecycle status, and subscription health</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Organization
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-w-md">
        <Input
          placeholder="Search organizations..."
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No organizations found"
      />

      {/* New Organization Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Organization"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Organization Name"
            placeholder="e.g. Acme Corporation"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Organization Code (Unique Slug)"
            placeholder="e.g. ACMECORP"
            error={errors.code?.message}
            {...register('code')}
          />
          <Input
            label="Primary Contact Email"
            type="email"
            placeholder="contact@acmecorp.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" {...register('city')} />
            <Input label="Country" {...register('country')} />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Tenant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
