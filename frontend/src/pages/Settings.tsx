import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
  const { organization } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Organization Settings</h1>
        <p className="text-sm text-slate-500">Configure tenant parameters, defaults, and security policies</p>
      </div>

      <Card title="Organization Overview">
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block">Organization Name:</span>
              <span className="font-bold text-slate-800 text-sm">{organization?.name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Unique Tenant Code:</span>
              <span className="font-mono font-bold text-blue-600 text-sm">{organization?.code || 'N/A'}</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-500">Tenant Lifecycle Status:</span>
            <Badge variant="success">{organization?.status || 'ACTIVE'}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
