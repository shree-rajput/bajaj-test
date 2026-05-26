import axios from 'axios';

// Resolve backend API endpoint. Fallback to localhost:5000 in development.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/tickets';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ticketApi = {
  /**
   * Fetch all tickets with matching status, priority, and breach filters
   */
  getTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.priority) {
      params.append('priority', filters.priority);
    }
    if (filters.breached !== undefined && filters.breached !== null) {
      params.append('breached', filters.breached);
    }

    const response = await api.get(`?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch board stats (counts per column, breaches count)
   */
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },

  /**
   * Create a new ticket
   */
  createTicket: async (ticketData) => {
    const response = await api.post('/', ticketData);
    return response.data;
  },

  /**
   * Update a ticket status (patching)
   */
  updateStatus: async (id, status) => {
    const response = await api.patch(`/${id}`, { status });
    return response.data;
  },

  /**
   * Delete a ticket by ID
   */
  deleteTicket: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};
