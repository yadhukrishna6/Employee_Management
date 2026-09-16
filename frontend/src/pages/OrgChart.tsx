import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Network,
  List as ListIcon,
  Building2,
  Crown,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Search,
  UserPlus,
  X,
  ExternalLink,
} from 'lucide-react';
import { employeeService, EmployeeHierarchyNode } from '../services/employee.service';
import { organizationService } from '../services/organization.service';
import { departmentService } from '../services/department.service';
import { useAuth } from '../context/AuthContext';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

// Curated realistic dummy portrait avatars mapped by employee code
const DUMMY_AVATAR_MAP: Record<string, string> = {
  'EMP-001': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80', // Alice Vance
  'EMP-002': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&auto=format&fit=crop&q=80', // Hannah Reed
  'EMP-003': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80', // Marcus Sterling
  'EMP-004': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80', // Ethan Cole
  'EMP-005': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80', // Yadhu Krishna
};

// Fallback pool of corporate portraits for any newly added employees
const AVATAR_FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&auto=format&fit=crop&q=80',
];

// Helper to determine avatar image URL
function getEmployeeAvatar(node: EmployeeHierarchyNode): string {
  if (node.profileImage && node.profileImage.startsWith('http')) {
    return node.profileImage;
  }
  if (DUMMY_AVATAR_MAP[node.employeeCode]) {
    return DUMMY_AVATAR_MAP[node.employeeCode];
  }
  const charCodeSum = (node.employeeCode + node.firstName).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_FALLBACK_POOL[charCodeSum % AVATAR_FALLBACK_POOL.length];
}

// Helper to determine avatar fallback background gradient & color
function getAvatarFallbackStyle(node: EmployeeHierarchyNode, roleType: 'Executive' | 'Manager' | 'Individual') {
  if (roleType === 'Executive') return 'bg-blue-600 text-white shadow-blue-500/20';
  if (roleType === 'Manager') {
    if (node.firstName.toLowerCase().startsWith('h')) return 'bg-purple-600 text-white';
    return 'bg-blue-600 text-white';
  }
  if (node.firstName.toLowerCase().startsWith('y')) return 'bg-orange-500 text-white';
  return 'bg-emerald-600 text-white';
}

// Determine role type: Executive, Manager, or Individual
function getRoleType(node: EmployeeHierarchyNode, level: number): 'Executive' | 'Manager' | 'Individual' {
  const desig = (node.designation || '').toLowerCase();
  if (level === 0 || desig.includes('vp') || desig.includes('chief') || desig.includes('director') || desig.includes('president') || desig.includes('executive')) {
    return 'Executive';
  }
  if (node.subordinates && node.subordinates.length > 0) {
    return 'Manager';
  }
  if (desig.includes('manager') || desig.includes('lead') || desig.includes('head')) {
    return 'Manager';
  }
  return 'Individual';
}

// User Avatar Image with Fallback Component
const UserAvatar: React.FC<{
  node: EmployeeHierarchyNode;
  roleType: 'Executive' | 'Manager' | 'Individual';
  size?: 'sm' | 'md' | 'lg';
}> = ({ node, roleType, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = getEmployeeAvatar(node);
  const initial = node.firstName?.[0] || 'U';

  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-base' : 'w-11 h-11 text-sm';

  return (
    <div className={`relative rounded-full shrink-0 overflow-hidden shadow-xs ring-2 ring-white ${sizeClass}`}>
      {!imgError && avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${node.firstName} ${node.lastName}`}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-bold ${getAvatarFallbackStyle(
            node,
            roleType
          )}`}
        >
          {initial}
        </div>
      )}
    </div>
  );
};

