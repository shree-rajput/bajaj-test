import React from 'react';
import { Inbox, Activity, CheckCircle2, Archive, AlertTriangle } from 'lucide-react';

export const StatsStrip = ({ stats, activeStatusFilter, onStatusFilterClick }) => {
  const { statusCounts, breachedOpenCount } = stats;

  const statItems = [
    {
      id: 'open',
      label: 'Open Tickets',
      count: statusCounts?.open || 0,
      icon: Inbox,
      colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/30',
      activeClass: 'ring-2 ring-indigo-500 border-transparent',
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      count: statusCounts?.in_progress || 0,
      icon: Activity,
      colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30',
      activeClass: 'ring-2 ring-blue-500 border-transparent',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      count: statusCounts?.resolved || 0,
      icon: CheckCircle2,
      colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30',
      activeClass: 'ring-2 ring-emerald-500 border-transparent',
    },
    {
      id: 'closed',
      label: 'Closed',
      count: statusCounts?.closed || 0,
      icon: Archive,
      colorClass: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800',
      activeClass: 'ring-2 ring-slate-500 border-transparent',
    },
    {
      id: 'breached',
      label: 'SLA Breached',
      count: breachedOpenCount || 0,
      icon: AlertTriangle,
      colorClass: `text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30 ${
        breachedOpenCount > 0 ? 'animate-pulse' : ''
      }`,
      activeClass: 'ring-2 ring-rose-500 border-transparent',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
      {statItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeStatusFilter === item.id;
        
        return (
          <button
            key={item.label}
            id={`stats-card-${item.id}`}
            onClick={() => onStatusFilterClick && onStatusFilterClick(item.id)}
            className={`flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 ${
              item.colorClass
            } ${
              isActive ? item.activeClass : 'hover:scale-[1.02] shadow-sm'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {item.label}
              </p>
              <h3 className="text-2xl font-bold font-mono tracking-tight mt-0.5">
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
