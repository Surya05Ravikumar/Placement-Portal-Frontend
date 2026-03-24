import React from 'react';
import { ChevronRight } from 'lucide-react';
import HighlightText from '../common/HighlightText';
import CompanyLogo from '../common/CompanyLogo';

export const CompanyPreviewItem = ({ company, logo, role, deadline, onAction, onClick, searchQuery }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md dark:hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <CompanyLogo logo={logo} name={company} className="w-12 h-12" />
        <div>
          <h4 className="text-gray-900 dark:text-white font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <HighlightText text={company} highlight={searchQuery} />
          </h4>
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
            <HighlightText text={role} highlight={searchQuery} />
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase font-bold tracking-widest">Deadline</p>
          <p className="text-sm text-gray-700 dark:text-slate-300 font-bold uppercase tracking-tight">{deadline}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors duration-300 flex items-center gap-2 "
        >
          Apply <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};