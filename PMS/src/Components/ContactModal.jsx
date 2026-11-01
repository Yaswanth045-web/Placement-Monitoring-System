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
        className="contact-modal-window industrial-rivet-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <div className="hazard-accent-strip" />

        <div className="modal-header-bar">
          <div>
            <span className="modal-badge-code">CAMPUS PLACEMENT CELL // DIRECT DESK</span>
            <h3 id="contact-modal-title" className="modal-headline">
              CONNECT WITH PLACEMENTPULSE
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-grid">
          {/* Left Column: Office Contacts */}
          <div className="modal-info-panel">
            <h4 className="panel-title">CENTRAL PLACEMENT OFFICE</h4>
            <p className="panel-desc">
              Direct institutional coordination for corporate drives, campus hiring, and student placement assistance.
            </p>

            <div className="info-items-list">
              <div className="info-row">
                <MapPin size={18} className="info-icon" />
                <div>
                  <strong>Campus Location</strong>
                  <p>Tech Hub Level 4, Center for Career Planning & Placements, Main Campus</p>
                </div>
              </div>

              <div className="info-row">
                <Mail size={18} className="info-icon" />
                <div>
                  <strong>Recruiter Coordination Email</strong>
                  <p>placements@placementpulse.edu</p>
                </div>
              </div>

              <div className="info-row">
                <Phone size={18} className="info-icon" />
                <div>
                  <strong>Placement Officer Hotline</strong>
                  <p>+91 (080) 2894-2200 / +91 98765 43210</p>
                </div>
              </div>

              <div className="info-row">
                <Clock size={18} className="info-icon" />
                <div>
                  <strong>Administrative Hours</strong>
                  <p>Monday – Friday: 09:00 AM – 05:30 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Recruiter Enquiry Form */}
          <div className="modal-form-panel">
            <h4 className="panel-title">RECRUITER INQUIRY DESK</h4>
            <p className="panel-desc">
              Schedule a campus drive or request student batch qualification details.
            </p>

            {submitted ? (
              <div className="submission-success-banner" role="status">
                <CheckCircle2 size={36} className="success-icon" />
                <h4>INQUIRY LOGGED</h4>
                <p>Your dispatch has been registered. The placement officer will connect shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-direct-form">
                <div className="form-field-group">
                  <label htmlFor="contact-name">Your Name *</label>
                  <input
                    id="contact-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Priya Nair (HR Lead)"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="contact-comp">Company / Organization *</label>
                  <input
                    id="contact-comp"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="e.g. Amazon Web Services"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="contact-email">Corporate Email *</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. hiring@company.com"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="contact-msg">Hiring Requirements / Message</label>
                  <textarea
                    id="contact-msg"
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Target branches, roles, CTC range, or preferred drive dates..."
                  />
                </div>

                <button type="submit" className="btn-rust">
                  <Send size={16} />
                  <span>DISPATCH INQUIRY</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
