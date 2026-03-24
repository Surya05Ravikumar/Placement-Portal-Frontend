import React from 'react';

const TabSwitcher = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="overflow-x-auto pb-4 scrollbar-hide max-w-[calc(100vw-300px)] transition-colors">
            <div className="flex space-x-1 bg-blue-100/30 dark:bg-slate-800/50 p-1.5 rounded-lg w-max border border-transparent dark:border-slate-800">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
            relative flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 whitespace-nowrap
            ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-md dark:shadow-blue-900/20'
                                : 'text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800'
                            }
          `}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`
              px-2 py-0.5 text-[10px] rounded-full font-bold
              ${activeTab === tab.id
                                    ? 'bg-white text-blue-600'
                                    : 'bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                                }
            `}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TabSwitcher;
