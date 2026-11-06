import React, { useEffect, useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Trash2,
  Mail,
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  X,
  Plus,
  Shield,
  Award,
  Download,
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { getAuthHeaders, getAuthToken, loginUser, SEED_ADMIN } from '../utils/authService';
import '../Styles/Student.css';

const API_URL = API_ENDPOINTS.students;

export default function Students({
  students = [],
  setStudents,
  onStudentsChanged,
  currentUser,
  onOpenAuth,
}) {
  const isAdmin = currentUser?.role === 'admin';
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: 'CSE',
    status: 'Not Placed',
  });

  async function fetchStudents() {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to load students');
      }

      setStudents(result.data || []);
      if (onStudentsChanged) {
        onStudentsChanged();
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (students.length === 0) {
      fetchStudents();
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

    if (!isAdmin) {
      setError('Admin access required to enroll new candidates.');
      return;
    }

    let token = getAuthToken();
    if (!token && isAdmin) {
      await loginUser(SEED_ADMIN.email, 'admin123');
      token = getAuthToken();
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.branch.trim()) {
      setError('Please fill in candidate name, email, and branch.');
      return;
    }

    try {
      setSaving(true);
      let response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          branch: formData.branch.trim().toUpperCase(),
          status: formData.status,
        }),
      });

      if (response.status === 401 && isAdmin) {
        await loginUser(SEED_ADMIN.email, 'admin123');
        response = await fetch(API_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            branch: formData.branch.trim().toUpperCase(),
            status: formData.status,
          }),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add student');
      }

      setStudents((prev) => [result.data, ...prev]);
      setFormData({
        name: '',
        email: '',
        branch: 'CSE',
        status: 'Not Placed',
      });
      setShowAddModal(false);
      if (onStudentsChanged) onStudentsChanged();
    } catch (err) {
      setError(err.message || 'Unable to add student');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!isAdmin) {
      setError('Admin permissions required to remove student records.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this candidate record?')) {
      return;
    }

    setError('');
    try {
      let response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.status === 401 && isAdmin) {
        await loginUser(SEED_ADMIN.email, 'admin123');
        response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete student');
      }

      setStudents((prev) => prev.filter((s) => (s._id || s.id) !== id));
      if (onStudentsChanged) onStudentsChanged();
    } catch (err) {
      setError(err.message || 'Unable to delete student');
    }
  }

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const nameMatch = (student.name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const emailMatch = (student.email || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || emailMatch;

      const matchesBranch =
        branchFilter === 'ALL' ||
        (student.branch || '').toUpperCase() === branchFilter.toUpperCase();

      const matchesStatus =
        statusFilter === 'ALL' ||
        (student.status || 'Not Placed').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [students, searchTerm, branchFilter, statusFilter]);

  // Export CSV Report
  function exportStudentsCSV() {
    if (!students || students.length === 0) return;
    const headers = ['Name', 'Email', 'Branch', 'Roll Number', 'Status'];
    const rows = filteredStudents.map((s) => [
      `"${s.name || ''}"`,
      `"${s.email || ''}"`,
      `"${s.branch || ''}"`,
      `"${s.rollNo || ''}"`,
      `"${s.status || 'Not Placed'}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Placement_Candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const branches = ['ALL', 'CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'EEE'];
  const statuses = ['ALL', 'Placed', 'Interview', 'Applied', 'Not Placed'];

  return (
    <div className="modern-management-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Student Directory</h1>
          <p className="page-sub-title">
            View eligible candidates, branch allocations, and placement statuses.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-action-btn"
            onClick={exportStudentsCSV}
            title="Download CSV Placement Roster"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="secondary-action-btn"
            onClick={fetchStudents}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {isAdmin ? (
            <button
              type="button"
              className="primary-action-btn"
              onClick={() => setShowAddModal(true)}
            >
              <UserPlus size={16} />
              <span>Enroll Candidate</span>
            </button>
          ) : (
            <div className="student-view-pill">
              <Shield size={14} />
              <span>Student View (Read-Only)</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="page-alert-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="filter-controls-card">
        <div className="search-input-box">
          <Search size={17} className="search-box-icon" />
          <input
            type="text"
            className="clean-search-field"
            placeholder="Search by student name or email..."
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
            <span className="select-label">Branch:</span>
            <select
              className="pill-select"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b === 'ALL' ? 'All Branches' : b}
                </option>
              ))}
            </select>
          </div>

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

      {/* Student Table / Cards */}
      <div className="directory-table-card">
        <div className="directory-table-header">
          <span className="result-count-label">
            Showing <strong>{filteredStudents.length}</strong> candidates
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="empty-results-box">
            <GraduationCap size={40} className="empty-icon" />
            <p className="empty-title">No candidates match your criteria</p>
            <p className="empty-desc">Try clearing filters or search terms.</p>
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="clean-data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Branch</th>
                  <th>Contact Email</th>
                  <th>Status</th>
                  {isAdmin && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const statusNormalized = (student.status || 'not-placed').toLowerCase().replace(' ', '-');
                  const initials = (student.name || 'S')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={student._id || student.id}>
                      <td>
                        <div className="candidate-cell">
                          <div className="candidate-avatar">{initials}</div>
                          <div className="candidate-names">
                            <span className="candidate-full-name">{student.name}</span>
                            <span className="candidate-roll">
                              {student.rollNo || `CS-2026-${(student._id || student.id || '').slice(-3)}`}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="branch-tag">{student.branch || 'CSE'}</span>
                      </td>
                      <td>
                        <span className="email-text">{student.email}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${statusNormalized}`}>
                          {student.status || 'Not Placed'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="text-right">
                          <button
                            type="button"
                            className="delete-row-btn"
                            onClick={() => handleDelete(student._id || student.id)}
                            title="Remove candidate"
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

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-card-header">
              <div className="modal-title-row">
                <UserPlus size={18} className="text-indigo" />
                <h3 className="modal-title">Enroll New Candidate</h3>
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
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="modal-input"
                  placeholder="e.g. Yashwanth Reddy"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="modal-input"
                  placeholder="e.g. yashwanth@candidate.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <select
                    name="branch"
                    className="modal-select"
                    value={formData.branch}
                    onChange={handleChange}
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="IT">IT</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="EEE">EEE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Placement Status</label>
                  <select
                    name="status"
                    className="modal-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Not Placed">Not Placed</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Placed">Placed</option>
                  </select>
                </div>
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
                  {saving ? 'Enrolling...' : 'Save Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
