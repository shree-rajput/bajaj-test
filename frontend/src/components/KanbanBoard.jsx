import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TicketCard from './TicketCard';
import { Inbox, CheckCircle2, Play, Archive, HelpCircle } from 'lucide-react';

const COLUMNS = [
  { id: 'open', title: 'Open', icon: Inbox, className: 'column-open' },
  { id: 'in_progress', title: 'In Progress', icon: Play, className: 'column-progress' },
  { id: 'resolved', title: 'Resolved', icon: CheckCircle2, className: 'column-resolved' },
  { id: 'closed', title: 'Closed', icon: Archive, className: 'column-closed' },
];

const ALLOWED_TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['open', 'resolved'],
  resolved: ['in_progress', 'closed'],
  closed: ['resolved'],
};

export const KanbanBoard = ({ tickets, onMoveStatus, onDeleteTicket, loading, showToast }) => {
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceStatus = source.droppableId;
    const targetStatus = destination.droppableId;

    if (sourceStatus === targetStatus) return;

    const allowed = ALLOWED_TRANSITIONS[sourceStatus];
    if (!allowed || !allowed.includes(targetStatus)) {
      showToast?.(
        `Invalid Move: Direct transitions from '${sourceStatus}' to '${targetStatus}' are not allowed.`,
        'warning'
      );
      return;
    }

    const res = await onMoveStatus(draggableId, targetStatus);
    if (!res.success) {
      showToast?.(res.error, 'error');
    }
  };

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

  const renderSkeletons = () => (
    <div className="kanban-grid">
      {COLUMNS.map((column) => (
        <div key={column.id} className={`board-column skeleton-column ${column.className}`}>
          <div className="column-header">
            <div className="column-title">
              <div className="skeleton-line short" />
            </div>
          </div>
          {[1, 2].map((item) => (
            <div key={item} className="skeleton-card">
              <div className="skeleton-line short" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line full" />
              <div className="skeleton-line short" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return renderSkeletons();
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-grid">
        {COLUMNS.map((column) => {
          const columnTickets = ticketsByStatus[column.id] || [];
          const Icon = column.icon;

          return (
            <div
              key={column.id}
              className={`board-column ${column.className}`}
              id={`kanban-column-${column.id}`}
            >
              <div className="column-header">
                <div className="column-title">
                  <Icon size={20} />
                  <h3>{column.title}</h3>
                </div>
                <span className="count-pill">{columnTickets.length}</span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`droppable-list custom-scrollbar ${snapshot.isDraggingOver ? 'is-over' : ''}`}
                  >
                    {columnTickets.length === 0 ? (
                      <div className="empty-column">
                        <HelpCircle size={32} strokeWidth={1.5} />
                        <span>No Tickets</span>
                      </div>
                    ) : (
                      columnTickets.map((ticket, index) => (
                        <Draggable key={ticket._id} draggableId={ticket._id} index={index}>
                          {(provided, snapshot) => (
                            <TicketCard
                              ticket={ticket}
                              onMoveStatus={onMoveStatus}
                              onDeleteTicket={onDeleteTicket}
                              draggableRef={provided.innerRef}
                              draggableProps={provided.draggableProps}
                              dragHandleProps={provided.dragHandleProps}
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
