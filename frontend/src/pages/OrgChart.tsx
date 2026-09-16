import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  ChevronDown,
  ChevronRight,
  Network,
  Building2,
} from 'lucide-react';
import { employeeService, EmployeeHierarchyNode } from '../services/employee.service';
import { organizationService } from '../services/organization.service';
import { useAuth } from '../context/AuthContext';
import { Select } from '../components/ui/Select';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

// Recursive Org Chart Node Component
const OrgNode: React.FC<{
  node: EmployeeHierarchyNode;
  level?: number;
}> = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const hasSubordinates = node.subordinates && node.subordinates.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className="relative group">
        <div
          className={`w-64 bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
            level === 0
              ? 'border-blue-500 bg-gradient-to-b from-blue-50/40 to-white'
              : 'border-slate-200 hover:border-blue-300'
          }`}
          onClick={() => hasSubordinates && setIsExpanded(!isExpanded)}
        >
          {/* Top Row: Department & Subordinate Count */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
              {node.department?.name || 'Executive'}
            </span>
            {hasSubordinates && (
              <span className="inline-flex items-center text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                <Users className="w-3 h-3 mr-1" />
                {node.subordinates.length}
              </span>
            )}
          </div>

          {/* Employee Info */}
          <div className="flex items-center space-x-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                level === 0
                  ? 'bg-blue-600 text-white shadow-blue-500/20'
                  : 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white'
              }`}
            >
              {node.firstName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {node.firstName} {node.lastName}
              </h4>
              <p className="text-xs text-blue-600 font-medium truncate">
                {node.designation}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono">{node.employeeCode}</span>
            {hasSubordinates && (
              <span className="flex items-center text-slate-500 text-[10px] font-medium">
                {isExpanded ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 mr-0.5" /> Collapse
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 mr-0.5" /> Expand
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Vertical Connector Line from parent */}
        {hasSubordinates && isExpanded && (
          <div className="w-0.5 h-6 bg-slate-300 mx-auto"></div>
        )}
      </div>

      {/* Children Subordinates (Recursive Render) */}
      {hasSubordinates && isExpanded && (
        <div className="flex justify-center items-start pt-2 relative">
          {/* Horizontal Branch Connector Bar */}
          {node.subordinates.length > 1 && (
            <div
              className="absolute top-2 h-0.5 bg-slate-300"
              style={{
                left: `calc(${100 / (node.subordinates.length * 2)}% + 10px)`,
                right: `calc(${100 / (node.subordinates.length * 2)}% + 10px)`,
              }}
            />
          )}

          <div className="flex space-x-8">
            {node.subordinates.map((child) => (
              <div key={child.id} className="relative flex flex-col items-center">
                {/* Vertical Connector Line to child */}
                <div className="w-0.5 h-6 bg-slate-300 -mt-2"></div>
                <OrgNode node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const OrgChart: React.FC = () => {
  const { role } = useAuth();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  const isSuperAdmin = role === 'SUPER_ADMIN';

  // Super Admin can fetch all organizations to select from
  const { data: orgsData } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getAll({ limit: 100 }),
    enabled: isSuperAdmin,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['employee-hierarchy', selectedOrgId],
    queryFn: () => employeeService.getHierarchy(selectedOrgId || undefined),
  });

  if (isLoading) {
    return <LoadingSkeleton rows={5} columns={3} />;
  }

  if (error || !data?.success) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h3 className="font-bold">Failed to load organization hierarchy</h3>
        <p className="text-sm mt-1">Please ensure your backend server is active.</p>
      </div>
    );
  }

  const rootNodes = data.data || [];
  const orgOptions = (orgsData?.data || []).map((o) => ({
    label: `${o.name} (${o.code})`,
    value: o.id,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organization Hierarchy</h1>
          <p className="text-sm text-slate-500">
            Interactive tree view of reporting lines, managers, and direct subordinates
          </p>
        </div>

        {isSuperAdmin && orgOptions.length > 0 && (
          <div className="w-full sm:w-64">
            <Select
              placeholder="Select Organization"
              options={orgOptions}
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Chart Canvas Area with Horizontal Scroll */}
      <div className="p-8 bg-slate-100/75 rounded-2xl border border-slate-200/80 shadow-inner overflow-x-auto min-h-[600px] flex justify-center items-start">
        {rootNodes.length === 0 ? (
          <div className="text-center text-slate-400 py-16">
            <Network className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p>No employee reporting lines established for this organization.</p>
          </div>
        ) : (
          <div className="flex space-x-12 py-4">
            {rootNodes.map((root) => (
              <OrgNode key={root.id} node={root} level={0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
