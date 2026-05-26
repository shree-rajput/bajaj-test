import { useState, useEffect, useCallback } from 'react';
import { ticketApi } from '../api/ticketApi';

export const useTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    statusCounts: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
    priorityCounts: { low: 0, medium: 0, high: 0, urgent: 0 },
    breachedOpenCount: 0,
  });
  
  const [filters, setFilters] = useState({
    priority: '',
    breached: null, // null = all, true = breached only
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Loads tickets with priority and breach filters
   */
  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketApi.getTickets({
        priority: filters.priority,
        breached: filters.breached,
      });
      if (data.success) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error('Fetch tickets error:', err);
      setError(err.response?.data?.error || 'Failed to fetch tickets. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Loads tickets stats (aggregate metrics)
   */
  const loadStats = useCallback(async () => {
    try {
      const data = await ticketApi.getStats();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, []);

  // Initial load and reloading on filter change
  useEffect(() => {
    loadTickets();
    loadStats();
  }, [loadTickets, loadStats]);

  /**
   * Submits and prepends a new ticket to local board state
   */
  const addTicket = async (ticketData) => {
    try {
      const data = await ticketApi.createTicket(ticketData);
      if (data.success) {
        // Prepend to display immediately in the "Open" column
        setTickets((prev) => [data.data, ...prev]);
        loadStats();
        return { success: true, data: data.data };
      }
    } catch (err) {
      console.error('Create ticket error:', err);
      const messages = err.response?.data?.messages;
      const errorMsg = messages ? messages.join(', ') : (err.response?.data?.error || 'Failed to create ticket');
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Updates ticket status, with optimistic local update and error rollback
   */
  const changeTicketStatus = async (id, newStatus) => {
    const originalTicket = tickets.find((t) => t._id === id);
    if (!originalTicket) {
      return { success: false, error: 'Ticket not found locally' };
    }

    const previousStatus = originalTicket.status;

    // Optimistic UI update for immediate drag responsive feel
    setTickets((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
    );

    try {
      const data = await ticketApi.updateStatus(id, newStatus);
      if (data.success) {
        // Update with full model containing updated resolvedAt, ageMinutes, and slaBreached
        setTickets((prev) =>
          prev.map((t) => (t._id === id ? data.data : t))
        );
        loadStats();
        return { success: true, data: data.data };
      }
    } catch (err) {
      console.error('Update status error:', err);
      // Rollback to previous status state
      setTickets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: previousStatus } : t))
      );
      const errorMsg = err.response?.data?.error || 'Failed to update ticket status';
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Deletes a ticket and removes from local state
   */
  const removeTicket = async (id) => {
    try {
      const data = await ticketApi.deleteTicket(id);
      if (data.success) {
        setTickets((prev) => prev.filter((t) => t._id !== id));
        loadStats();
        return { success: true };
      }
    } catch (err) {
      console.error('Delete ticket error:', err);
      return { success: false, error: err.response?.data?.error || 'Failed to delete ticket' };
    }
  };

  return {
    tickets,
    stats,
    filters,
    setFilters,
    loading,
    error,
    refreshTickets: loadTickets,
    refreshStats: loadStats,
    addTicket,
    changeTicketStatus,
    removeTicket,
  };
};
