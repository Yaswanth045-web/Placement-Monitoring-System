import React, { useState } from 'react';
import {
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
  Sparkles,
  TrendingUp,
  ChevronRight,
  KeyRound,
  Check,
} from 'lucide-react';
import {
  loginUser,
  signupUser,
  ADMIN_SECRET_KEY,
  VALID_ADMIN_KEYS,
} from '../utils/authService';
import '../Styles/LoginPage.css';

export default function LoginPage({ onLoginSuccess, onExploreLanding }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('student'); // 'student' | 'admin'

  // Input fields
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

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide your email address and password.');
      return;
    }

    if (activeTab === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full legal name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must contain at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your password confirmation.');
        return;
      }
      if (role === 'admin') {
        const inputKey = adminPasscode.trim().toLowerCase();
        if (!VALID_ADMIN_KEYS.includes(inputKey)) {
          setError(`Placement Officer authorization key invalid.`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      if (activeTab === 'login') {
        const result = await loginUser(email, password);
        if (result.success && result.user) {
          setSuccessMsg(`Welcome, ${result.user.name}! Entering portal...`);
          setTimeout(() => {
            onLoginSuccess(result.user);
          }, 600);
        } else {
          setError(result.message || 'Invalid email or password. Please verify your credentials or register a new account.');
        }
      } else {
        const studentInfo = {
          branch,
          rollNo: rollNo.trim() || `ROLL-${Date.now().toString().slice(-4)}`,
          cgpa: cgpa || '8.5',
          phone: phone.trim() || '+91 98765 00000',
        };

        const result = await signupUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          adminPasscode: adminPasscode.trim(),
          adminSecretKey: adminPasscode.trim(),
          ...studentInfo,
        });

        if (result.success && result.user) {
          setSuccessMsg(`Account created successfully in database! Entering portal...`);
          setTimeout(() => {
            onLoginSuccess(result.user);
          }, 600);
        } else {
          setError(result.message || 'Registration failed. Please check your details and try again.');
        }
      }
    } catch (err) {
      setError('Network communication failed. Please verify the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address first.');
      return;
    }
    setResetSent(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setResetSent(false);
    }, 3000);
  };

  return (
    <div className="login-page-container">
      {/* Decorative Atmospheric Glows */}
      <div className="login-ambient-glow glow-top" />
      <div className="login-ambient-glow glow-bottom" />

      {/* Top Header */}
      <header className="login-top-nav">
        <div className="login-brand">
          <div className="login-logo-icon">
            <GraduationCap size={22} className="logo-svg" />
          </div>
          <div className="login-brand-text">
            <span className="brand-title">PlacementPulse</span>
            <span className="brand-badge">Campus Portal</span>
          </div>
        </div>

        {onExploreLanding && (
          <button
            type="button"
            className="login-explore-btn"
            onClick={onExploreLanding}
          >
            <span>Explore Overview</span>
            <ChevronRight size={16} />
          </button>
        )}
      </header>

      {/* Main Shell */}
      <main className="login-main-shell">
        {/* Left Information Panel */}
        <section className="login-showcase-panel">
          <div className="showcase-badge">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Campus Career & Recruitment Ecosystem</span>
          </div>

          <h1 className="showcase-heading">
            Connect Talent With <span className="text-gradient">Top Recruiters</span>
          </h1>

          <p className="showcase-desc">
            A comprehensive, modern campus placement portal connecting students,
            training & placement cells, and corporate hiring partners. Track drives, manage
            applications, and accelerate career milestones.
          </p>

          {/* Metric Highlights */}
          <div className="showcase-metrics">
            <div className="metric-box">
              <span className="metric-num">94.8%</span>
              <span className="metric-lbl">Placement Rate</span>
            </div>
            <div className="metric-box">
              <span className="metric-num">180+</span>
              <span className="metric-lbl">Partner Recruiters</span>
            </div>
            <div className="metric-box">
              <span className="metric-num">₹42 LPA</span>
              <span className="metric-lbl">Highest Package</span>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="showcase-features">
            <div className="feature-item">
              <div className="feature-icon bg-indigo">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <strong>Automated Eligibility Verification</strong>
                <p>Instant matching with criteria across branch, CGPA, and technical proficiencies.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon bg-emerald">
                <TrendingUp size={16} />
              </div>
              <div>
                <strong>Real-Time Recruitment Pipeline</strong>
                <p>Live tracking from online assessments through technical interviews to offer releases.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Authentication Card */}
        <section className="login-form-card">
          {/* Card Header & Tabs */}
          <div className="form-card-header">
            <div className="form-tabs-pill">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('signup');
                  setError('');
                }}
              >
                Create Account
              </button>
            </div>

            <p className="form-helper-text">
              {activeTab === 'login'
                ? 'Sign in to access your placement dashboard, applications, and job drives.'
                : 'Register as a candidate or placement officer to access the portal.'}
            </p>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="auth-alert error-alert">
              <AlertCircle size={16} className="alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert success-alert">
              <CheckCircle2 size={16} className="alert-icon" />
              <span>{successMsg}</span>
            </div>
          )}

          {resetSent && (
            <div className="auth-alert success-alert">
              <CheckCircle2 size={16} className="alert-icon" />
              <span>Password reset instructions sent to your email!</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="auth-form-body">
            {/* Role Toggle for Signup */}
            {activeTab === 'signup' && (
              <div className="input-group">
                <label className="input-label">Select Account Role</label>
                <div className="role-selector-pill">
                  <button
                    type="button"
                    className={`role-btn ${role === 'student' ? 'active' : ''}`}
                    onClick={() => setRole('student')}
                  >
                    <GraduationCap size={15} />
                    <span>Candidate / Student</span>
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                    onClick={() => setRole('admin')}
                  >
                    <Shield size={15} />
                    <span>Placement Officer</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'signup' && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div className="input-field-wrapper">
                  <User size={18} className="field-icon" />
                  <input
                    type="text"
                    className="clean-input"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-field-wrapper">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  className="clean-input"
                  placeholder="name@university.edu or your.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Additional Fields for Student Signup */}
            {activeTab === 'signup' && role === 'student' && (
              <div className="input-row-grid">
                <div className="input-group">
                  <label className="input-label">Branch</label>
                  <select
                    className="clean-select"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="IT">IT</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="EEE">EEE</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="10"
                    className="clean-input"
                    placeholder="8.50"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Officer Secret for Admin Signup */}
            {activeTab === 'signup' && role === 'admin' && (
              <div className="input-group">
                <label className="input-label">
                  Placement Officer Authorization Key
                </label>
                <div className="input-field-wrapper">
                  <KeyRound size={18} className="field-icon" />
                  <input
                    type="password"
                    className="clean-input"
                    placeholder="Enter placement officer authorization key"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="input-group">
              <div className="label-with-hint">
                <label className="input-label">Password</label>
                {activeTab === 'login' && (
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="input-field-wrapper">
                <Lock size={18} className="field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="clean-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password on Signup */}
            {activeTab === 'signup' && (
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className="input-field-wrapper">
                  <Lock size={18} className="field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="clean-input"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Remember Me Option */}
            {activeTab === 'login' && (
              <div className="auth-options-row">
                <label className="remember-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="btn-spinner" />
              ) : (
                <>
                  <span>
                    {activeTab === 'login' ? 'Sign In to Portal' : 'Create Account & Enter'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Note */}
          <div className="form-card-footer">
            <Shield size={14} className="shield-icon" />
            <span>Secure 256-bit encrypted authentication session</span>
          </div>
        </section>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '420px' }}>
            <div className="modal-card-header">
              <h3 className="modal-title">Password Recovery</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowForgotPassword(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleForgotPassword} className="modal-form-body">
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px' }}>
                Enter your registered email address and we will send you a password reset link.
              </p>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="modal-input"
                  placeholder="your.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="modal-card-footer">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn">
                  Send Recovery Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
