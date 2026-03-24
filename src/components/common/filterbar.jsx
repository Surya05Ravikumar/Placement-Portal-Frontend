import React from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

const FilterBar = ({ filters, activeFilters, onFilterChange, onClearFilters }) => {
  const hasActiveFilters = Object.values(activeFilters).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (value && typeof value === 'object') {
      return Object.values(value).some(v => v !== '' && v !== null);
    }

    return value !== '' && value !== null;
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <div key={filter.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.label}
            </label>

            {filter.type === 'select' && (
              <div className="relative">
                <select
                  value={activeFilters[filter.id] || ''}
                  onChange={(e) => onFilterChange(filter.id, e.target.value)}
                  className="appearance-none pr-10 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 font-bold absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {filter.type === 'range' && (
              <div className="flex gap-2">
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
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

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
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
