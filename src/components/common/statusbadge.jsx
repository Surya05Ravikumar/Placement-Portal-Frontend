import React from 'react';

const StatusBadge = ({ status, label, size = 'sm' }) => {
  const statusStyles = {
    // Green
    placed: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30',
    selected: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30',
    ongoing: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30',
    eligible: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30',
    completed: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30',

    // Blue
    active: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
    upcoming: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',

    // Purple
    shortlisted: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30',

    // Amber/Yellow
    applied: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/30',
    pending: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',

    // Red
    rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
    'not-eligible': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',

    // Indigo
    interviewed: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30',

    // Gray/Neutral
    neutral: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    passed: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-xs', // Default in Dashboard
    md: 'px-3 py-1 text-xs', // Same as sm for now, adjust if needed
    lg: 'px-4 py-1.5 text-sm'
  };

  return (
    <span className={`rounded-full font-semibold border ${statusStyles[status] || statusStyles.neutral} ${sizeStyles[size]}`}>
      {label || status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default StatusBadge;