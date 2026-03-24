import React from 'react';
import HighlightText from '../common/HighlightText';
import StatusBadge from '../common/statusbadge';

export const MetricCard = ({ title, mainValue, subtext, statusChip, icon, variant = 'blue', searchQuery, onClick }) => {
  const variants = {
    blue: {
      bg: 'from-blue-50 to-indigo-50 dark:from-blue-500/20 dark:to-indigo-500/20',
      text: 'text-blue-600 dark:text-blue-400',
      groupText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
    },
    green: {
      bg: 'from-green-50 to-emerald-50 dark:from-green-500/20 dark:to-emerald-500/20',
      text: 'text-green-600 dark:text-green-400',
      groupText: 'group-hover:text-green-600 dark:group-hover:text-green-400'
    },
    orange: {
      bg: 'from-orange-50 to-amber-50 dark:from-orange-500/20 dark:to-amber-500/20',
      text: 'text-orange-600 dark:text-orange-400',
      groupText: 'group-hover:text-orange-600 dark:group-hover:text-orange-400'
    },
    purple: {
      bg: 'from-purple-50 to-violet-50 dark:from-purple-500/20 dark:to-violet-500/20',
      text: 'text-purple-600 dark:text-purple-400',
      groupText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400'
    }
  };

  const currentVariant = variants[variant] || variants.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#020617] rounded-3xl p-8 border border-gray-100 dark:border-slate-800/50 transition-all duration-500 group ${onClick ? 'cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1' : ''} shadow-sm dark:shadow-black/20 relative overflow-hidden`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${currentVariant.bg} flex items-center justify-center ${currentVariant.text} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div>
            <h3 className="text-gray-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <HighlightText text={title} highlight={searchQuery} />
            </h3>
          </div>
        </div>

        {statusChip && <StatusBadge status={statusChip.status} label={statusChip.label} />}
      </div>
      <div className="mb-2 relative z-10">
        <span className={`text-4xl font-black text-gray-900 dark:text-white ${currentVariant.groupText} transition-colors duration-300 tracking-tight`}>
          <HighlightText text={mainValue} highlight={searchQuery} />
        </span>
      </div>
      <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-tight opacity-80">
        <HighlightText text={subtext} highlight={searchQuery} />
      </p>
    </div>
  );
};