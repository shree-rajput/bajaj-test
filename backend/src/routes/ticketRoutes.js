const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  updateTicketStatus,
  deleteTicket,
  getTicketStats
} = require('../controllers/ticketController');
const {
  validateTicketCreate,
  validateTicketStatusUpdate
} = require('../middleware/validator');

// /tickets and /tickets/stats routes
router.route('/')
  .post(validateTicketCreate, createTicket)
  .get(getTickets);

router.route('/stats')
  .get(getTicketStats);

// /tickets/:id routes
router.route('/:id')
  .patch(validateTicketStatusUpdate, updateTicketStatus)
  .delete(deleteTicket);

module.exports = router;
