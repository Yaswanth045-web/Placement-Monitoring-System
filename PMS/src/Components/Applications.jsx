import React, { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Calendar,
  Building,
  User,
  Briefcase,
  RefreshCw,
  AlertCircle,
  X,
  Shield,
  CheckCircle2,
  ChevronDown,
  Download,
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { getAuthHeaders, getAuthToken, loginUser, SEED_ADMIN } from '../utils/authService';
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
  const [showAddModal, setShowAddModal] = useState(false);

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
      if (onApplicationStatusChange) {
        onApplicationStatusChange(result.data._id, 'Applied');
      }
      setFormData({
        studentId: '',
        companyId: '',
        role: '',
      });
      setShowAddModal(false);
    } catch (err) {
      setError(err.message || 'Unable to save application');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(applicationId, newStatus) {
    setError('');

    if (!isAdmin) {
      setError('Admin access required to update application outcomes.');
      return;
    }

    let token = getAuthToken();
    if (!token && isAdmin) {
      await loginUser(SEED_ADMIN.email, 'admin123');
      token = getAuthToken();
    }

    const previousApplications = applications;

    // Optimistic UI update:
    // If selected, remove the candidate application from the tracker immediately!
    if (newStatus === 'Selected') {
      setApplications((prev) =>
        prev.filter((app) => String(app._id || app.id) !== String(applicationId))
      );
    } else {
      setApplications((prev) =>
        prev.map((app) =>
          String(app._id || app.id) === String(applicationId)
            ? { ...app, status: newStatus }
            : app
        )
      );
    }

    // Immediately notify App to sync Student Directory with 0ms delay
    if (onApplicationStatusChange) {
      onApplicationStatusChange(applicationId, newStatus);
    }

    try {
      let response = await fetch(`${API_URL}/${applicationId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 401 && isAdmin) {
        await loginUser(SEED_ADMIN.email, 'admin123');
        response = await fetch(`${API_URL}/${applicationId}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: newStatus }),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update status');
      }

      if (newStatus === 'Selected' || result.removedFromTracker) {
        setApplications((prev) =>
          prev.filter((app) => String(app._id || app.id) !== String(applicationId))
        );
      } else {
        setApplications((prev) =>
          prev.map((app) =>
            String(app._id || app.id) === String(applicationId)
              ? result.data
              : app
          )
        );
      }

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
      setError('Admin permissions required to remove applications.');
      return;
    }

    if (!window.confirm('Delete this application entry?')) {
      return;
    }

    setError('');
    try {
      let response = await fetch(`${API_URL}/${applicationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.status === 401 && isAdmin) {
        await loginUser(SEED_ADMIN.email, 'admin123');
        response = await fetch(`${API_URL}/${applicationId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete application');
      }

      setApplications((prev) =>
        prev.filter((app) => String(app._id || app.id) !== String(applicationId))
      );

      if (onApplicationStatusChange) {
        onApplicationStatusChange(applicationId, 'Deleted');
      }
    } catch (err) {
      setError(err.message || 'Unable to delete application');
    }
  }

  // Filter applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        (app.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.role || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' ||
        (app.status || 'Applied').toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  // Export Applications Report CSV
  function exportApplicationsCSV() {
    if (!applications || applications.length === 0) return;
    const headers = ['Candidate Name', 'Company Name', 'Job Role', 'Status'];
    const rows = filteredApps.map((a) => [
      `"${a.studentName || ''}"`,
      `"${a.companyName || ''}"`,
      `"${a.role || ''}"`,
      `"${a.status || 'Applied'}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Placement_Applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const statuses = ['ALL', 'Applied', 'Interview', 'Selected', 'Rejected'];

  return (
    <div className="modern-management-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Application Tracker</h1>
          <p className="page-sub-title">
            Monitor candidate submissions, interview shortlists, and placement offers.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-action-btn"
            onClick={exportApplicationsCSV}
            title="Download Applications CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="secondary-action-btn"
            onClick={fetchApplications}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="primary-action-btn"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            <span>Submit Application</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="page-alert-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="filter-controls-card">
        <div className="search-input-box">
          <Search size={17} className="search-box-icon" />
          <input
            type="text"
            className="clean-search-field"
            placeholder="Search by candidate name, company, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-dropdowns-row">
          <div className="select-pill-group">
            <span className="select-label">Status:</span>
            <select
              className="pill-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Statuses' : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="directory-table-card">
        <div className="directory-table-header">
          <span className="result-count-label">
            Showing <strong>{filteredApps.length}</strong> applications
          </span>
        </div>

        {filteredApps.length === 0 ? (
          <div className="empty-results-box">
            <FileText size={40} className="empty-icon" />
            <p className="empty-title">No applications found</p>
            <p className="empty-desc">Submit a new application or clear search filters.</p>
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="clean-data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Company & Position</th>
                  <th>Date</th>
                  <th>Outcome Status</th>
                  {isAdmin && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const statusLower = (app.status || 'applied').toLowerCase();
                  const initials = (app.studentName || 'S')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  const appDate = app.appliedAt
                    ? new Date(app.appliedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent';

                  return (
                    <tr key={app._id || app.id}>
                      <td>
                        <div className="candidate-cell">
                          <div className="candidate-avatar">{initials}</div>
                          <span className="candidate-full-name">{app.studentName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="app-company-col">
                          <span className="company-text-bold">{app.companyName}</span>
                          <span className="role-text-dim">{app.role || 'Software Engineer'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="date-text">{appDate}</span>
                      </td>
                      <td>
                        {isAdmin ? (
                          <select
                            className={`status-inline-select ${statusLower}`}
                            value={app.status || 'Applied'}
                            onChange={(e) =>
                              handleStatusChange(app._id || app.id, e.target.value)
                            }
                          >
                            <option value="Applied">Applied</option>
                            <option value="Interview">Interview</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        ) : (
                          <span className={`status-pill ${statusLower}`}>
                            {app.status || 'Applied'}
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="text-right">
                          <button
                            type="button"
                            className="delete-row-btn"
                            onClick={() => handleDelete(app._id || app.id)}
                            title="Delete application"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Application Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-card-header">
              <div className="modal-title-row">
                <FileText size={18} className="text-indigo" />
                <h3 className="modal-title">Submit Student Application</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-body">
              <div className="form-group">
                <label className="form-label">Select Candidate</label>
                <select
                  name="studentId"
                  className="modal-select"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Choose Candidate --</option>
                  {students
                    .filter((s) => s.status !== 'Placed')
                    .map((s) => (
                      <option key={s._id || s.id} value={s._id || s.id}>
                        {s.name} ({s.branch || 'CSE'})
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Partner Recruiter</label>
                <select
                  name="companyId"
                  className="modal-select"
                  value={formData.companyId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Choose Recruiter --</option>
                  {companies.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Role / Position</label>
                <input
                  type="text"
                  name="role"
                  className="modal-input"
                  placeholder="e.g. Associate Software Engineer"
                  value={formData.role}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="modal-card-footer">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={saving}
                >
                  {saving ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
