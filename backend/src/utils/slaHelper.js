const SLA_LIMITS_MS = {
  urgent: 1 * 60 * 60 * 1000,     // 1 hour
  high: 4 * 60 * 60 * 1000,       // 4 hours
  medium: 24 * 60 * 60 * 1000,    // 24 hours
  low: 72 * 60 * 60 * 1000        // 72 hours
};

/**
 * Returns a MongoDB query condition that filters for breached tickets.
 * Handles both unresolved tickets (compared to current time) and 
 * resolved tickets (compared to their resolvedAt timestamp).
 */
const getBreachedQueryCondition = () => {
  const now = new Date();
  
  // Threshold timestamps for unresolved tickets
  const urgentLimit = new Date(now.getTime() - SLA_LIMITS_MS.urgent);
  const highLimit = new Date(now.getTime() - SLA_LIMITS_MS.high);
  const mediumLimit = new Date(now.getTime() - SLA_LIMITS_MS.medium);
  const lowLimit = new Date(now.getTime() - SLA_LIMITS_MS.low);

  return {
    $or: [
      // Case 1: Unresolved ticket exceeded SLA target
      {
        resolvedAt: null,
        $or: [
          { priority: 'urgent', createdAt: { $lt: urgentLimit } },
          { priority: 'high', createdAt: { $lt: highLimit } },
          { priority: 'medium', createdAt: { $lt: mediumLimit } },
          { priority: 'low', createdAt: { $lt: lowLimit } }
        ]
      },
      // Case 2: Resolved after SLA target
      {
        resolvedAt: { $ne: null },
        $or: [
          {
            priority: 'urgent',
            $expr: {
              $gt: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                SLA_LIMITS_MS.urgent
              ]
            }
          },
          {
            priority: 'high',
            $expr: {
              $gt: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                SLA_LIMITS_MS.high
              ]
            }
          },
          {
            priority: 'medium',
            $expr: {
              $gt: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                SLA_LIMITS_MS.medium
              ]
            }
          },
          {
            priority: 'low',
            $expr: {
              $gt: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                SLA_LIMITS_MS.low
              ]
            }
          }
        ]
      }
    ]
  };
};

module.exports = {
  SLA_LIMITS_MS,
  getBreachedQueryCondition
};
