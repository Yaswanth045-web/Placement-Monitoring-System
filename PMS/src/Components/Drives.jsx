import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Award,
  ChevronRight,
  Send,
  MapPin,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { getAuthHeaders, getAuthToken, loginUser, SEED_ADMIN } from '../utils/authService';
import '../Styles/Drives.css';

export default function Drives({
  currentUser,
  applications = [],
  setApplications,
  students = [],
  companies = [],
  onNavigate,
}) {
  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [applySuccessMsg, setApplySuccessMsg] = useState('');

  const [newDrive, setNewDrive] = useState({
    companyName: '',
    role: '',
    packageCtc: '14 LPA',
    location: 'Bangalore / Hybrid',
    driveDate: 'Nov 20, 2026',
    deadline: 'Nov 16, 2026',
    minCgpa: '7.5',
    branches: 'CSE, IT, ECE',
    rounds: 'Online Coding Test, Technical Interview, HR Interview',
    description: 'Recruitment drive for engineering graduates.',
    status: 'Active',
  });

  // Fetch drives from backend API (MongoDB Atlas)
  async function fetchDrives() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(API_ENDPOINTS.drives);
      const result = await res.json();
      if (res.ok && result.data) {
        setDrives(result.data);
      } else {
        // Fallback default sample drives
        loadFallbackDrives();
      }
    } catch {
      loadFallbackDrives();
    } finally {
      setLoading(false);
    }
  }

  function loadFallbackDrives() {
    const fallback = [
      {
        _id: 'drv-001',
        companyName: 'Google India',
        role: 'Software Development Engineer',
        packageCtc: '32 LPA',
        location: 'Bangalore / Hyderabad',
        driveDate: 'Nov 18, 2026',
        deadline: 'Nov 14, 2026',
        minCgpa: '8.0',
        branches: ['CSE', 'IT'],
        rounds: ['Online Assessment', 'Data Structures & Algorithms', 'System Design', 'Googliness'],
        description: 'Core engineering drive for cloud-native distributed infrastructure and web services.',
        status: 'Active',
      },
      {
        _id: 'drv-002',
        companyName: 'Microsoft',
        role: 'Cloud Solution Associate',
        packageCtc: '26 LPA',
        location: 'Hyderabad / Hybrid',
        driveDate: 'Nov 22, 2026',
        deadline: 'Nov 17, 2026',
        minCgpa: '7.5',
        branches: ['CSE', 'ECE', 'IT'],
        rounds: ['Technical Online Test', 'Live Problem Solving', 'Partner Interview'],
        description: 'Azure enterprise cloud computing and intelligent software engineering drive.',
        status: 'Active',
      },
      {
        _id: 'drv-003',
        companyName: 'Amazon',
        role: 'Associate SDE-1',
        packageCtc: '28 LPA',
        location: 'Bangalore / Chennai',
        driveDate: 'Nov 26, 2026',
        deadline: 'Nov 20, 2026',
        minCgpa: '7.0',
        branches: ['CSE', 'ECE', 'IT', 'MECH'],
        rounds: ['Online Assessment (OA1 & OA2)', 'Technical Round 1', 'Bar Raiser Round'],
        description: 'Hiring for AWS and consumer retail logistics platform teams.',
        status: 'Active',
      },
      {
        _id: 'drv-004',
        companyName: 'Adobe',
        role: 'Member of Technical Staff',
        packageCtc: '24 LPA',
        location: 'Noida / Bangalore',
        driveDate: 'Dec 02, 2026',
        deadline: 'Nov 25, 2026',
        minCgpa: '7.8',
        branches: ['CSE', 'IT'],
        rounds: ['Aptitude & DSA Online Test', 'Problem Solving Round', 'Engineering Director Round'],
        description: 'Digital Media and Creative Cloud engineering recruitment drive.',
        status: 'Upcoming',
      },
    ];
    setDrives(fallback);
  }

  useEffect(() => {
    fetchDrives();
  }, []);

  // Post new drive (Admin)
  async function handleCreateDrive(e) {
    e.preventDefault();
    setError('');

    if (!newDrive.companyName.trim() || !newDrive.role.trim()) {
      setError('Company name and role are required.');
      return;
    }

    try {
      const branchesArr = newDrive.branches.split(',').map((b) => b.trim()).filter(Boolean);
      const roundsArr = newDrive.rounds.split(',').map((r) => r.trim()).filter(Boolean);

      const payload = {
        ...newDrive,
        branches: branchesArr,
        rounds: roundsArr,
      };

      const res = await fetch(API_ENDPOINTS.drives, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.data) {
        setDrives([result.data, ...drives]);
      } else {
        // Local state fallback
        const localDrive = {
          _id: `drv-${Date.now()}`,
          ...payload,
        };
        setDrives([localDrive, ...drives]);
      }

      setShowAddModal(false);
      setNewDrive({
        companyName: '',
        role: '',
        packageCtc: '14 LPA',
        location: 'Bangalore / Hybrid',
        driveDate: 'Nov 20, 2026',
        deadline: 'Nov 16, 2026',
        minCgpa: '7.5',
        branches: 'CSE, IT, ECE',
        rounds: 'Online Coding Test, Technical Interview, HR Interview',
        description: 'Recruitment drive for engineering graduates.',
        status: 'Active',
      });
    } catch {
      setError('Unable to save drive to backend.');
    }
  }

  // Delete drive
  async function handleDeleteDrive(id) {
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to delete this recruitment drive?')) return;

    try {
      await fetch(`${API_ENDPOINTS.drives}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setDrives(drives.filter((d) => (d._id || d.id) !== id));
    } catch {
      setDrives(drives.filter((d) => (d._id || d.id) !== id));
    }
  }

  // Direct Apply to Drive for Students
  async function handleApplyToDrive(drive) {
    if (!currentUser) {
      if (onNavigate) onNavigate('Login');
      return;
    }

    setApplyingId(drive._id || drive.id);
    setError('');

    // Check if already applied
    const alreadyApplied = applications.some(
      (app) =>
        (app.studentName === currentUser.name || app.studentId === currentUser.id) &&
        app.companyName.toLowerCase() === drive.companyName.toLowerCase()
    );

    if (alreadyApplied) {
      setApplySuccessMsg(`You have already registered for ${drive.companyName}'s drive!`);
      setApplyingId(null);
      setTimeout(() => setApplySuccessMsg(''), 3000);
      return;
    }

    try {
      const payload = {
        studentId: String(currentUser.id || currentUser._id || 'stu-curr'),
        studentName: currentUser.name || 'Student Candidate',
        companyId: String(drive._id || drive.id),
        companyName: drive.companyName,
        role: drive.role,
      };

      const res = await fetch(API_ENDPOINTS.applications, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      const newApp = res.ok && result.data ? result.data : { ...payload, _id: `app-${Date.now()}`, status: 'Applied', appliedAt: new Date().toISOString() };

      if (setApplications) {
        setApplications((prev) => [newApp, ...prev]);
      }

      setApplySuccessMsg(`Application confirmed for ${drive.companyName} (${drive.role})!`);
      setTimeout(() => setApplySuccessMsg(''), 4000);
    } catch {
      setApplySuccessMsg(`Application registered for ${drive.companyName}!`);
      setTimeout(() => setApplySuccessMsg(''), 4000);
    } finally {
      setApplyingId(null);
    }
  }

  // Check if current user has applied to a given drive
  const isApplied = (drive) => {
    if (!currentUser) return false;
    return applications.some(
      (app) =>
        (app.studentName === currentUser.name || app.studentId === currentUser.id) &&
        app.companyName.toLowerCase() === drive.companyName.toLowerCase()
    );
  };

  // Filter drives
  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      const matchSearch =
        (d.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.location || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchBranch =
        branchFilter === 'ALL' ||
        (d.branches || []).some((b) => b.toUpperCase() === branchFilter.toUpperCase());

      const matchStatus =
        statusFilter === 'ALL' ||
        (d.status || 'Active').toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchBranch && matchStatus;
    });
  }, [drives, searchTerm, branchFilter, statusFilter]);

  const branches = ['ALL', 'CSE', 'ECE', 'IT', 'MECH', 'CIVIL'];

  return (
    <div className="modern-management-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Campus Recruitment Drives</h1>
          <p className="page-sub-title">
            Browse upcoming hiring drives, package CTCs, eligibility criteria, and register.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-action-btn"
            onClick={fetchDrives}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              className="primary-action-btn"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              <span>Post New Drive</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {applySuccessMsg && (
        <div className="drives-success-banner">
          <CheckCircle2 size={16} />
          <span>{applySuccessMsg}</span>
        </div>
      )}

      {error && (
        <div className="page-alert-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-controls-card">
        <div className="search-input-box">
          <Search size={17} className="search-box-icon" />
          <input
            type="text"
            className="clean-search-field"
            placeholder="Search drives by recruiter, role, or location..."
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
            <span className="select-label">Eligible Branch:</span>
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
              <option value="ALL">All Drives</option>
              <option value="Active">Active Registration</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drives Grid */}
      <div className="drives-grid-layout">
        {filteredDrives.length === 0 ? (
          <div className="empty-results-box" style={{ gridColumn: '1 / -1' }}>
            <Briefcase size={40} className="empty-icon" />
            <p className="empty-title">No recruitment drives found</p>
            <p className="empty-desc">Check back soon for upcoming campus drives.</p>
          </div>
        ) : (
          filteredDrives.map((drive) => {
            const hasApplied = isApplied(drive);
            const initial = (drive.companyName || 'C')[0].toUpperCase();
            const packageVal = drive.packageCtc || '12 LPA';
            const isDream = parseFloat(packageVal) >= 20;

            return (
              <div key={drive._id || drive.id} className="drive-card">
                {/* Top Section */}
                <div className="drive-card-header">
                  <div className="drive-brand-row">
                    <div className="drive-logo-avatar">{initial}</div>
                    <div className="drive-meta-col">
                      <h3 className="drive-company-name">{drive.companyName}</h3>
                      <span className="drive-role-title">{drive.role}</span>
                    </div>
                  </div>

                  <div className="drive-ctc-pill-wrap">
                    <span className={`ctc-tag ${isDream ? 'dream-ctc' : 'standard-ctc'}`}>
                      {drive.packageCtc}
                    </span>
                    {isDream && (
                      <span className="dream-badge">
                        <Sparkles size={11} />
                        <span>Dream</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Details */}
                <div className="drive-details-stack">
                  <div className="drive-meta-item">
                    <MapPin size={14} className="meta-icon" />
                    <span>{drive.location || 'Bangalore / Hybrid'}</span>
                  </div>
                  <div className="drive-meta-item">
                    <Calendar size={14} className="meta-icon" />
                    <span>Drive Date: <strong>{drive.driveDate}</strong></span>
                  </div>
                  <div className="drive-meta-item">
                    <Clock size={14} className="meta-icon" />
                    <span>Apply By: <strong style={{ color: '#ef4444' }}>{drive.deadline}</strong></span>
                  </div>
                </div>

                {/* Eligibility & Branches */}
                <div className="drive-criteria-box">
                  <div className="criteria-row">
                    <span className="criteria-label">Min CGPA:</span>
                    <span className="criteria-value">{drive.minCgpa || '7.5'}</span>
                  </div>
                  <div className="criteria-row">
                    <span className="criteria-label">Branches:</span>
                    <div className="branches-tag-wrap">
                      {(drive.branches || ['CSE', 'IT']).map((b) => (
                        <span key={b} className="branch-micro-tag">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selection Rounds */}
                <div className="drive-rounds-list">
                  <span className="rounds-label">Hiring Stages:</span>
                  <div className="rounds-pill-wrap">
                    {(drive.rounds || ['Online Test', 'Technical', 'HR']).map((round, idx) => (
                      <span key={round} className="round-pill">
                        {idx + 1}. {round}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="drive-card-footer">
                  {isAdmin ? (
                    <button
                      type="button"
                      className="delete-drive-btn"
                      onClick={() => handleDeleteDrive(drive._id || drive.id)}
                      title="Remove this drive"
                    >
                      <Trash2 size={15} />
                      <span>Remove Drive</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`apply-drive-btn ${hasApplied ? 'already-applied' : ''}`}
                      onClick={() => handleApplyToDrive(drive)}
                      disabled={hasApplied || applyingId === (drive._id || drive.id)}
                    >
                      {hasApplied ? (
                        <>
                          <CheckCircle2 size={15} />
                          <span>Application Submitted</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>{applyingId === (drive._id || drive.id) ? 'Registering...' : 'Register for Drive'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Post Drive Modal for Admins */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-card-header">
              <div className="modal-title-row">
                <Briefcase size={18} className="text-indigo" />
                <h3 className="modal-title">Announce Recruitment Drive</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="modal-form-body">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    required
                    className="modal-input"
                    placeholder="e.g. Google India"
                    value={newDrive.companyName}
                    onChange={(e) => setNewDrive({ ...newDrive, companyName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Position / Role</label>
                  <input
                    type="text"
                    required
                    className="modal-input"
                    placeholder="e.g. Software Engineer"
                    value={newDrive.role}
                    onChange={(e) => setNewDrive({ ...newDrive, role: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Salary Package (CTC)</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. 24 LPA"
                    value={newDrive.packageCtc}
                    onChange={(e) => setNewDrive({ ...newDrive, packageCtc: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Drive Location</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Bangalore / Virtual"
                    value={newDrive.location}
                    onChange={(e) => setNewDrive({ ...newDrive, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Drive Date</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Nov 24, 2026"
                    value={newDrive.driveDate}
                    onChange={(e) => setNewDrive({ ...newDrive, driveDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Registration Deadline</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Nov 19, 2026"
                    value={newDrive.deadline}
                    onChange={(e) => setNewDrive({ ...newDrive, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Minimum CGPA</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="7.5"
                    value={newDrive.minCgpa}
                    onChange={(e) => setNewDrive({ ...newDrive, minCgpa: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Eligible Branches (comma separated)</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="CSE, IT, ECE"
                    value={newDrive.branches}
                    onChange={(e) => setNewDrive({ ...newDrive, branches: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hiring Rounds (comma separated)</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Online Assessment, Technical Interview, HR Round"
                  value={newDrive.rounds}
                  onChange={(e) => setNewDrive({ ...newDrive, rounds: e.target.value })}
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
                <button type="submit" className="modal-submit-btn">
                  Publish Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
