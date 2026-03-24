import React from 'react';

export const SkillTag = ({ skill, level, highlighted }) => {
  const levelColors = {
    basic: 'from-gray-400 to-gray-500',
    intermediate: 'from-blue-500 to-indigo-500',
    advanced: 'from-blue-600 to-indigo-600'
  };

  return (
    <div className={`px-3 py-2 rounded-lg bg-gradient-to-r ${levelColors[level]} text-white text-sm font-medium flex items-center gap-2  ${highlighted ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}>
      <Zap className="w-3 h-3" />
      {skill}
    </div>
  );
};