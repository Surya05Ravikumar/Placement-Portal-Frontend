import React, { useEffect } from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';

const FilterSidebar = ({ isOpen, onClose, filters, activeFilters, onFilterChange, onClearFilters }) => {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    return (
        <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible delay-300'}`}>
            {/* Backdrop - Simple dimming, no blur as requested */}
            <div
                className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#020617] transform transition-transform duration-300 ease-in-out flex flex-col border-l border-transparent dark:border-slate-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {filters.map((filter) => (
                        <div key={filter.id} className="space-y-3">
                            <label className="block text-sm font-bold text-gray-900 dark:text-slate-200 uppercase tracking-widest">
                                {filter.label}
                            </label>

                            {filter.type === 'select' && (
                                <div className="space-y-2 relative">
                                    <select
                                        value={activeFilters[filter.id] || ''}
                                        onChange={(e) => onFilterChange(filter.id, e.target.value)}
                                        className="appearance-none pr-10 w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                    >
                                        <option value="">All {filter.label}</option>
                                        {filter.options.map((option) => (
                                            <option key={option.value} value={option.value} className="bg-white dark:bg-[#020617]">
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-500 font-bold absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                </div>
                            )}

                            {filter.type === 'range' && (
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={activeFilters[filter.id]?.min || ''}
                                            onChange={(e) =>
                                                onFilterChange(filter.id, {
                                                    ...(activeFilters[filter.id] || {}),
                                                    min: e.target.value
                                                })
                                            }
                                            className="w-full pl-7 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-slate-600"
                                        />
                                    </div>
                                    <span className="text-gray-400">-</span>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={activeFilters[filter.id]?.max || ''}
                                            onChange={(e) =>
                                                onFilterChange(filter.id, {
                                                    ...(activeFilters[filter.id] || {}),
                                                    max: e.target.value
                                                })
                                            }
                                            className="w-full pl-7 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex gap-3">
                    <button
                        onClick={onClearFilters}
                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:border-gray-400 dark:hover:border-slate-600 transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700  hover: transition-all"
                    >
                        Show Results
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;
