import { Inbox, Activity, CheckCircle2, Archive, AlertTriangle } from 'lucide-react';

export const StatsStrip = ({ stats, activeStatusFilter, onStatusFilterClick }) => {
  const { statusCounts, breachedOpenCount } = stats;

  const statItems = [
    {
      id: 'open',
      label: 'Open Tickets',
      count: statusCounts?.open || 0,
      icon: Inbox,
      tone: 'tone-open',
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      count: statusCounts?.in_progress || 0,
      icon: Activity,
      tone: 'tone-progress',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      count: statusCounts?.resolved || 0,
      icon: CheckCircle2,
      tone: 'tone-resolved',
    },
    {
      id: 'closed',
      label: 'Closed',
      count: statusCounts?.closed || 0,
      icon: Archive,
      tone: 'tone-closed',
    },
    {
      id: 'breached',
      label: 'SLA Breached',
      count: breachedOpenCount || 0,
      icon: AlertTriangle,
      tone: `tone-danger ${breachedOpenCount > 0 ? 'pulse' : ''}`,
    },
  ];

  return (
    <div className="stats-grid">
      {statItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeStatusFilter === item.id;
        
        return (
          <button
            key={item.label}
            id={`stats-card-${item.id}`}
            onClick={() => onStatusFilterClick && onStatusFilterClick(item.id)}
            className={`stat-card ${item.tone} ${isActive ? 'is-active' : ''}`}
          >
            <div className="stat-icon">
              <Icon size={20} />
            </div>
            <div>
              <p className="stat-label">
                {item.label}
              </p>
              <h3 className="stat-count">
                {item.count}
              </h3>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default StatsStrip;
