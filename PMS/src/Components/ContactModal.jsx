import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Clock, Send, CheckCircle2, Building, MessageSquare } from 'lucide-react';
import '../Styles/ContactModal.css';

export default function ContactModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', company: '', email: '', message: '' });
      onClose();
    }, 2200);
  }

  return (
    <div className="contact-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="contact-modal-window"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <div className="modal-header-bar">
          <div>
            <span className="modal-badge-pill">Campus Placement Cell</span>
            <h3 id="contact-modal-title" className="modal-headline">
              Connect with Placement Officers
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-icon-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-grid">
          {/* Left Column: Office Contacts */}
          <div className="modal-info-panel">
            <h4 className="panel-title">Central Placement Office</h4>
            <p className="panel-desc">
              Direct institutional coordination for corporate drives, campus hiring, and student placement assistance.
            </p>

            <div className="info-items-list">
              <div className="info-row">
                <MapPin size={18} className="info-icon text-indigo" />
                <div>
                  <strong>Campus Location</strong>
                  <p>Tech Hub Level 4, Center for Career Planning & Placements</p>
                </div>
              </div>

              <div className="info-row">
                <Mail size={18} className="info-icon text-indigo" />
                <div>
                  <strong>Coordination Email</strong>
                  <p>placements@placementpulse.edu</p>
                </div>
              </div>

              <div className="info-row">
                <Phone size={18} className="info-icon text-indigo" />
                <div>
                  <strong>Officer Hotline</strong>
                  <p>+91 (080) 2894-2200 / +91 98765 43210</p>
                </div>
              </div>

              <div className="info-row">
                <Clock size={18} className="info-icon text-indigo" />
                <div>
                  <strong>Office Hours</strong>
                  <p>Monday – Friday: 09:00 AM – 05:30 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Recruiter Enquiry Form */}
          <div className="modal-form-panel">
            <h4 className="panel-title">Recruiter Inquiry Desk</h4>
            <p className="panel-desc">
              Schedule campus interview slots, request candidate batches, or coordinate tests.
            </p>

            {submitted ? (
              <div className="contact-success-state">
                <CheckCircle2 size={36} className="text-emerald" />
                <h5>Inquiry Received!</h5>
                <p>A placement coordination officer will respond to your corporate email within 2 business hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="modal-input"
                    placeholder="e.g. Talent Acquisition Lead"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Organization</label>
                    <input
                      type="text"
                      required
                      className="modal-input"
                      placeholder="e.g. Google India"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Work Email</label>
                    <input
                      type="email"
                      required
                      className="modal-input"
                      placeholder="hr@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Inquiry Details</label>
                  <textarea
                    required
                    rows="3"
                    className="modal-textarea"
                    placeholder="Briefly state target batch, roles, or drive date requirements..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="contact-submit-btn">
                  <Send size={15} />
                  <span>Send Recruitment Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
