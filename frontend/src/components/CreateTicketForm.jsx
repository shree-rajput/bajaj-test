import { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';

export const CreateTicketForm = ({ onSubmitTicket, showToast }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    customerEmail: '',
    priority: 'low',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showToast?.('Please correct the validation errors in the form.', 'error');
      return;
    }

    setSubmitting(true);
    const result = await onSubmitTicket(formData);
    setSubmitting(false);

    if (result.success) {
      showToast?.('Ticket created successfully and placed in Open status.', 'success');
      setFormData({
        subject: '',
        description: '',
        customerEmail: '',
        priority: 'low',
      });
      setErrors({});
    } else {
      showToast?.(result.error || 'Failed to create ticket.', 'error');
    }
  };

  const inputClass = (fieldName, extraClass = '') =>
    `input ${extraClass} ${errors[fieldName] ? 'has-error' : ''}`;

  return (
    <div className="ticket-form">
      <div className="form-title">
        <PlusCircle size={20} className="text-open" />
        <h2>Create Support Ticket</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-fields" noValidate>
        <div className="form-field">
          <label htmlFor="customerEmail" className="field-label">
            Customer Email
          </label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="customer@example.com"
            className={inputClass('customerEmail')}
          />
          {errors.customerEmail && <span className="error-text">{errors.customerEmail}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="subject" className="field-label">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief issue summary..."
            className={inputClass('subject')}
          />
          {errors.subject && <span className="error-text">{errors.subject}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="description" className="field-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the issue..."
            rows={3}
            className={inputClass('description', 'textarea')}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="priority" className="field-label">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="select"
          >
            <option value="low">Low (72 hr SLA)</option>
            <option value="medium">Medium (24 hr SLA)</option>
            <option value="high">High (4 hr SLA)</option>
            <option value="urgent">Urgent (1 hr SLA)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="button primary-button"
          id="submit-ticket-btn"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="spin" />
              Creating...
            </>
          ) : (
            'Create Ticket'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateTicketForm;
