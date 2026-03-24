import React from 'react';

const EmptyState = ({
  icon,
  title = "No Data Found",
  message = "There is no data available to display right now.",
  action,
  imgSrc = "https://img.freepik.com/free-vector/no-data-concept-illustration_114360-536.jpg"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center w-full">
      {imgSrc ? (
        <img
          src={imgSrc}
          alt="No Data Found"
          className="mx-auto w-48 h-48 object-contain mb-4 mix-blend-multiply"
        />
      ) : icon ? (
        <div className="text-gray-300 mb-4">
          {icon}
        </div>
      ) : null}

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-slate-400 text-sm max-w-md mb-6 font-medium">{message}</p>

      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;