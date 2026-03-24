import React from 'react';
import { CheckCircle2, XCircle, Clock, TrendingUp, FileText } from 'lucide-react';
import HighlightText from '../common/HighlightText';
import StatusBadge from '../common/statusbadge';

export const ApplicationStatusItem = ({ company, status, searchQuery, onClick }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'selected':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'interviewed':
        return <Clock className="w-5 h-5 text-indigo-600" />;
      case 'shortlisted':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-all border border-transparent hover:border-gray-200 dark:hover:border-slate-800 cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        {getStatusIcon(status)}
        <span className="text-gray-800 dark:text-slate-200 font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <HighlightText text={company} highlight={searchQuery} />
        </span>
      </div>
      <StatusBadge status={status} label={status.charAt(0).toUpperCase() + status.slice(1)} />
    </div>
  );
};