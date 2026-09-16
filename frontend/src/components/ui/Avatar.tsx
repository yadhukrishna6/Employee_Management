import React, { useState } from 'react';

// Curated realistic dummy portraits for demo employees
export const DUMMY_AVATAR_MAP: Record<string, string> = {
  'EMP-001': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80', // Alice Vance
  'EMP-002': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&auto=format&fit=crop&q=80', // Hannah Reed
  'EMP-003': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80', // Marcus Sterling
  'EMP-004': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80', // Ethan Cole
  'EMP-005': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80', // Yadhu Krishna
  'admin@example.com': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80',
  'hr@example.com': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&auto=format&fit=crop&q=80',
  'manager@example.com': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
  'employee@example.com': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80',
  'yadhu@example.com': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80',
  'superadmin@example.com': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256&auto=format&fit=crop&q=80',
};

// Curated pool of high-definition corporate avatars for dynamic employees
export const AVATAR_POOL = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=256&auto=format&fit=crop&q=80',
];

export function resolveAvatarUrl(
  src?: string | null,
  employeeCode?: string | null,
  email?: string | null,
  name?: string | null
): string {
  if (src && src.startsWith('http')) {
    return src;
  }
  if (employeeCode && DUMMY_AVATAR_MAP[employeeCode]) {
    return DUMMY_AVATAR_MAP[employeeCode];
  }
  if (email && DUMMY_AVATAR_MAP[email.toLowerCase()]) {
    return DUMMY_AVATAR_MAP[email.toLowerCase()];
  }
  const key = (employeeCode || '') + (email || '') + (name || 'EMP');
  const hash = key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_POOL[hash % AVATAR_POOL.length];
}

const BG_COLORS = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-indigo-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-teal-600',
];

export interface AvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  name?: string;
  employeeCode?: string;
  email?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  ring?: boolean;
  status?: 'online' | 'offline' | 'busy' | 'away' | null;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  firstName,
  lastName,
  name,
  employeeCode,
  email,
  size = 'md',
  className = '',
  ring = true,
  status,
}) => {
  const [imgError, setImgError] = useState(false);

  const displayName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'User';
  const initial = (firstName?.[0] || name?.[0] || displayName[0] || 'U').toUpperCase();
  const avatarUrl = resolveAvatarUrl(src, employeeCode, email, displayName);

  const hash = displayName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const bgColor = BG_COLORS[hash % BG_COLORS.length];

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-2xl',
  }[size];

  const statusSizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  }[size];

  return (
    <div
      className={`relative inline-flex shrink-0 select-none ${sizeClasses} ${className}`}
    >
      <div
        className={`w-full h-full rounded-full overflow-hidden ${
          ring ? 'ring-2 ring-white shadow-xs' : ''
        }`}
      >
        {!imgError && avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center font-bold text-white shadow-inner ${bgColor}`}
          >
            {initial}
          </div>
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white z-10 ${statusSizeClasses} ${
            status === 'online'
              ? 'bg-emerald-500'
              : status === 'busy'
              ? 'bg-rose-500'
              : status === 'away'
              ? 'bg-amber-500'
              : 'bg-slate-400'
          }`}
          title={status.toUpperCase()}
        />
      )}
    </div>
  );
};
