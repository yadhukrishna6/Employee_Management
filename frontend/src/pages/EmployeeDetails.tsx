import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { employeeService } from '../services/employee.service';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'leaves' | 'salary'>('overview');

  const { data, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingSkeleton rows={6} columns={3} />;
  }

  const emp = data?.data;
  if (!emp) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h3>Employee profile not found</h3>
        <Button onClick={() => navigate('/employees')} className="mt-4">
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/employees')}
        className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Employees
      </button>

      {/* Header Banner */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {emp.firstName[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {emp.firstName} {emp.lastName}
                </h1>
                <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {emp.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {emp.designation} • <span className="font-mono">{emp.employeeCode}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex space-x-4 mt-6 pt-4 border-t border-slate-100 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Overview & Contact
          </button>
        </div>
      </Card>

      {/* Overview Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Employment Information">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-900">{emp.department?.name || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Manager:</span>
              <span className="font-semibold text-slate-900">
                {emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : 'None'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Employment Type:</span>
              <span className="font-semibold text-slate-900 capitalize">{emp.employmentType.toLowerCase()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Joining Date:</span>
              <span className="font-semibold text-slate-900">{emp.joiningDate?.split('T')[0]}</span>
            </div>
          </div>
        </Card>

        <Card title="Contact & Personal Information">
          <div className="space-y-3 text-xs">
            <div className="flex items-center space-x-3 py-1">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">{emp.email}</span>
            </div>
            <div className="flex items-center space-x-3 py-1">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">{emp.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center space-x-3 py-1">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">{emp.city ? `${emp.city}, ${emp.country || ''}` : 'No address provided'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
