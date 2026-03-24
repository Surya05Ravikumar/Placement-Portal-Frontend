import React from 'react';
export const NotificationItem = ({ icon, message, time, type }) => {
  const typeColors = {
    new: 'text-blue-600 bg-blue-50',
    update: 'text-purple-600 bg-purple-50',
    result: 'text-green-600 bg-green-50',
    deadline: 'text-amber-600 bg-amber-50'
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
      <div className={`p-2 rounded-lg ${typeColors[type]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-gray-800 text-sm font-medium">{message}</p>
        <p className="text-gray-500 text-xs mt-1">{time}</p>
      </div>
    </div>
  );
};