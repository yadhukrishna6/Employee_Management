import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="w-full animate-pulse space-y-4">
      <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div
                key={j}
                className="h-8 bg-slate-100 rounded flex-1"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
