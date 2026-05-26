import React, { useState } from 'react';
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
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customerEmail)) {
        newErrors.customerEmail = 'Please enter a valid email address';
      }
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
    // Clear individual field errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
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
      // Reset form
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

  return (
    <div className="glass-panel rounded-2xl p-5 w-full flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <PlusCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Create Support Ticket
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
        {/* Customer Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="customerEmail" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Customer Email
          </label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="customer@example.com"
            className={`px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/35 transition-all ${
              errors.customerEmail 
                ? 'border-rose-500 focus:ring-rose-500/35 focus:border-rose-500' 
                : 'border-slate-200 dark:border-slate-800 focus:border-brand'
            }`}
          />
          {errors.customerEmail && (
            <span className="text-xs font-medium text-rose-500 mt-0.5">{errors.customerEmail}</span>
          )}
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-1">
          <label htmlFor="subject" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief issue summary..."
            className={`px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/35 transition-all ${
              errors.subject 
                ? 'border-rose-500 focus:ring-rose-500/35 focus:border-rose-500' 
                : 'border-slate-200 dark:border-slate-800 focus:border-brand'
            }`}
          />
          {errors.subject && (
            <span className="text-xs font-medium text-rose-500 mt-0.5">{errors.subject}</span>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the issue..."
            rows={3}
            className={`px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/35 transition-all resize-none ${
              errors.description 
                ? 'border-rose-500 focus:ring-rose-500/35 focus:border-rose-500' 
                : 'border-slate-200 dark:border-slate-800 focus:border-brand'
            }`}
          />
          {errors.description && (
            <span className="text-xs font-medium text-rose-500 mt-0.5">{errors.description}</span>
          )}
        </div>

        {/* Priority */}
        <div className="flex flex-col gap-1">
          <label htmlFor="priority" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/35 focus:border-brand transition-all"
          >
            <option value="low">Low (72 hr SLA)</option>
            <option value="medium">Medium (24 hr SLA)</option>
            <option value="high">High (4 hr SLA)</option>
            <option value="urgent">Urgent (1 hr SLA)</option>
          </select>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-brand hover:bg-brand-dark disabled:bg-brand/50 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md shadow-brand/20 hover:shadow-brand-dark/30"
          id="submit-ticket-btn"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
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
