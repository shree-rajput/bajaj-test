import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldAlert, Trash2, Clock, Mail } from 'lucide-react';

const formatAge = (minutes) => {
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours < 24) {
    return `${hours}h ${remainingMins}m`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
};

export const TicketCard = ({ ticket, onMoveStatus, onDeleteTicket, provided, isDragging }) => {
  const { _id, subject, description, customerEmail, priority, status, ageMinutes, slaBreached, resolvedAt } = ticket;
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Priority color mappings
  const priorityColors = {
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-100 dark:border-blue-900/30',
    high: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-100 dark:border-orange-900/30',
    urgent: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-100 dark:border-rose-900/30 font-bold',
  };

  // Define transition buttons based on allowed status transitions
  const renderActions = () => {
    switch (status) {
      case 'open':
        return (
          <div className="flex justify-end w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <button
              onClick={() => onMoveStatus(_id, 'in_progress')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 rounded-lg transition-all cursor-pointer"
              title="Move to In Progress"
              id={`btn-start-${_id}`}
            >
              Start Work
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      case 'in_progress':
        return (
          <div className="flex justify-between w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <button
              onClick={() => onMoveStatus(_id, 'open')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800/80 rounded-lg transition-all cursor-pointer"
              title="Move back to Open"
              id={`btn-revert-open-${_id}`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Revert
            </button>
            <button
              onClick={() => onMoveStatus(_id, 'resolved')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 rounded-lg transition-all cursor-pointer"
              title="Move to Resolved"
              id={`btn-resolve-${_id}`}
            >
              Resolve
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      case 'resolved':
        return (
          <div className="flex justify-between w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <button
              onClick={() => onMoveStatus(_id, 'in_progress')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 rounded-lg transition-all cursor-pointer"
              title="Move back to In Progress"
              id={`btn-reopen-${_id}`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Reopen
            </button>
            <button
              onClick={() => onMoveStatus(_id, 'closed')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800/80 rounded-lg transition-all cursor-pointer"
              title="Move to Closed"
              id={`btn-close-${_id}`}
            >
              Close
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      case 'closed':
        return (
          <div className="flex justify-start w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <button
              onClick={() => onMoveStatus(_id, 'resolved')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 rounded-lg transition-all cursor-pointer"
              title="Reopen to Resolved"
              id={`btn-unclose-${_id}`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Reopen
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const isResolvedOrClosed = status === 'resolved' || status === 'closed';

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`card-hover-effect flex flex-col p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all select-none gap-2 ${
        slaBreached 
          ? 'border-l-4 border-l-rose-500 shadow-rose-100/50 dark:shadow-rose-950/10 ring-1 ring-rose-500/10' 
          : 'border-l-4 border-l-brand'
      } ${isDragging ? 'shadow-2xl border-indigo-400 scale-[1.03] z-50' : 'shadow-sm'}`}
    >
      {/* Customer Email & Delete Button */}
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 max-w-[80%] truncate">
          <Mail className="h-3 w-3 shrink-0" />
          {customerEmail}
        </span>
        
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDeleteTicket(_id)}
              className="text-[10px] font-extrabold text-rose-500 hover:underline cursor-pointer"
            >
              Yes
            </button>
            <span className="text-[10px] text-slate-400">/</span>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-[10px] text-slate-400 hover:underline cursor-pointer"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            title="Delete Ticket"
            id={`delete-btn-${_id}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Ticket Subject */}
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight line-clamp-1">
        {subject}
      </h3>

      {/* Ticket Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
        {description}
      </p>

      {/* Priority Badge, Age and SLA warning */}
      <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${
          priorityColors[priority]
        }`}>
          {priority}
        </span>

        <div className="flex items-center gap-2">
          {/* Age info */}
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            {formatAge(ageMinutes)} {isResolvedOrClosed && '[Stopped]'}
          </span>

          {/* SLA warning badge */}
          {slaBreached && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 rounded-md border border-rose-100 dark:border-rose-900/30">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
              SLA BREACHED
            </span>
          )}
        </div>
      </div>

      {/* Direct Transition Action Bar */}
      {renderActions()}
    </div>
  );
};

export default TicketCard;
