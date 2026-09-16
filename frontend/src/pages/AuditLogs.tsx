import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Search } from 'lucide-react';
import { auditService, AuditLogItem } from '../services/audit.service';
import { DataTable, Column } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

export const AuditLogs: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [actionFilter, setActionFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, actionFilter],
    queryFn: () => auditService.getAll({ page, limit: 15, action: actionFilter || undefined }),
  });

  const columns: Column<AuditLogItem>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'createdAt',
      cell: (log) => (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(log.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (log) => (
        <Badge variant={log.action.includes('DELETE') ? 'danger' : log.action.includes('CREATE') ? 'success' : 'info'}>
          {log.action}
        </Badge>
      ),
    },
    {
      header: 'Entity',
      cell: (log) => (
        <span className="font-semibold text-xs text-slate-800">
          {log.entity} {log.entityId ? `(#${log.entityId.slice(0, 6)}...)` : ''}
        </span>
      ),
    },
    {
      header: 'Performed By',
      cell: (log) => (
        <div>
          <span className="font-semibold text-xs text-slate-900 block">
            {log.user?.employee ? `${log.user.employee.firstName} ${log.user.employee.lastName}` : log.user?.email || 'System'}
          </span>
          <span className="text-[10px] text-slate-400 block">{log.user?.role}</span>
        </div>
      ),
    },
    {
      header: 'IP Address',
      cell: (log) => <span className="text-xs text-slate-400 font-mono">{log.ipAddress || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit & Security Logs</h1>
        <p className="text-sm text-slate-500">Immutable trail of critical security events, data changes, and access logs</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-w-md">
        <Input
          placeholder="Filter by action (e.g. LOGIN, CREATE_EMPLOYEE)..."
          leftIcon={<Search className="w-4 h-4" />}
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No audit logs found"
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
