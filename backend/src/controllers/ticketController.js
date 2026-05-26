const Ticket = require('../models/Ticket');
const { getBreachedQueryCondition, SLA_LIMITS_MS } = require('../utils/slaHelper');

// Status transition matrix
const ALLOWED_TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['open', 'resolved'],
  resolved: ['in_progress', 'closed'],
  closed: ['resolved']
};

/**
 * Create a new ticket
 * POST /tickets
 */
const createTicket = async (req, res, next) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;
    
    const ticket = await Ticket.create({
      subject,
      description,
      customerEmail,
      priority,
      status: 'open'
    });

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tickets with dynamic filters
 * GET /tickets
 */
const getTickets = async (req, res, next) => {
  try {
    const { status, priority, breached } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (breached === 'true') {
      const breachedCondition = getBreachedQueryCondition();
      query.$or = breachedCondition.$or;
    }

    // Sort by creation time descending (newest first)
    const tickets = await Ticket.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a ticket's status with transition rules validation
 * PATCH /tickets/:id
 */
const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      const error = new Error(`Ticket with ID ${id} not found`);
      error.statusCode = 404;
      return next(error);
    }

    const currentStatus = ticket.status;

    // Check transition validity if status is actually changing
    if (currentStatus !== newStatus) {
      const allowed = ALLOWED_TRANSITIONS[currentStatus];
      if (!allowed || !allowed.includes(newStatus)) {
        const error = new Error(
          `Invalid transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${currentStatus} -> ${allowed ? allowed.join(', ') : 'none'}`
        );
        error.statusCode = 400;
        return next(error);
      }

      // Update resolvedAt timestamps
      if (newStatus === 'resolved') {
        if (!ticket.resolvedAt) {
          ticket.resolvedAt = new Date();
        }
      } else if (newStatus === 'in_progress' || newStatus === 'open') {
        // Cleared when moved back from resolved
        ticket.resolvedAt = null;
      }

      ticket.status = newStatus;
      await ticket.save();
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a ticket
 * DELETE /tickets/:id
 */
const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);

    if (!ticket) {
      const error = new Error(`Ticket with ID ${id} not found`);
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ticket statistics
 * GET /tickets/stats
 */
const getTicketStats = async (req, res, next) => {
  try {
    const now = new Date();

    // Query condition for open/unresolved breached tickets
    const breachedOpenQuery = {
      status: { $in: ['open', 'in_progress'] },
      $or: [
        { priority: 'urgent', createdAt: { $lt: new Date(now.getTime() - SLA_LIMITS_MS.urgent) } },
        { priority: 'high', createdAt: { $lt: new Date(now.getTime() - SLA_LIMITS_MS.high) } },
        { priority: 'medium', createdAt: { $lt: new Date(now.getTime() - SLA_LIMITS_MS.medium) } },
        { priority: 'low', createdAt: { $lt: new Date(now.getTime() - SLA_LIMITS_MS.low) } }
      ]
    };

    const [statusCounts, priorityCounts, breachedOpenCount] = await Promise.all([
      Ticket.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Ticket.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Ticket.countDocuments(breachedOpenQuery)
    ]);

    // Format status counts with defaults for empty categories
    const statusData = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    statusCounts.forEach(item => {
      if (item._id in statusData) {
        statusData[item._id] = item.count;
      }
    });

    // Format priority counts with defaults for empty categories
    const priorityData = { low: 0, medium: 0, high: 0, urgent: 0 };
    priorityCounts.forEach(item => {
      if (item._id in priorityData) {
        priorityData[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        statusCounts: statusData,
        priorityCounts: priorityData,
        breachedOpenCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  updateTicketStatus,
  deleteTicket,
  getTicketStats
};
