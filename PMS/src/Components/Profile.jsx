import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Mail, Phone, Building, Edit3, Check, X, Info, GraduationCap, Award, BookOpen, Code, FileText } from 'lucide-react';
import { updateUserProfile, getStoredUser } from '../utils/authService';
import '../Styles/Profile.css';

export default function Profile({ currentUser, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [saving, setSaving] = useState(false);

  // Active user (student or admin)
  const user = currentUser || getStoredUser();
  const isStudent = user?.role === 'student';

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
    roleTitle: user?.role === 'admin' ? (user?.roleTitle || 'Head of Campus Placement Operations') : 'Student Candidate',
    officerId: user?.officerId || 'YP-ADM-2026-X01',
    clearance: user?.clearance || 'LEVEL-4 // FULL ADMIN PRIVILEGES',
  });

  // Sync form when user changes
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
        roleTitle: user.role === 'admin' ? (user.roleTitle || 'Head of Campus Placement Operations') : 'Student Candidate',
        officerId: user.officerId || 'YP-ADM-2026-X01',
        clearance: user.clearance || 'LEVEL-4 // FULL ADMIN PRIVILEGES',
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

  function handleEdit() {
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
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

  return (
    <div className="management-page-container">
      {/* Header */}
      <div className="management-header-row">
        <div>
          <div className="mgmt-badge mono">
            {isStudent ? 'STUDENT DOSSIER // MODULE 05' : 'SECURITY CREDENTIALS // MODULE 05'}
          </div>
          <h2 className="mgmt-title">
            {isStudent ? 'STUDENT PROFILE & ACADEMIC RESUME' : 'ADMINISTRATOR PROFILE'}
          </h2>
          <p className="mgmt-subtitle">
            {isStudent
              ? 'Manage your personal candidate information, academic qualifications, and technical skill credentials.'
              : 'Placement officer credentials, system clearance, and institutional coordination identity.'}
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className="btn-rust btn-sm"
            onClick={handleEdit}
          >
            <Edit3 size={15} />
            <span>{isStudent ? 'EDIT MY PROFILE' : 'EDIT CREDENTIALS'}</span>
          </button>
        )}
      </div>

      {saveToast && (
        <div className="profile-toast-success" role="alert">
          <Check size={16} />
          <span>Profile updated successfully! Changes saved across system sessions.</span>
        </div>
      )}

      {/* Main Profile Layout */}
      <div className="profile-layout-grid">
        <div className="profile-credential-badge industrial-rivet-card">
          <div className="badge-hazard-strip" />

          {/* Top Section */}
          <div className="badge-top-section">
            <div className="badge-avatar-frame">
              <span className="badge-avatar-letter">
                {(user?.name || (isStudent ? 'S' : 'A')).charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="badge-meta-lockup">
              <span className="officer-id-tag mono">
                {isStudent ? (user?.rollNo || 'YP-2026-CS101') : (user?.officerId || 'YP-ADM-2026-X01')}
              </span>
              <h3 className="officer-name">{user?.name || (isStudent ? 'Student Candidate' : 'Placement Admin')}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span className="officer-role-title">
                  {isStudent ? `Student Candidate // ${user?.branch || 'CSE'}` : (user?.department || 'Head of Placement Operations')}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: '2px',
                    background: isStudent ? 'rgba(255, 138, 61, 0.15)' : 'rgba(20, 20, 20, 0.12)',
                    color: isStudent ? '#ff8a3d' : '#141414',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                  }}
                >
                  {isStudent ? 'STUDENT ROLE' : 'ADMIN ROLE'}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="badge-details-grid">
            <div className="detail-item">
              <span className="detail-label">OFFICIAL EMAIL</span>
              <div className="detail-val-row">
                <Mail size={14} className="detail-icon" />
                <span className="detail-value">{user?.email || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-label">{isStudent ? 'ACADEMIC BRANCH' : 'CAMPUS DEPARTMENT'}</span>
              <div className="detail-val-row">
                {isStudent ? <GraduationCap size={14} className="detail-icon" /> : <Building size={14} className="detail-icon" />}
                <span className="detail-value">{isStudent ? (user?.branch || 'CSE') : (user?.department || 'Placement Cell')}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-label">HOTLINE CONTACT</span>
              <div className="detail-val-row">
                <Phone size={14} className="detail-icon" />
                <span className="detail-value">{user?.phone || '+91 98765 43210'}</span>
              </div>
            </div>

            {isStudent ? (
              <div className="detail-item">
                <span className="detail-label">ACADEMIC CGPA</span>
                <div className="detail-val-row">
                  <Award size={14} className="detail-icon" style={{ color: '#ff8a3d' }} />
                  <span className="detail-value" style={{ fontWeight: 600, color: '#ff8a3d' }}>
                    {user?.cgpa || '8.5'} / 10.0
                  </span>
                </div>
              </div>
            ) : (
              <div className="detail-item">
                <span className="detail-label">SYSTEM CLEARANCE</span>
                <div className="detail-val-row">
                  <Shield size={14} className="detail-icon clearance-icon" />
                  <span className="detail-value clearance-val">{user?.clearance || 'LEVEL-4 // FULL ADMIN'}</span>
                </div>
              </div>
            )}

            {isStudent && (
              <>
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">TECHNICAL SKILLS & COMPETENCIES</span>
                  <div className="detail-val-row" style={{ marginTop: '4px' }}>
                    <Code size={14} className="detail-icon" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(user?.skills || 'React, Node.js, Python, DSA')
                        .split(',')
                        .map((s, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              background: 'var(--bg)',
                              border: '1px solid var(--paper-border)',
                              padding: '2px 8px',
                              borderRadius: '3px',
                            }}
                          >
                            {s.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">CANDIDATE BIO & CAREER GOALS</span>
                  <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.5 }}>
                    {user?.bio || 'Enthusiastic student dedicated to building high performance applications.'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Student Status & Notice Box */}
          <div className="persistence-notice-box">
            <Info size={16} className="notice-icon" />
            <p className="notice-text">
              <strong>Role Access Status:</strong> {isStudent
                ? 'Logged in with Student privileges. You can edit your personal candidate profile and view all company placement drives. Modifying company directories or student databases is restricted to Placement Administrators.'
                : 'Logged in with Full Administrative privileges. You can add/edit companies, candidates, and manage the complete placement drive pipeline.'}
            </p>
          </div>
        </div>

        {/* Edit Form (if editing) */}
        {isEditing && (
          <div className="profile-edit-panel industrial-rivet-card">
            <div className="form-card-header">
              <h3 className="form-card-title">
                {isStudent ? 'EDIT STUDENT PROFILE' : 'UPDATE OFFICER IDENTITY'}
              </h3>
              <span className="form-card-code mono">
                {isStudent ? 'STUDENT // EDIT MODE' : 'ADMIN // CREDENTIALS EDIT'}
              </span>
            </div>

            <form onSubmit={handleSave} className="profile-edit-form">
              <div className="form-field-group">
                <label htmlFor="prof-name">{isStudent ? 'Full Name *' : 'Officer Name *'}</label>
                <input
                  id="prof-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="prof-email">Email Address *</label>
                <input
                  id="prof-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="prof-phone">Phone Contact</label>
                <input
                  id="prof-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {isStudent ? (
                <>
                  <div className="form-field-group">
                    <label htmlFor="prof-branch">Academic Branch</label>
                    <select
                      id="prof-branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                    >
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="ECE">Electronics & Communication (ECE)</option>
                      <option value="IT">Information Technology (IT)</option>
                      <option value="ME">Mechanical Engineering (ME)</option>
                      <option value="CE">Civil Engineering (CE)</option>
                      <option value="AIML">AI & Machine Learning</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="prof-roll">Roll Number / USN</label>
                    <input
                      id="prof-roll"
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="prof-cgpa">CGPA (0 - 10)</label>
                    <input
                      id="prof-cgpa"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-field-group" style={{ gridColumn: 'span 2' }}>
                    <label htmlFor="prof-skills">Technical Skills (comma-separated)</label>
                    <input
                      id="prof-skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g. React, Node.js, Python, DSA, SQL"
                    />
                  </div>

                  <div className="form-field-group" style={{ gridColumn: 'span 2' }}>
                    <label htmlFor="prof-bio">Bio / Summary</label>
                    <textarea
                      id="prof-bio"
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleChange}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--bg)',
                        border: '1px solid var(--paper-border)',
                        borderRadius: '3px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '13.5px',
                        color: 'var(--text)',
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-field-group">
                    <label htmlFor="prof-dept">Department</label>
                    <input
                      id="prof-dept"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="prof-role">Designation / Role Title</label>
                    <input
                      id="prof-role"
                      name="roleTitle"
                      value={formData.roleTitle}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <div className="form-buttons-row" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-steel btn-sm"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X size={14} />
                  <span>CANCEL</span>
                </button>
                <button
                  type="submit"
                  className="btn-rust btn-sm"
                  disabled={saving}
                >
                  <Check size={14} />
                  <span>{saving ? 'SAVING...' : 'SAVE CHANGES'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
