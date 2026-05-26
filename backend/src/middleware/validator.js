const validateTicketCreate = (req, res, next) => {
  const { subject, description, customerEmail, priority } = req.body;
  const errors = [];

  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    errors.push('Subject is required');
  }
  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('Description is required');
  }
  if (!customerEmail || typeof customerEmail !== 'string' || !customerEmail.trim()) {
    errors.push('Customer email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      errors.push('Customer email format is invalid');
    }
  }
  
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (!priority) {
    errors.push('Priority is required');
  } else if (!validPriorities.includes(priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      messages: errors
    });
  }
  next();
};

const validateTicketStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];

  if (!status) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      messages: ['Status is required']
    });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      messages: [`Status must be one of: ${validStatuses.join(', ')}`]
    });
  }

  next();
};

module.exports = {
  validateTicketCreate,
  validateTicketStatusUpdate
};
