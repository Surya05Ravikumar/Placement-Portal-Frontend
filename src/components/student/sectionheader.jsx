import React from 'react';
import { ChevronRight } from 'lucide-react';

export const SectionHeader = ({ icon, title, action }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
        {icon}
        {title}
      </h2>
      {action && (
        <button
          onClick={action.onClick}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold flex items-center gap-1 text-sm bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
        >
          {action.label} <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};