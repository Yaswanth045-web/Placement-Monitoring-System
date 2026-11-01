import React, { useEffect, useState, useMemo } from 'react';
import { UserPlus, Search, Filter, Trash2, Mail, GraduationCap, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { getAuthHeaders } from '../utils/authService';
import '../Styles/Student.css';

const API_URL = API_ENDPOINTS.students;

export default function Students({ students = [], setStudents, onStudentsChanged, currentUser }) {
  const isStudent = currentUser?.role === 'student';
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: '',
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
    // Only fetch if empty
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

    if (!formData.name.trim() || !formData.email.trim() || !formData.branch.trim()) {
      setError('Please fill in student name, email, and branch.');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          branch: formData.branch.trim().toUpperCase(),
          status: formData.status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add student');
      }

      setStudents((prev) => [result.data, ...prev]);
      setFormData({
        name: '',
        email: '',
        branch: '',
        status: 'Not Placed',
      });
      setShowAddForm(false);
      if (onStudentsChanged) onStudentsChanged();
    } catch (err) {
      setError(err.message || 'Unable to add student');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this student record?')) {
      return;
    }

    setError('');
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete student');
      }

      setStudents((prev) => prev.filter((s) => s._id !== id));
      if (onStudentsChanged) onStudentsChanged();
    } catch (err) {
      setError(err.message || 'Unable to delete student');
    }
  }

  // Extract unique branches for filter
  const branchOptions = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      if (s.branch) set.add(s.branch.toUpperCase().trim());
    });
    return Array.from(set).sort();
  }, [students]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.branch || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBranch =
        branchFilter === 'ALL' ||
        (s.branch || '').toUpperCase().trim() === branchFilter;

      const matchesStatus =
        statusFilter === 'ALL' || s.status === statusFilter;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [students, searchTerm, branchFilter, statusFilter]);

  return (
    <div className="management-page-container">
      {/* Page Header */}
      <div className="management-header-row">
        <div>
          <div className="mgmt-badge">CANDIDATE REGISTRY // MODULE 02</div>
          <h2 className="mgmt-title">STUDENTS MANAGEMENT</h2>
          <p className="mgmt-subtitle">
            Manage student academic profiles, career tracking, and placement qualification.
          </p>
        </div>

        <div className="mgmt-actions-group">
          <button
            type="button"
            className="btn-steel btn-sm"
            onClick={fetchStudents}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            <span>REFRESH</span>
          </button>

          {!isStudent ? (
            <button
              type="button"
              className="btn-rust btn-sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <UserPlus size={16} />
              <span>{showAddForm ? 'CLOSE FORM' : '+ ADD STUDENT'}</span>
            </button>
          ) : (
            <div
              className="mgmt-role-tag mono"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                padding: '7px 12px',
                background: 'rgba(255, 138, 61, 0.1)',
                border: '1px solid rgba(255, 138, 61, 0.3)',
                borderRadius: '3px',
                color: '#ff8a3d',
                letterSpacing: '0.06em',
                fontWeight: 500,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff8a3d' }} />
              <span>STUDENT VIEW // READ-ONLY</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mgmt-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Add Student Section */}
      {!isStudent && showAddForm && (
        <section className="mgmt-form-card industrial-rivet-card">
          <div className="form-card-header">
            <h3 className="form-card-title">ENROLL NEW CANDIDATE</h3>
            <span className="form-card-code">FORM // STU-NEW</span>
          </div>

          <form className="student-grid-form" onSubmit={handleSubmit}>
            <div className="form-field-group">
              <label htmlFor="student-name">Full Name *</label>
              <input
                id="student-name"
                type="text"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field-group">
              <label htmlFor="student-email">Email Address *</label>
              <input
                id="student-email"
                type="email"
                name="email"
                placeholder="e.g. rahul@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field-group">
              <label htmlFor="student-branch">Department / Branch *</label>
              <input
                id="student-branch"
                type="text"
                name="branch"
                placeholder="e.g. CSE, ECE, MECH"
                value={formData.branch}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field-group">
              <label htmlFor="student-status">Placement Status</label>
              <select
                id="student-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Not Placed">Not Placed</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Placed">Placed</option>
              </select>
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
                disabled={saving}
              >
                {saving ? 'ENROLLING...' : 'ENROLL CANDIDATE'}
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
            placeholder="Search by candidate name, email, or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-selects-row">
          <div className="filter-item">
            <span className="filter-label">BRANCH:</span>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">ALL BRANCHES</option>
              {branchOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <span className="filter-label">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="Placed">PLACED</option>
              <option value="Interview">INTERVIEW</option>
              <option value="Applied">APPLIED</option>
              <option value="Not Placed">NOT PLACED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table & Counter */}
      <section className="mgmt-table-section industrial-rivet-card">
        <div className="table-header-row">
          <div className="table-count-badge">
            SHOWING <strong>{filteredStudents.length}</strong> OF <strong>{students.length}</strong> CANDIDATES
          </div>
        </div>

        {loading ? (
          <div className="mgmt-loading-state">
            <RefreshCw size={28} className="spin-icon" />
            <p>Loading candidate registry from MongoDB Atlas...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="mgmt-empty-state">
            <GraduationCap size={40} className="empty-state-icon" />
            <h4>NO CANDIDATE RECORDS FOUND</h4>
            <p>
              {students.length === 0
                ? 'No students enrolled yet. Use "+ Add Student" above to create your first candidate.'
                : 'No candidate records match your current search or filters.'}
            </p>
            {!isStudent && students.length === 0 && (
              <button
                type="button"
                className="btn-rust btn-sm"
                onClick={() => setShowAddForm(true)}
              >
                + ADD FIRST STUDENT
              </button>
            )}
          </div>
        ) : (
          <div className="mgmt-table-wrapper">
            <table className="mgmt-data-table">
              <thead>
                <tr>
                  <th>CANDIDATE</th>
                  <th>EMAIL</th>
                  <th>BRANCH</th>
                  <th>STATUS</th>
                  <th>{isStudent ? 'ENROLLMENT' : 'ACTIONS'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id || student.id}>
                    <td>
                      <div className="candidate-name-cell">
                        <div className="candidate-avatar">
                          {(student.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <span className="candidate-name">{student.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="email-cell">
                        <Mail size={13} className="cell-icon" />
                        <span>{student.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="branch-pill">{student.branch}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${(student.status || 'not-placed').toLowerCase().replace(/\s+/g, '-')}`}>
                        {student.status || 'Not Placed'}
                      </span>
                    </td>
                    <td>
                      {!isStudent ? (
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleDelete(student._id)}
                          title="Delete student"
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
                          ACTIVE CANDIDATE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
