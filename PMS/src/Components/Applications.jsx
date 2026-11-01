import React, { useEffect, useState, useMemo } from 'react';
import { FileText, Plus, Search, Trash2, Calendar, Building, User, Briefcase, RefreshCw, AlertCircle, ArrowUpRight } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { getAuthHeaders, getAuthToken } from '../utils/authService';
import '../Styles/Applications.css';

const API_URL = API_ENDPOINTS.applications;

export default function Applications({
  students = [],
  companies = [],
  applications = [],
  setApplications,
  onApplicationStatusChange,
  currentUser,
  onOpenAuth,
}) {
  const isAdmin = currentUser?.role === 'admin';
  const isStudent = !isAdmin;
  const [formData, setFormData] = useState({
    studentId: '',
    companyId: '',
    role: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  async function fetchApplications() {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to load applications');
      }

      setApplications(result.data || []);
    } catch (err) {
      setError(err.message || 'Unable to connect to backend server');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (applications.length === 0) {
      fetchApplications();
    }
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const student = students.find(
      (item) => String(item._id || item.id) === String(formData.studentId)
    );

    const company = companies.find(
      (item) => String(item._id || item.id) === String(formData.companyId)
    );

    if (!student || !company || !formData.role.trim()) {
      setError('Please select a student, a company, and specify the job role.');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          studentId: String(student._id || student.id),
          studentName: student.name,
          companyId: String(company._id || company.id),
          companyName: company.name,
          role: formData.role.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create application');
      }

      setApplications((prev) => [result.data, ...prev]);
      setFormData({
        studentId: '',
        companyId: '',
        role: '',
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err.message || 'Unable to save application');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(applicationId, newStatus) {
    setError('');

    if (!isAdmin) {
      setError('Administrator clearance required: Only Placement Officers can update application statuses.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError('Authentication token missing: Please sign in as an Administrator (admin@yaswanth.edu / admin123).');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    const previousApplications = applications;

    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) =>
        String(app._id || app.id) === String(applicationId)
          ? { ...app, status: newStatus }
          : app
      )
    );

    try {
      const response = await fetch(`${API_URL}/${applicationId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || (result.message && (result.message.includes('token') || result.message.includes('clearance')))) {
          throw new Error('Authentication required: Administrator clearance expired or missing. Please sign in as Administrator (admin@yaswanth.edu / admin123).');
        }
        throw new Error(result.message || 'Failed to update status');
      }

      setApplications((prev) =>
        prev.map((app) =>
          String(app._id || app.id) === String(applicationId)
            ? result.data
            : app
        )
      );

      // Student placement synchronization
      if (onApplicationStatusChange) {
        onApplicationStatusChange(applicationId, newStatus);
      }
    } catch (err) {
      setApplications(previousApplications);
      setError(err.message || 'Unable to update status');
    }
  }

  async function handleDelete(applicationId) {
    if (!isAdmin) {
      setError('Administrator clearance required: Only Placement Officers can delete recruitment applications.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError('Authentication token missing: Please sign in as an Administrator (admin@yaswanth.edu / admin123).');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!window.confirm('Delete this application record from the recruitment pipeline?')) {
      return;
    }

    setError('');
    try {
      const response = await fetch(`${API_URL}/${applicationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || (result.message && (result.message.includes('token') || result.message.includes('clearance')))) {
          throw new Error('Authentication required: Administrator clearance expired or missing. Please sign in as Administrator (admin@yaswanth.edu / admin123).');
        }
        throw new Error(result.message || 'Failed to delete application');
      }

      setApplications((prev) =>
        prev.filter((app) => String(app._id || app.id) !== String(applicationId))
      );
    } catch (err) {
      setError(err.message || 'Unable to delete application');
    }
  }

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        (app.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.role || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  return (
    <div className="management-page-container">
      {/* Header */}
      <div className="management-header-row">
        <div>
          <div className="mgmt-badge">RECRUITMENT PIPELINE // MODULE 04</div>
          <h2 className="mgmt-title">APPLICATIONS MANAGEMENT</h2>
          <p className="mgmt-subtitle">
            Track student application submissions, interview rounds, and selection offers.
          </p>
        </div>

        <div className="mgmt-actions-group">
          <button
            type="button"
            className="btn-steel btn-sm"
            onClick={fetchApplications}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            <span>REFRESH</span>
          </button>

          <button
            type="button"
            className="btn-rust btn-sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={16} />
            <span>
              {showAddForm
                ? 'CLOSE FORM'
                : isStudent
                ? '+ APPLY TO DRIVE'
                : '+ NEW APPLICATION'}
            </span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mgmt-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Add Application Form */}
      {showAddForm && (
        <section className="mgmt-form-card industrial-rivet-card">
          <div className="form-card-header">
            <h3 className="form-card-title">SUBMIT NEW CANDIDATE APPLICATION</h3>
            <span className="form-card-code">FORM // APP-PIPELINE</span>
          </div>

          <form className="student-grid-form" onSubmit={handleSubmit}>
            <div className="form-field-group">
              <label htmlFor="app-student-select">Select Candidate *</label>
              <select
                id="app-student-select"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Candidate --</option>
                {students.map((student) => (
                  <option
                    key={student._id || student.id}
                    value={student._id || student.id}
                  >
                    {student.name} ({student.branch || 'General'} • {student.email})
                  </option>
                ))}
              </select>
              {students.length === 0 && (
                <span className="field-hint-warn">No students registered. Please add a student first.</span>
              )}
            </div>

            <div className="form-field-group">
              <label htmlFor="app-company-select">Target Company *</label>
              <select
                id="app-company-select"
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Recruiter --</option>
                {companies.map((company) => (
                  <option
                    key={company._id || company.id}
                    value={company._id || company.id}
                  >
                    {company.name} ({company.industry || 'Tech'})
                  </option>
                ))}
              </select>
              {companies.length === 0 && (
                <span className="field-hint-warn">No companies registered. Please add a company first.</span>
              )}
            </div>

            <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="app-role-input">Job Role / Designation *</label>
              <input
                id="app-role-input"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Full Stack Developer, Systems Engineer, Analyst"
                required
              />
            </div>

            <div className="form-buttons-row">
              <button
                type="button"
                className="btn-steel btn-sm"
                onClick={() => setShowAddForm(false)}
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="btn-rust btn-sm"
                disabled={saving || students.length === 0 || companies.length === 0}
              >
                {saving ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="mgmt-filter-toolbar industrial-rivet-card">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by student, company, or job role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-selects-row">
          <div className="filter-item">
            <span className="filter-label">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="Applied">APPLIED</option>
              <option value="Interview">INTERVIEW</option>
              <option value="Selected">SELECTED</option>
              <option value="Rejected">REJECTED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <section className="mgmt-table-section industrial-rivet-card">
        <div className="table-header-row">
          <div className="table-count-badge">
            SHOWING <strong>{filteredApplications.length}</strong> OF <strong>{applications.length}</strong> PIPELINE APPLICATIONS
          </div>
        </div>

        {loading ? (
          <div className="mgmt-loading-state">
            <RefreshCw size={28} className="spin-icon" />
            <p>Loading application pipeline records from MongoDB Atlas...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="mgmt-empty-state">
            <FileText size={40} className="empty-state-icon" />
            <h4>NO APPLICATIONS LOGGED</h4>
            <p>
              {applications.length === 0
                ? 'No placement applications recorded yet. Click "+ New Application" above to begin tracking candidate interviews.'
                : 'No application records match your current search query.'}
            </p>
            {applications.length === 0 && (
              <button
                type="button"
                className="btn-rust btn-sm"
                onClick={() => setShowAddForm(true)}
              >
                + CREATE FIRST APPLICATION
              </button>
            )}
          </div>
        ) : (
          <div className="mgmt-table-wrapper">
            <table className="mgmt-data-table">
              <thead>
                <tr>
                  <th>CANDIDATE</th>
                  <th>RECRUITER</th>
                  <th>JOB ROLE</th>
                  <th>APPLIED DATE</th>
                  <th>STAGE STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => {
                  const appId = app._id || app.id;
                  return (
                    <tr key={appId}>
                      <td>
                        <div className="candidate-name-cell">
                          <div className="candidate-avatar">
                            {(app.studentName || 'S').charAt(0).toUpperCase()}
                          </div>
                          <span className="candidate-name">{app.studentName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="company-text">{app.companyName}</span>
                      </td>
                      <td>
                        <span className="role-text">{app.role}</span>
                      </td>
                      <td>
                        <span className="date-text">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Active'}
                        </span>
                      </td>
                      <td>
                        {!isStudent ? (
                          <select
                            className={`app-status-select select-${(app.status || 'applied').toLowerCase().replace(/\s+/g, '-')}`}
                            value={app.status || 'Applied'}
                            onChange={(e) => handleStatusChange(appId, e.target.value)}
                          >
                            <option value="Applied">Applied</option>
                            <option value="Interview">Interview</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        ) : (
                          <span className={`status-pill ${(app.status || 'applied').toLowerCase().replace(/\s+/g, '-')}`}>
                            {app.status || 'Applied'}
                          </span>
                        )}
                      </td>
                      <td>
                        {!isStudent ? (
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => handleDelete(appId)}
                            title="Delete application"
                          >
                            <Trash2 size={13} />
                            <span>DELETE</span>
                          </button>
                        ) : (
                          <span
                            style={{
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--dim-text)',
                              letterSpacing: '0.04em',
                            }}
                          >
                            VERIFIED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
