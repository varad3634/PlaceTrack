import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  className = '',
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
      accent: 'text-blue-600',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      accent: 'text-emerald-600',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
      accent: 'text-purple-600',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      accent: 'text-amber-600',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
      accent: 'text-indigo-600',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm card-hover relative overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline mt-2 space-x-2">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              {value}
            </h3>
            {trend && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-normal">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.border} border`}>
            <Icon className="w-6 h-6 stroke-[1.75]" />
          </div>
        )}
      </div>
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${color}-500/20 to-transparent`}
      />
    </div>
  );
};
