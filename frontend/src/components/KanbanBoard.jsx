import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TicketCard from './TicketCard';
import { ShieldAlert, Inbox, CheckCircle2, Play, Archive, HelpCircle } from 'lucide-react';

const COLUMNS = [
  { id: 'open', title: 'Open', icon: Inbox, color: 'border-t-indigo-500 bg-indigo-500/5' },
  { id: 'in_progress', title: 'In Progress', icon: Play, color: 'border-t-blue-500 bg-blue-500/5' },
  { id: 'resolved', title: 'Resolved', icon: CheckCircle2, color: 'border-t-emerald-500 bg-emerald-500/5' },
  { id: 'closed', title: 'Closed', icon: Archive, color: 'border-t-slate-500 bg-slate-500/5' },
];

const ALLOWED_TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['open', 'resolved'],
  resolved: ['in_progress', 'closed'],
  closed: ['resolved']
};

export const KanbanBoard = ({ tickets, onMoveStatus, onDeleteTicket, loading, showToast }) => {
  
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid column
    if (!destination) return;

    const sourceStatus = source.droppableId;
    const targetStatus = destination.droppableId;

    // No status change
    if (sourceStatus === targetStatus) return;

    // Validate status transition rules
    const allowed = ALLOWED_TRANSITIONS[sourceStatus];
    if (!allowed || !allowed.includes(targetStatus)) {
      showToast?.(
        `Invalid Move: Direct transitions from '${sourceStatus}' to '${targetStatus}' are not allowed.`,
        'warning'
      );
      return; // Snack-back occurs automatically because state is not updated
    }

    // Attempt the transition
    const res = await onMoveStatus(draggableId, targetStatus);
    if (!res.success) {
      showToast?.(res.error, 'error');
    }
  };

  // Group tickets by status
  const ticketsByStatus = {
    open: [],
    in_progress: [],
    resolved: [],
    closed: [],
  };

  tickets.forEach((ticket) => {
    if (ticketsByStatus[ticket.status]) {
      ticketsByStatus[ticket.status].push(ticket);
    }
  });

  // Skeleton Column Renderer
  const renderSkeletons = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mt-2">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col gap-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200/40 dark:border-slate-800/40 h-[600px]">
            <div className="flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-800/40 pb-2 mb-2 animate-pulse">
              <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col gap-3 animate-pulse shadow-sm h-32">
                <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4.5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="flex justify-between items-center mt-1">
                  <div className="h-5 w-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                  <div className="h-4.5 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return renderSkeletons();
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full items-start mt-2">
        {COLUMNS.map((col) => {
          const colTickets = ticketsByStatus[col.id] || [];
          const Icon = col.icon;
          
          return (
            <div
              key={col.id}
              className={`flex flex-col gap-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-4 border-t-4 ${col.color} min-h-[600px] max-h-[800px] overflow-hidden shadow-sm`}
              id={`kanban-column-${col.id}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-2 mb-1">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <Icon className="h-5 w-5 opacity-80" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">{col.title}</h3>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {colTickets.length}
                </span>
              </div>

              {/* Column Body - Droppable Area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar transition-colors ${
                      snapshot.isDraggingOver ? 'bg-slate-100/30 dark:bg-slate-900/30 rounded-xl' : ''
                    }`}
                  >
                    {colTickets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500 text-center gap-2 my-auto">
                        <HelpCircle className="h-8 w-8 stroke-[1.5] opacity-50" />
                        <span className="text-xs font-semibold">No Tickets</span>
                      </div>
                    ) : (
                      colTickets.map((ticket, index) => (
                        <Draggable key={ticket._id} draggableId={ticket._id} index={index}>
                          {(provided, snapshot) => (
                            <TicketCard
                              ticket={ticket}
                              onMoveStatus={onMoveStatus}
                              onDeleteTicket={onDeleteTicket}
                              provided={provided}
                              isDragging={snapshot.isDragging}
                            />
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
