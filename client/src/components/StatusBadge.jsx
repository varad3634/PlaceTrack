import React from 'react';

const statusStyles = {
  // Applications
  Applied: 'bg-blue-50 text-blue-700 border-blue-200',
  Shortlisted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'In Process': 'bg-amber-50 text-amber-700 border-amber-200',
  Selected: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  Withdrawn: 'bg-slate-100 text-slate-600 border-slate-300',

  // Drives
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed: 'bg-rose-50 text-rose-700 border-rose-200',
  Cancelled: 'bg-gray-100 text-gray-600 border-gray-300',

  // Interviews
  Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-purple-50 text-purple-700 border-purple-200',
  Cleared: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Failed: 'bg-rose-50 text-rose-700 border-rose-200',
  Absent: 'bg-orange-50 text-orange-700 border-orange-200',

  // Offers
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Offered: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Declined: 'bg-slate-100 text-slate-600 border-slate-300',
};

export const StatusBadge = ({ status = 'Applied', className = '' }) => {
  const style =
    statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium tracking-wide ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
};
