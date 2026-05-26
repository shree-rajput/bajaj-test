import React from 'react';
import { Filter, RotateCcw, ShieldAlert } from 'lucide-react';

export const FiltersSection = ({ filters, setFilters }) => {
  const handlePriorityChange = (e) => {
    const val = e.target.value;
    setFilters((prev) => ({ ...prev, priority: val }));
  };

  const handleBreachedToggle = (e) => {
    const checked = e.target.checked;
    setFilters((prev) => ({ ...prev, breached: checked ? true : null }));
  };

  const handleReset = () => {
    setFilters({ priority: '', breached: null });
  };

  const hasActiveFilters = filters.priority !== '' || filters.breached !== null;

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Filter className="h-4.5 w-4.5 text-brand" />
          <span className="text-sm font-semibold tracking-wide">Filter Tickets</span>
        </div>

        {/* Priority Filter Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <label htmlFor="priority-filter" className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
            Priority:
          </label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={handlePriorityChange}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/35 focus:border-brand transition-all"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* SLA Breached Checkbox */}
        <div className="flex items-center gap-2.5 px-1 py-1">
          <label 
            htmlFor="breached-filter" 
            className="relative flex items-center gap-2.5 cursor-pointer select-none text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            <input
              type="checkbox"
              id="breached-filter"
              checked={filters.breached === true}
              onChange={handleBreachedToggle}
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-slate-200 dark:bg-slate-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:bg-slate-400 after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-rose-500 peer-checked:after:translate-x-full"></div>
            <span className="flex items-center gap-1.5">
              <ShieldAlert className={`h-4 w-4 transition-colors ${
                filters.breached === true ? 'text-rose-500' : 'text-slate-400'
              }`} />
              SLA Breached Only
            </span>
          </label>
        </div>
      </div>

      {/* Reset Action */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 rounded-xl transition-all duration-200"
          id="clear-filters-btn"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default FiltersSection;
