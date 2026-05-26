import { Filter, RotateCcw, ShieldAlert } from 'lucide-react';

export const FiltersSection = ({ filters, setFilters }) => {
  const handlePriorityChange = (e) => {
    setFilters((prev) => ({ ...prev, priority: e.target.value }));
  };

  const handleBreachedToggle = (e) => {
    setFilters((prev) => ({ ...prev, breached: e.target.checked ? true : null }));
  };

  const handleReset = () => {
    setFilters({ priority: '', breached: null });
  };

  const hasActiveFilters = filters.priority !== '' || filters.breached !== null;

  return (
    <div className="glass-panel filters-panel">
      <div className="filter-group">
        <div className="filter-title">
          <Filter size={18} />
          <span>Filter Tickets</span>
        </div>

        <div className="inline-row">
          <label htmlFor="priority-filter" className="field-label">
            Priority:
          </label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={handlePriorityChange}
            className="select"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <label htmlFor="breached-filter" className="toggle-label">
          <input
            type="checkbox"
            id="breached-filter"
            checked={filters.breached === true}
            onChange={handleBreachedToggle}
            className="toggle-input"
          />
          <span className="toggle-switch" />
          <span className="inline-row">
            <ShieldAlert size={16} className={filters.breached === true ? 'text-danger' : ''} />
            SLA Breached Only
          </span>
        </label>
      </div>

      {hasActiveFilters && (
        <button onClick={handleReset} className="button subtle-button" id="clear-filters-btn">
          <RotateCcw size={14} />
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default FiltersSection;
