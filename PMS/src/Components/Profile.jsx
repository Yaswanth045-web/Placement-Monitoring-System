import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Shield,
  Mail,
  Phone,
  Building,
  Edit3,
  Check,
  X,
  GraduationCap,
  Award,
  BookOpen,
  Code,
  FileText,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { updateUserProfile, getStoredUser } from '../utils/authService';
import '../Styles/Profile.css';

export default function Profile({ currentUser, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [saving, setSaving] = useState(false);

  const user = currentUser || getStoredUser();
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    branch: user?.branch || 'CSE',
    rollNo: user?.rollNo || '',
    cgpa: user?.cgpa || '8.5',
    bio: user?.bio || '',
    skills: user?.skills || '',
    department: user?.department || 'Career Development Cell',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        branch: user.branch || 'CSE',
        rollNo: user.rollNo || '',
        cgpa: user.cgpa || '8.5',
        bio: user.bio || '',
        skills: user.skills || '',
        department: user.department || 'Career Development Cell',
      });
    }
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);

    const updatePayload = {
      ...user,
      ...formData,
    };

    const res = await updateUserProfile(updatePayload);
    setSaving(false);
    setIsEditing(false);
    setSaveToast(true);

    if (onUpdateUser && res.user) {
      onUpdateUser(res.user);
    }

    setTimeout(() => setSaveToast(false), 3500);
  }


  const skillsList = (formData.skills || 'React.js, Node.js, Python, Data Structures, System Design')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const initials = (user?.name || (isStudent ? 'S' : 'A'))
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="modern-management-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">
            {isStudent ? 'Student Dossier' : 'Administrator Credentials'}
          </h1>
          <p className="page-sub-title">
            {isStudent
              ? 'Manage your academic qualifications, resume highlights, and placement readiness.'
              : 'Institutional coordination, operational clearance, and system administrative identity.'}
          </p>
        </div>

        <div className="page-header-actions">
          {!isEditing ? (
            <button
              type="button"
              className="primary-action-btn"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={15} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              type="button"
              className="secondary-action-btn"
              onClick={() => setIsEditing(false)}
            >
              <X size={15} />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {saveToast && (
        <div className="profile-toast-alert">
          <Check size={16} />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Main Profile Grid */}
      <div className="profile-grid-container">
        {/* Left Column: ID Card */}
        <div className="profile-user-summary-card">
          <div className="profile-avatar-wrap">
            <div className={`user-big-avatar ${isAdmin ? 'admin-bg' : 'student-bg'}`}>
              {initials}
            </div>
            <div className="profile-badge-pill">
              {isAdmin ? <Shield size={13} /> : <GraduationCap size={13} />}
              <span>{isAdmin ? 'Placement Officer' : 'Active Candidate'}</span>
            </div>
          </div>

          <h2 className="user-profile-heading">{user?.name || 'User Name'}</h2>
          <p className="user-profile-sub">{user?.email || 'email@example.com'}</p>

          <div className="profile-metrics-stack">
            {isStudent ? (
              <>
                <div className="metric-row">
                  <span className="metric-title">Branch</span>
                  <span className="metric-bold">{user?.branch || 'CSE'}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-title">Cumulative CGPA</span>
                  <span className="metric-bold text-indigo">{user?.cgpa || '8.5'} / 10.0</span>
                </div>
                <div className="metric-row">
                  <span className="metric-title">Roll ID</span>
                  <span className="metric-bold">{user?.rollNo || 'YP-2026-CS101'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="metric-row">
                  <span className="metric-title">Department</span>
                  <span className="metric-bold">{user?.department || 'Career Affairs'}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-title">Clearance</span>
                  <span className="metric-bold text-emerald">Full Operational Admin</span>
                </div>
                <div className="metric-row">
                  <span className="metric-title">Officer ID</span>
                  <span className="metric-bold">{user?.officerId || 'YP-ADM-2026-X01'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Info / Edit Form */}
        <div className="profile-details-card">
          {isEditing ? (
            <form onSubmit={handleSave} className="profile-edit-form">
              <h3 className="section-title">Edit Personal Details</h3>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Legal Name</label>
                  <input
                    type="text"
                    name="name"
                    className="modal-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="modal-input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {isStudent && (
                <div className="form-grid-3">
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
                    <label className="form-label">Roll Number</label>
                    <input
                      type="text"
                      name="rollNo"
                      className="modal-input"
                      value={formData.rollNo}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="10"
                      name="cgpa"
                      className="modal-input"
                      value={formData.cgpa}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Professional Summary / Bio</label>
                <textarea
                  name="bio"
                  rows="3"
                  className="modal-textarea"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Brief overview of your academic focus and career objectives..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Key Technical Skills (comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  className="modal-input"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. React.js, Python, System Design, SQL"
                />
              </div>

              <div className="form-save-actions">
                <button
                  type="button"
                  className="secondary-action-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-action-btn"
                  disabled={saving}
                >
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-view-content">
              {/* Bio Section */}
              <div className="info-block">
                <h3 className="section-title">Career Objective & Summary</h3>
                <p className="bio-paragraph">
                  {user?.bio ||
                    (isStudent
                      ? 'Final-year Computer Science candidate focused on cloud-native web engineering, distributed systems, and real-time frontend interfaces.'
                      : 'Placement Cell Officer responsible for corporate relations, campus drives, candidate eligibility auditing, and institutional placement benchmarks.')}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="info-block">
                <h3 className="section-title">Verified Core Competencies</h3>
                <div className="skills-badge-wrap">
                  {skillsList.map((skill) => (
                    <span key={skill} className="skill-pill">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact & Verification Info */}
              <div className="info-block">
                <h3 className="section-title">Institutional Coordinates</h3>
                <div className="coords-grid">
                  <div className="coord-card">
                    <Mail size={16} className="text-indigo" />
                    <div>
                      <span className="coord-label">Primary Email</span>
                      <span className="coord-val">{user?.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="coord-card">
                    <Phone size={16} className="text-indigo" />
                    <div>
                      <span className="coord-label">Contact Phone</span>
                      <span className="coord-val">{user?.phone || '+91 98765 43210'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
