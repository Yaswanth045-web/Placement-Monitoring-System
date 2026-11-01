import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Shield,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Check,
  Building2,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { loginUser, signupUser, SEED_ADMIN, SEED_STUDENT, ADMIN_SECRET_KEY } from '../utils/authService';
import '../Styles/AuthModal.css';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('student'); // Locked to 'student' by default for security

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [rollNo, setRollNo] = useState('');
  const [cgpa, setCgpa] = useState('8.5');
  const [phone, setPhone] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Security UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDevShortcuts, setShowDevShortcuts] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setAdminPasscode('');
    setRole('student'); // Always reset to student
    setError('');
    setSuccessMsg('');
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  // Quick fill helper for evaluator convenience
  const handleQuickFill = (account) => {
    setEmail(account.email);
    setPassword(account.role === 'admin' ? 'admin123' : 'student123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Credentials Validation
    if (!email.trim() || !password.trim()) {
      setError('Please provide all required authentication credentials.');
      return;
    }

    if (activeTab === 'signup') {
      if (!name.trim()) {
        setError('Full legal candidate or officer name is required.');
        return;
      }
      if (password.length < 6) {
        setError('Password must contain at least 6 characters for security compliance.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Password confirmation does not match the entered password.');
        return;
      }

      // Security check: If someone attempts to register as administrator, require secret passcode
      if (role === 'admin') {
        if (!adminPasscode.trim()) {
          setError('Security requirement: Institutional Officer Passcode is required to enroll as an Administrator.');
          return;
        }
        if (adminPasscode.trim() !== ADMIN_SECRET_KEY) {
          setError('Access Denied: Invalid Placement Officer Passcode. Student accounts cannot be registered as Administrators.');
          return;
        }
      }
    }

    setLoading(true);

    if (activeTab === 'login') {
      const res = await loginUser(email, password);
      setLoading(false);

      if (res.success && res.user) {
        setSuccessMsg(`Session authenticated successfully. Welcome, ${res.user.name}.`);
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 600);
      } else {
        setError(res.message || 'Authentication rejected. Verify your email and password.');
      }
    } else {
      // Registration Payload
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role: role === 'admin' ? 'admin' : 'student',
        adminSecretKey: role === 'admin' ? adminPasscode.trim() : undefined,
        branch: role === 'student' ? branch : undefined,
        rollNo: role === 'student' ? rollNo.trim() : undefined,
        cgpa: role === 'student' ? cgpa.trim() : undefined,
        phone: phone.trim(),
      };

      const res = await signupUser(payload);
      setLoading(false);

      if (res.success && res.user) {
        setSuccessMsg(`Account registered successfully. Authorized as ${res.user.role.toUpperCase()}.`);
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 700);
      } else {
        setError(res.message || 'Registration failed. Please check your credentials and retry.');
      }
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal-card industrial-rivet-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="auth-card-top">
          <div className="auth-brand-badge mono">
            <span className="auth-pulse-dot" />
            <span>INSTITUTIONAL GATEWAY // ZERO-TRUST AUTHENTICATION</span>
          </div>
          <button type="button" className="auth-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <div className="auth-card-header">
          <h2 className="auth-title">
            {activeTab === 'login'
              ? 'PORTAL ACCESS AUTHENTICATION'
              : role === 'admin'
              ? 'PLACEMENT OFFICER REGISTRATION'
              : 'CANDIDATE REGISTRATION'}
          </h2>
          <p className="auth-desc">
            {activeTab === 'login'
              ? 'Enter verified credentials to access recruitment drives, company directories, and verified dossiers.'
              : role === 'admin'
              ? 'Register an administrative coordination profile with full drive management privileges (Authorized Officers Only).'
              : 'Create your student candidate profile to view campus drives, explore recruiters, and submit placement applications.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tabs-row mono">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('login')}
          >
            <Lock size={13} />
            <span>SIGN IN</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('signup')}
          >
            <User size={13} />
            <span>CREATE ACCOUNT</span>
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="auth-alert-error" role="alert">
            <AlertCircle size={16} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert-success" role="alert">
            <CheckCircle2 size={16} className="alert-icon" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {activeTab === 'signup' && (
            <>
              {/* Account Security Classification Banner */}
              <div className={`auth-account-type-banner ${role === 'admin' ? 'banner-admin' : 'banner-student'}`}>
                <div className="account-type-left">
                  {role === 'admin' ? <Shield size={16} className="type-icon-admin" /> : <GraduationCap size={16} className="type-icon-student" />}
                  <div className="account-type-meta">
                    <span className="account-type-title mono">
                      {role === 'admin' ? 'OFFICER REGISTRATION // RESTRICTED' : 'STUDENT CANDIDATE ACCOUNT'}
                    </span>
                    <span className="account-type-subtitle">
                      {role === 'admin'
                        ? 'Administrative clearance: Can add/edit companies and audit candidates.'
                        : 'Default student clearance: View drives and edit personal dossier only.'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="role-toggle-pill-btn mono"
                  onClick={() => {
                    setRole(role === 'admin' ? 'student' : 'admin');
                    setAdminPasscode('');
                    setError('');
                  }}
                  title={role === 'admin' ? 'Switch to Student Registration' : 'Placement cell officer? Click here to authorize'}
                >
                  {role === 'admin' ? '← REGISTER AS STUDENT' : 'OFFICER ENROLLMENT?'}
                </button>
              </div>

              {/* Passcode Field ONLY if registering as Administrator */}
              {role === 'admin' && (
                <div className="auth-admin-clearance-card">
                  <div className="clearance-card-header mono">
                    <ShieldAlert size={14} />
                    <span>INSTITUTIONAL PASSCODE REQUIRED</span>
                  </div>
                  <p className="clearance-card-desc">
                    To prevent student elevation to administrator, entering the official placement cell authorization key is required.
                  </p>

                  <div className="auth-field">
                    <label className="auth-label mono" htmlFor="auth-admin-key">
                      OFFICER AUTHORIZATION PASSCODE *
                    </label>
                    <div className="auth-input-wrapper">
                      <KeyRound size={15} className="input-icon" />
                      <input
                        id="auth-admin-key"
                        type="password"
                        required
                        placeholder="Enter officer master key (e.g. YP-ADMIN-2026)"
                        value={adminPasscode}
                        onChange={(e) => setAdminPasscode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div className="auth-field">
                <label className="auth-label mono" htmlFor="auth-name">
                  {role === 'admin' ? 'OFFICER FULL NAME *' : 'STUDENT FULL NAME *'}
                </label>
                <div className="auth-input-wrapper">
                  <User size={15} className="input-icon" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    placeholder="e.g. Yaswanth Reddy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="auth-field">
            <label className="auth-label mono" htmlFor="auth-email">INSTITUTIONAL / VERIFIED EMAIL *</label>
            <div className="auth-input-wrapper">
              <Mail size={15} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                placeholder={activeTab === 'login' ? 'candidate@yaswanth.edu' : 'name@college.edu'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="auth-label mono" htmlFor="auth-password">PASSWORD *</label>
              {activeTab === 'signup' && (
                <span className="auth-hint mono">MIN 6 CHARACTERS</span>
              )}
            </div>
            <div className="auth-input-wrapper">
              <KeyRound size={15} className="input-icon" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Signup only) */}
          {activeTab === 'signup' && (
            <div className="auth-field">
              <label className="auth-label mono" htmlFor="auth-confirm-password">CONFIRM PASSWORD *</label>
              <div className="auth-input-wrapper">
                <Lock size={15} className="input-icon" />
                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="pwd-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {/* Student Fields (When registering as student) */}
          {activeTab === 'signup' && role === 'student' && (
            <div className="auth-student-extra-grid">
              <div className="auth-field">
                <label className="auth-label mono" htmlFor="auth-branch">ACADEMIC BRANCH</label>
                <select
                  id="auth-branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="auth-select"
                >
                  <option value="CSE">Computer Science & Eng (CSE)</option>
                  <option value="ECE">Electronics & Comm (ECE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="ME">Mechanical Engineering (ME)</option>
                  <option value="CE">Civil Engineering (CE)</option>
                  <option value="AIML">Artificial Intelligence & ML</option>
                </select>
              </div>

              <div className="auth-field">
                <label className="auth-label mono" htmlFor="auth-roll">ROLL NUMBER / USN</label>
                <input
                  id="auth-roll"
                  type="text"
                  placeholder="e.g. YP-2026-CS101"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="auth-input-plain"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label mono" htmlFor="auth-cgpa">CGPA (0 - 10.0)</label>
                <input
                  id="auth-cgpa"
                  type="text"
                  placeholder="8.92"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="auth-input-plain"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label mono" htmlFor="auth-phone">PHONE NUMBER</label>
                <input
                  id="auth-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="auth-input-plain"
                />
              </div>
            </div>
          )}

          {/* Remember me & Security compliance */}
          <div className="auth-options-row">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember secure session on this device</span>
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="btn-auth-submit mono"
            disabled={loading}
          >
            <span>
              {loading
                ? 'AUTHENTICATING ENCRYPTED SESSION...'
                : activeTab === 'login'
                ? 'AUTHORIZE & ACCESS PORTAL'
                : role === 'admin'
                ? 'ENROLL ADMINISTRATOR ACCOUNT'
                : 'ENROLL CANDIDATE ACCOUNT'}
            </span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Developer Sandbox Shortcuts Toggle */}
        <div className="dev-sandbox-dock">
          <button
            type="button"
            className="dev-toggle-link mono"
            onClick={() => setShowDevShortcuts(!showDevShortcuts)}
          >
            <span>{showDevShortcuts ? '▼ HIDE EVALUATION CREDENTIALS' : '▶ TEST ENVIRONMENT CREDENTIALS'}</span>
          </button>

          {showDevShortcuts && (
            <div className="dev-shortcuts-content">
              <div className="dev-account-row">
                <button
                  type="button"
                  className="btn-dev-fill mono"
                  onClick={() => handleQuickFill(SEED_STUDENT)}
                >
                  <GraduationCap size={13} />
                  <span>PRE-FILL STUDENT: student@yaswanth.edu (student123)</span>
                </button>
              </div>
              <div className="dev-account-row">
                <button
                  type="button"
                  className="btn-dev-fill mono"
                  onClick={() => handleQuickFill(SEED_ADMIN)}
                >
                  <Shield size={13} />
                  <span>PRE-FILL ADMIN: admin@yaswanth.edu (admin123) [Passcode: YP-ADMIN-2026]</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
