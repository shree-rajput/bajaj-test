const mongoose = require('mongoose');

const SLA_LIMITS_MS = {
  urgent: 1 * 60 * 60 * 1000,     // 1 hour
  high: 4 * 60 * 60 * 1000,       // 4 hours
  medium: 24 * 60 * 60 * 1000,    // 24 hours
  low: 72 * 60 * 60 * 1000        // 72 hours
};

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      }
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid priority'
      }
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['open', 'in_progress', 'resolved', 'closed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'open'
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Virtual for age in minutes
ticketSchema.virtual('ageMinutes').get(function () {
  const end = this.resolvedAt ? new Date(this.resolvedAt) : new Date();
  const diffMs = end - this.createdAt;
  return Math.max(0, Math.floor(diffMs / 60000));
});

// Virtual for SLA breach indicator
ticketSchema.virtual('slaBreached').get(function () {
  const targetMs = SLA_LIMITS_MS[this.priority] || SLA_LIMITS_MS.low;
  const end = this.resolvedAt ? new Date(this.resolvedAt) : new Date();
  const diffMs = end - this.createdAt;
  return diffMs > targetMs;
});

// Configure toJSON and toObject to include virtuals
ticketSchema.set('toJSON', {
  virtuals: true,
  versionKey: false
});

ticketSchema.set('toObject', {
  virtuals: true,
  versionKey: false
});

module.exports = mongoose.model('Ticket', ticketSchema);
module.exports.SLA_LIMITS_MS = SLA_LIMITS_MS;