// Tree Node Card Component
interface OrgCardProps {
  node: EmployeeHierarchyNode;
  level: number;
  isSelected?: boolean;
  onSelect?: (node: EmployeeHierarchyNode) => void;
  onAddPosition?: (parentNode: EmployeeHierarchyNode) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const OrgCard: React.FC<OrgCardProps> = ({
  node,
  level,
  isSelected,
  onSelect,
  isExpanded,
  onToggleExpand,
}) => {
  const roleType = getRoleType(node, level);
  const reportsCount = node.subordinates ? node.subordinates.length : 0;
  const isManager = reportsCount > 0 || roleType === 'Manager';

  return (
    <div
      onClick={() => onSelect?.(node)}
      className={`w-[290px] bg-white rounded-2xl border transition-all duration-200 cursor-pointer text-left select-none relative group ${
        isSelected
          ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-lg shadow-blue-500/5 -translate-y-0.5'
          : level === 0
          ? 'border-blue-300/80 hover:border-blue-400 shadow-md hover:shadow-lg'
          : 'border-slate-200/90 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div className="p-4">
        {/* Top Row: Avatar + Name/Designation + Role Badge */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center space-x-3 min-w-0">
            <UserAvatar node={node} roleType={roleType} size="md" />
            <div className="min-w-0 flex-1">
              <h4 className="text-[14px] font-bold text-slate-900 truncate leading-tight group-hover:text-blue-600 transition-colors">
                {node.firstName} {node.lastName}
              </h4>
              <p className="text-[12px] text-slate-500 truncate mt-0.5 font-normal">
                {node.designation || 'Staff'}
              </p>
            </div>
          </div>

          {/* Role Badge */}
          <div className="shrink-0">
            {roleType === 'Executive' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50/90 px-2.5 py-0.5 rounded-full border border-blue-100 shadow-2xs">
                <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />
                Executive
              </span>
            )}
            {roleType === 'Manager' && (
              <span className="inline-flex items-center text-[11px] font-medium text-purple-700 bg-purple-50/90 px-2.5 py-0.5 rounded-full border border-purple-100">
                Manager
              </span>
            )}
            {roleType === 'Individual' && (
              <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50/90 px-2.5 py-0.5 rounded-full border border-amber-100">
                Individual
              </span>
            )}
          </div>
        </div>

        {/* Middle Metadata: Department & Employee Code */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100/90 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium truncate">{node.department?.name || 'General Operations'}</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-slate-300">|</span>
            <span className="font-mono text-slate-400 text-[10px] font-semibold tracking-wide">
              {node.employeeCode}
            </span>
          </div>
        </div>

        {/* Footer: Direct Reports Count & Expand/Collapse Toggle */}
        <div
          onClick={(e) => {
            if (isManager) {
              e.stopPropagation();
              onToggleExpand();
            }
          }}
          className={`mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] rounded-lg px-1.5 -mx-1.5 transition-colors ${
            isManager ? 'hover:bg-slate-50 text-slate-600 cursor-pointer' : 'text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">
              {reportsCount} Direct Report{reportsCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center text-slate-400 group-hover:text-slate-600">
            {reportsCount > 0 ? (
              isExpanded ? (
                <ChevronUp className="w-4 h-4 text-blue-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// "Add Position" Dashed Placeholder Card Component
const AddPositionCard: React.FC<{
  parentName?: string;
  onClick: () => void;
}> = ({ parentName, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-[290px] min-h-[148px] bg-slate-50/40 hover:bg-blue-50/30 rounded-2xl border-2 border-dashed border-slate-300/90 hover:border-blue-400 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-5 text-center group shadow-2xs"
    >
      <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center mb-2.5 transition-colors shadow-2xs">
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </div>
      <h4 className="text-[13px] font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
        Add Position
      </h4>
      <p className="text-[11px] text-slate-400 group-hover:text-slate-500 transition-colors mt-0.5">
        {parentName ? `Report to ${parentName}` : 'Click to add a new employee'}
      </p>
    </div>
  );
};

// Recursive Tree Branch Component
const RecursiveOrgTree: React.FC<{
  node: EmployeeHierarchyNode;
  level?: number;
  selectedId: string | null;
  onSelect: (node: EmployeeHierarchyNode) => void;
  onAddPosition: (parentNode: EmployeeHierarchyNode) => void;
  expandedMap: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
}> = ({
  node,
  level = 0,
  selectedId,
  onSelect,
  onAddPosition,
  expandedMap,
  onToggleExpand,
}) => {
  const hasSubordinates = node.subordinates && node.subordinates.length > 0;
  const isExpanded = expandedMap[node.id] ?? true;

  // Sibling items under this node: subordinates + "Add Position" card (at level 0 or when expanded)
  const children = node.subordinates || [];
  const showAddCard = isExpanded && (level === 0 || hasSubordinates);
  const totalBranches = children.length + (showAddCard ? 1 : 0);

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className="relative">
        <OrgCard
          node={node}
          level={level}
          isSelected={selectedId === node.id}
          onSelect={onSelect}
          onAddPosition={onAddPosition}
          isExpanded={isExpanded}
          onToggleExpand={() => onToggleExpand(node.id)}
        />

        {/* Vertical Connector Line dropping from parent */}
        {isExpanded && totalBranches > 0 && (
          <div className="w-0.5 h-8 bg-slate-300 mx-auto"></div>
        )}
      </div>

      {/* Children Subordinates & Add Position Card */}
      {isExpanded && totalBranches > 0 && (
        <div className="flex justify-center items-start pt-0 relative">
          {/* Horizontal Branch Connector Bar spanning across all children */}
          {totalBranches > 1 && (
            <div
              className="absolute top-0 h-0.5 bg-slate-300"
              style={{
                left: `calc(${100 / (totalBranches * 2)}% + 10px)`,
                right: `calc(${100 / (totalBranches * 2)}% + 10px)`,
              }}
            />
          )}

          <div className="flex space-x-10">
            {/* Real Subordinate Children */}
            {children.map((child) => (
              <div key={child.id} className="relative flex flex-col items-center">
                {/* Vertical Connector Line dropping to child */}
                <div className="w-0.5 h-8 bg-slate-300"></div>
                <RecursiveOrgTree
                  node={child}
                  level={level + 1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onAddPosition={onAddPosition}
                  expandedMap={expandedMap}
                  onToggleExpand={onToggleExpand}
                />
              </div>
            ))}

            {/* "Add Position" Dashed Placeholder Card */}
            {showAddCard && (
              <div className="relative flex flex-col items-center">
                <div className="w-0.5 h-8 bg-slate-300"></div>
                <AddPositionCard
                  parentName={`${node.firstName} ${node.lastName}`}
                  onClick={() => onAddPosition(node)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Quick Add Position Modal Dialog
const AddPositionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  manager: EmployeeHierarchyNode | null;
  organizationId: string;
  onSuccess: () => void;
}> = ({ isOpen, onClose, manager, organizationId, onSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: deptData } = useQuery({
    queryKey: ['departments', organizationId],
    queryFn: () => departmentService.getAll({ limit: 100 }),
  });

  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!firstName || !lastName || !email || !designation || !departmentId) {
        throw new Error('Please fill in all required fields.');
      }
      return employeeService.create({
        firstName,
        lastName,
        email,
        designation,
        departmentId,
        managerId: manager?.id,
        employmentType: employmentType as any,
        status: 'ACTIVE' as any,
        joiningDate: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onSuccess();
      onClose();
      setFirstName('');
      setLastName('');
      setEmail('');
      setDesignation('');
      setErrorMessage('');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to add employee');
    },
  });

  if (!isOpen) return null;

  const deptOptions = (deptData?.data || []).map((d) => ({
    label: `${d.name} (${d.code})`,
    value: d.id,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add New Position</h3>
            <p className="text-xs text-slate-500">
              Reporting directly to{' '}
              <span className="font-semibold text-slate-700">
                {manager ? `${manager.firstName} ${manager.lastName} (${manager.designation})` : 'Executive Board'}
              </span>
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <Input
                placeholder="e.g. Sarah"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
              <Input
                placeholder="e.g. Connor"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email *</label>
            <Input
              type="email"
              placeholder="e.g. sarah.connor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Designation *</label>
            <Input
              placeholder="e.g. Senior Frontend Architect"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <Select
                placeholder="Select Department"
                options={deptOptions}
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
              <Select
                options={[
                  { label: 'Full Time', value: 'FULL_TIME' },
                  { label: 'Part Time', value: 'PART_TIME' },
                  { label: 'Contractor', value: 'CONTRACT' },
                  { label: 'Intern', value: 'INTERN' },
                ]}
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {addMutation.isPending ? 'Adding Position...' : 'Add Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// List View Mode Component
const HierarchyListView: React.FC<{
  nodes: EmployeeHierarchyNode[];
  onSelectNode: (node: EmployeeHierarchyNode) => void;
}> = ({ nodes, onSelectNode }) => {
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderRow = (node: EmployeeHierarchyNode, depth: number = 0) => {
    const roleType = getRoleType(node, depth);
    const hasChildren = node.subordinates && node.subordinates.length > 0;
    const isExpanded = expandedRows[node.id] ?? true;

    const matchesSearch =
      search.trim() === '' ||
      `${node.firstName} ${node.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      node.designation?.toLowerCase().includes(search.toLowerCase()) ||
      node.employeeCode?.toLowerCase().includes(search.toLowerCase()) ||
      node.department?.name?.toLowerCase().includes(search.toLowerCase());

    return (
      <React.Fragment key={node.id}>
        {matchesSearch && (
          <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 group">
            <td className="py-3 px-4">
              <div
                className="flex items-center space-x-3"
                style={{ paddingLeft: `${depth * 28}px` }}
              >
                {hasChildren ? (
                  <button
                    onClick={() => toggleRow(node.id)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <div className="w-6" />
                )}

                <UserAvatar node={node} roleType={roleType} size="sm" />

                <div>
                  <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    {node.firstName} {node.lastName}
                  </div>
                  <div className="text-xs text-slate-500">{node.designation}</div>
                </div>
              </div>
            </td>

            <td className="py-3 px-4 font-mono text-xs text-slate-500">
              {node.employeeCode}
            </td>

            <td className="py-3 px-4 text-xs text-slate-600">
              <div className="flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{node.department?.name || 'General Operations'}</span>
              </div>
            </td>

            <td className="py-3 px-4">
              {roleType === 'Executive' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />
                  Executive
                </span>
              )}
              {roleType === 'Manager' && (
                <span className="inline-flex items-center text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  Manager
                </span>
              )}
              {roleType === 'Individual' && (
                <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  Individual
                </span>
              )}
            </td>

            <td className="py-3 px-4 text-xs text-slate-600 font-medium">
              {node.subordinates?.length || 0} direct reports
            </td>

            <td className="py-3 px-4 text-right">
              <button
                onClick={() => onSelectNode(node)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
              >
                Inspect <ExternalLink className="w-3 h-3" />
              </button>
            </td>
          </tr>
        )}

        {hasChildren &&
          isExpanded &&
          node.subordinates.map((child) => renderRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search hierarchy by name, role, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Showing nested team hierarchy & reporting lines
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Role Tier</th>
              <th className="py-3 px-4">Reports</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {nodes.map((root) => renderRow(root, 0))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main OrgChart Page
export const OrgChart: React.FC = () => {
  const { role } = useAuth();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<EmployeeHierarchyNode | null>(null);
  const [addModalManager, setAddModalManager] = useState<EmployeeHierarchyNode | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = role === 'SUPER_ADMIN';

  // Super Admin can fetch all organizations to select from
  const { data: orgsData } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getAll({ limit: 100 }),
    enabled: isSuperAdmin,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['employee-hierarchy', selectedOrgId],
    queryFn: () => employeeService.getHierarchy(selectedOrgId || undefined),
  });

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.6, Math.round((z + 0.1) * 10) / 10));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10));
  const handleResetZoom = () => setZoomLevel(1.0);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={5} columns={3} />;
  }

  if (error || !data?.success) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 shadow-xs">
        <h3 className="font-bold text-base">Failed to load organization hierarchy</h3>
        <p className="text-sm mt-1">Please ensure your backend server is active and connected.</p>
      </div>
    );
  }

  const rootNodes = data.data || [];
  const orgOptions = (orgsData?.data || []).map((o) => ({
    label: `${o.name} (${o.code})`,
    value: o.id,
  }));

  return (
    <div className="space-y-5">
      {/* Top Header & View Mode Switcher Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Hierarchy</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Interactive visual structure of reporting lines, leadership tiers, and direct reports
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isSuperAdmin && orgOptions.length > 0 && (
            <div className="w-56">
              <Select
                placeholder="Select Organization"
                options={orgOptions}
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
              />
            </div>
          )}

          {/* Top-Right Tree View / List View Switcher Buttons (matching screenshot) */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs flex items-center space-x-1">
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'tree'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Tree View</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'list' ? (
        <HierarchyListView
          nodes={rootNodes}
          onSelectNode={(node) => setSelectedNode(node)}
        />
      ) : (
        /* Tree Canvas Area */
        <div
          ref={containerRef}
          className={`relative rounded-3xl border border-slate-200/80 shadow-inner overflow-hidden flex flex-col justify-between ${
            isFullscreen ? 'fixed inset-0 z-50 bg-slate-50/95 p-6 rounded-none' : 'bg-[#f8fafc] min-h-[660px]'
          }`}
          style={{
            backgroundImage:
              'radial-gradient(#e2e8f0 1.2px, transparent 1.2px), radial-gradient(#e2e8f0 1.2px, #f8fafc 1.2px)',
            backgroundSize: '28px 28px',
            backgroundPosition: '0 0, 14px 14px',
          }}
        >
          {/* Scrollable Tree Viewport */}
          <div className="w-full flex-1 overflow-auto p-12 flex justify-center items-start">
            {rootNodes.length === 0 ? (
              <div className="text-center text-slate-400 py-24 my-auto">
                <Network className="w-14 h-14 mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-700">No hierarchy nodes established</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Add employees and assign reporting managers to visualize the organization tree.
                </p>
              </div>
            ) : (
              <div
                className="flex space-x-16 transition-transform duration-150 origin-top py-4"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {rootNodes.map((root) => (
                  <RecursiveOrgTree
                    key={root.id}
                    node={root}
                    level={0}
                    selectedId={selectedNode?.id || null}
                    onSelect={(n) => setSelectedNode(n)}
                    onAddPosition={(parent) => {
                      setAddModalManager(parent);
                      setIsAddModalOpen(true);
                    }}
                    expandedMap={expandedMap}
                    onToggleExpand={toggleExpand}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Canvas Bottom Floating Overlay Controls */}
          <div className="pointer-events-none p-6 w-full flex items-end justify-between">
            {/* Bottom-Left Role Color Legend (matching screenshot) */}
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/80 shadow-lg shadow-slate-200/50 flex items-center space-x-4 text-[12px] font-medium text-slate-600">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100"></span>
                <span>Executive</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-100"></span>
                <span>Manager</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-orange-100"></span>
                <span>Individual Contributor</span>
              </div>
            </div>

            {/* Bottom-Right Zoom & Fullscreen Controls (matching screenshot: - 100% + [⛶]) */}
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-xl border border-slate-200/80 shadow-lg shadow-slate-200/50 flex items-center space-x-1 text-xs font-semibold text-slate-700">
              <button
                onClick={handleZoomOut}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Zoom Out"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleResetZoom}
                className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors min-w-[44px] text-center"
                title="Reset Zoom to 100%"
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              <button
                onClick={handleZoomIn}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Zoom In"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-slate-200 mx-1" />

              <button
                onClick={toggleFullscreen}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Position Modal */}
      <AddPositionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        manager={addModalManager}
        organizationId={selectedOrgId || ''}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

