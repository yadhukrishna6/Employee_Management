import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { Employees } from '../pages/Employees';
import { EmployeeDetails } from '../pages/EmployeeDetails';
import { Departments } from '../pages/Departments';
import { Attendance } from '../pages/Attendance';
import { Leave } from '../pages/Leave';
import { Payroll } from '../pages/Payroll';
import { Performance } from '../pages/Performance';
import { Organizations } from '../pages/Organizations';
import { AuditLogs } from '../pages/AuditLogs';
import { Profile } from '../pages/Profile';
import { Settings } from '../pages/Settings';
import { OrgChart } from '../pages/OrgChart';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Layout Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/org-chart" element={<OrgChart />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/profile" element={<Profile />} />

          {/* HR & Admin Specific */}
          <Route
            element={<ProtectedRoute allowedRoles={['ORGANIZATION_ADMIN', 'HR', 'SUPER_ADMIN']} />}
          >
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/departments" element={<Departments />} />
          </Route>

          {/* Admin & Super Admin Specific */}
          <Route
            element={<ProtectedRoute allowedRoles={['ORGANIZATION_ADMIN', 'SUPER_ADMIN']} />}
          >
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Super Admin Specific */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/organizations" element={<Organizations />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all redirect to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
