import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  Award,
  Building,
  Network,
  ShieldAlert,
  UserCircle,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { role, organization } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Organizations', path: '/organizations', icon: Building, roles: ['SUPER_ADMIN'] },
    { label: 'Employees', path: '/employees', icon: Users, roles: ['ORGANIZATION_ADMIN', 'HR'] },
    { label: 'Org Chart (Tree)', path: '/org-chart', icon: Network, roles: ['ORGANIZATION_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Departments', path: '/departments', icon: Building2, roles: ['ORGANIZATION_ADMIN', 'HR'] },
    { label: 'Attendance', path: '/attendance', icon: CalendarCheck, roles: ['ORGANIZATION_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Leave Management', path: '/leave', icon: CalendarDays, roles: ['ORGANIZATION_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Payroll & Payslips', path: '/payroll', icon: CreditCard, roles: ['ORGANIZATION_ADMIN', 'HR', 'EMPLOYEE'] },
    { label: 'Performance', path: '/performance', icon: Award, roles: ['ORGANIZATION_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert, roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN'] },
    { label: 'My Profile', path: '/profile', icon: UserCircle, roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Settings', path: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN'] },
  ];

  const filteredNav = navItems.filter((item) => role && item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col border-r border-slate-800`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              EM
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight block">Enterprise EMS</span>
              <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[140px]">
                {organization?.name || 'SaaS Platform'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-3 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Role Badge Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Current Access
          </div>
          <div className="mt-1 text-xs font-medium text-slate-300">
            {role?.replace('_', ' ')}
          </div>
        </div>
      </aside>
    </>
  );
};
