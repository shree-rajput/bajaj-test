import { useState } from 'react';
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

export const TicketCard = ({
  ticket,
  onMoveStatus,
  onDeleteTicket,
  draggableRef,
  draggableProps,
  dragHandleProps,
  isDragging,
}) => {
  const { _id, subject, description, customerEmail, priority, status, ageMinutes, slaBreached } = ticket;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isResolvedOrClosed = status === 'resolved' || status === 'closed';

  const actionButton = (label, targetStatus, tone, direction = 'right') => (
    <button
      onClick={() => onMoveStatus(_id, targetStatus)}
      className={`mini-button ${tone}`}
      title={`Move to ${targetStatus.replace('_', ' ')}`}
      id={`btn-${targetStatus}-${_id}`}
    >
      {direction === 'left' && <ArrowLeft size={14} />}
      {label}
      {direction === 'right' && <ArrowRight size={14} />}
    </button>
  );

  const renderActions = () => {
    switch (status) {
      case 'open':
        return (
          <div className="card-actions action-end">
            {actionButton('Start Work', 'in_progress', 'primary')}
          </div>
        );
      case 'in_progress':
        return (
          <div className="card-actions">
            {actionButton('Revert', 'open', 'neutral', 'left')}
            {actionButton('Resolve', 'resolved', 'success')}
          </div>
        );
      case 'resolved':
        return (
          <div className="card-actions">
            {actionButton('Reopen', 'in_progress', 'primary', 'left')}
            {actionButton('Close', 'closed', 'neutral')}
          </div>
        );
      case 'closed':
        return (
          <div className="card-actions action-start">
            {actionButton('Reopen', 'resolved', 'success', 'left')}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={draggableRef}
      {...draggableProps}
      {...dragHandleProps}
      className={`ticket-card ${slaBreached ? 'is-breached' : ''} ${isDragging ? 'is-dragging' : ''}`}
    >
      <div className="ticket-topline">
        <span className="ticket-customer">
          <Mail size={12} />
          {customerEmail}
        </span>

        {confirmDelete ? (
          <div className="confirm-actions">
            <button onClick={() => onDeleteTicket(_id)} className="confirm-button confirm-yes">
              Yes
            </button>
            <span>/</span>
            <button onClick={() => setConfirmDelete(false)} className="confirm-button">
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="delete-button"
            title="Delete Ticket"
            id={`delete-btn-${_id}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <h3 className="ticket-title">{subject}</h3>
      <p className="ticket-description">{description}</p>

      <div className="ticket-footer">
        <span className={`badge priority-${priority}`}>{priority}</span>

        <div className="ticket-meta">
          <span className="ticket-age">
            <Clock size={14} />
            {formatAge(ageMinutes)} {isResolvedOrClosed && '[Stopped]'}
          </span>

          {slaBreached && (
            <span className="sla-badge">
              <ShieldAlert size={14} />
              SLA BREACHED
            </span>
          )}
        </div>
      </div>

      {renderActions()}
    </div>
  );
};

export default TicketCard;
