import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Home,
  UserCheck,
  Shield,
  GraduationCap,
  LogIn,
  LogOut,
  ChevronDown,
  Repeat,
} from 'lucide-react';
import '../Styles/Navbar.css';

export default function Navbar({
  activePage,
  setActivePage,
  onOpenContact,
  backendStatus = 'Connected',
  currentUser,
  onOpenAuth,
  onSwitchRole,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [topBarDismissed, setTopBarDismissed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'Home', label: 'HOME', icon: Home },
    { id: 'Dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'Students', label: 'STUDENTS', icon: Users },
    { id: 'Companies', label: 'COMPANIES', icon: Building2 },
    { id: 'Applications', label: 'APPLICATIONS', icon: FileText },
    { id: 'Profile', label: 'PROFILE', icon: UserCheck },
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isTopBarHidden = scrolled || topBarDismissed;
  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  return (
    <>
      {/* 30px Top Bar */}
      <aside className={`nova-top-bar mono ${isTopBarHidden ? 'hidden' : ''}`} id="topBar">
        <div className="top-bar-inner">
          <span className="top-bar-text">
            <strong>Security Status:</strong>{' '}
            {!currentUser ? (
              <span style={{ color: '#fbbf24' }}>Guest / Unauthenticated Session (Read-Only)</span>
            ) : isAdmin ? (
              <span style={{ color: '#4ade80' }}>Placement Administrator (Full Operational Clearance)</span>
            ) : (
              <span>Candidate / Student (Protected Read-Only Access)</span>
            )}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {currentUser ? (
              <button
                type="button"
                className="top-bar-switch-btn"
                onClick={() => onSwitchRole && onSwitchRole(isAdmin ? 'student' : 'admin')}
                title="Quickly switch between Student and Admin testing views"
              >
                ⇄ Toggle to {isAdmin ? 'Student Mode' : 'Admin Clearance'}
              </button>
            ) : (
              <button
                type="button"
                className="top-bar-switch-btn"
                onClick={onOpenAuth}
                title="Sign in with your institutional credentials"
              >
                Sign In
              </button>
            )}
            <button
              type="button"
              className="top-bar-close"
              onClick={() => setTopBarDismissed(true)}
              aria-label="Close Announcement"
            >
              ×
            </button>
          </div>
        </div>
      </aside>

      {/* 52px Fixed/Sticky Navbar */}
      <header className={`nova-navbar ${isTopBarHidden ? 'scrolled-up' : ''}`} role="banner">
        <div className="navbar-grid-wrapper">
          {/* Col 1: Logo */}
          <div className="nav-logo-cell">
            <button
              type="button"
              className="nav-brand-btn"
              onClick={() => handleNavClick('Home')}
            >
              <svg className="nav-logo-icon" viewBox="0 0 27 27" fill="none">
                <defs>
                  <linearGradient id="pmsLogoGrad" x1="0" y1="0" x2="27" y2="27" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffb347"/>
                    <stop offset="40%" stopColor="#ff8a3d"/>
                    <stop offset="70%" stopColor="#ff5a5f"/>
                    <stop offset="100%" stopColor="#ff3d8b"/>
                  </linearGradient>
                </defs>
                <path
                  d="M 21.5 6 C 19 3 16 2 13.5 2 C 7.15 2 2 7.15 2 13.5 C 2 19.85 7.15 25 13.5 25 C 16 25 19 24 21.5 21"
                  stroke="url(#pmsLogoGrad)"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                <circle cx="10" cy="13.5" r="1.5" fill="#141414" />
                <circle cx="16" cy="13.5" r="1.5" fill="#141414" />
              </svg>
              <span className="nav-logo-title">YASWANTH PLACEMENT</span>
            </button>
          </div>

          {/* Col 2: Navigation Menu */}
          <nav className="nav-menu-cell" role="navigation" aria-label="Main Navigation">
            <ul className="nav-menu-list mono">
              {navLinks.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`nav-menu-link ${isActive ? 'active' : ''}`}
                      onClick={() => handleNavClick(item.id)}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  className="nav-menu-link contact-pill-link"
                  onClick={onOpenContact}
                >
                  Contact Cell▾
                </button>
              </li>
            </ul>
          </nav>

          {/* Col 3: Pad Cell */}
          <div className="nav-pad-cell mono">
            <button
              type="button"
              className="pad-cell-btn"
              onClick={() => handleNavClick('Dashboard')}
            >
              <span>Yaswanth Pad ↗</span>
            </button>
          </div>

          {/* Col 4: Action Button & System Health */}
          <div className="nav-btn-cell">
            <div className="status-indicator-tag mono" title={`Database: ${backendStatus}`}>
              <span className={`status-dot ${backendStatus === 'Connected' ? 'dot-live' : 'dot-warn'}`} />
              <span className="status-name">{backendStatus === 'Connected' ? 'LIVE' : 'OFFLINE'}</span>
            </div>

            {/* Professional User Identity Menu */}
            {currentUser ? (
              <div className="nav-user-dropdown-container" ref={userDropdownRef}>
                <button
                  type="button"
                  className="nav-user-chip mono"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  title="Account and Identity Settings"
                >
                  <span className={`chip-role-badge ${isStudent ? 'role-student' : 'role-admin'}`}>
                    {isStudent ? 'STUDENT' : 'ADMIN'}
                  </span>
                  <span className="chip-user-name">
                    {(currentUser.name || 'User').split(' ')[0]}
                  </span>
                  <ChevronDown size={12} className={`chip-chevron ${userMenuOpen ? 'open' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="user-dropdown-popover industrial-rivet-card">
                    <div className="dropdown-user-header">
                      <div className="dropdown-avatar">
                        {(currentUser.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="dropdown-meta">
                        <strong className="dropdown-name">{currentUser.name}</strong>
                        <span className="dropdown-email">{currentUser.email}</span>
                        <span className={`dropdown-role-tag mono ${isStudent ? 'role-student' : 'role-admin'}`}>
                          {isStudent ? 'STUDENT // READ ACCESS' : 'ADMIN // FULL PRIVILEGES'}
                        </span>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <div className="dropdown-actions-list mono">
                      <button
                        type="button"
                        className="dropdown-item-btn"
                        onClick={() => handleNavClick('Profile')}
                      >
                        <UserCheck size={14} />
                        <span>VIEW / EDIT PROFILE</span>
                      </button>

                      <button
                        type="button"
                        className="dropdown-item-btn"
                        onClick={() => {
                          onSwitchRole && onSwitchRole(isAdmin ? 'student' : 'admin');
                          setUserMenuOpen(false);
                        }}
                      >
                        <Repeat size={14} />
                        <span>SWITCH ROLE TO {isAdmin ? 'STUDENT' : 'ADMIN'}</span>
                      </button>

                      <button
                        type="button"
                        className="dropdown-item-btn"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenAuth();
                        }}
                      >
                        <LogIn size={14} />
                        <span>SWITCH ACCOUNT / REGISTER</span>
                      </button>

                      <div className="dropdown-divider" />

                      <button
                        type="button"
                        className="dropdown-item-btn dropdown-logout-btn"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                        }}
                      >
                        <LogOut size={14} />
                        <span>SIGN OUT</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="btn-login-nav mono"
                onClick={onOpenAuth}
              >
                <LogIn size={13} />
                <span>SIGN IN / ENROLL</span>
              </button>
            )}

            <button
              type="button"
              className="btn-launch mono"
              onClick={() => handleNavClick(activePage === 'Home' ? 'Dashboard' : 'Home')}
            >
              <span>••</span> {activePage === 'Home' ? 'LAUNCH YASWANTH' : 'RETURN HOME'}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer mono">
            {currentUser && (
              <div className="mobile-user-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`chip-role-badge ${isAdmin ? 'role-admin' : 'role-student'}`}>
                    {isAdmin ? 'ADMIN' : 'STUDENT'}
                  </span>
                  <button
                    type="button"
                    className="btn-switch-role mono"
                    onClick={() => {
                      onSwitchRole(isAdmin ? 'student' : 'admin');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Switch to {isAdmin ? 'Student' : 'Admin'}
                  </button>
                </div>
                <div style={{ marginTop: '8px', fontSize: '13.5px', fontWeight: 600 }}>{currentUser.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--dim-text)' }}>{currentUser.email}</div>
              </div>
            )}

            <ul className="mobile-drawer-list">
              {navLinks.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`mobile-drawer-btn ${activePage === item.id ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <span>{item.label}</span>
                    {activePage === item.id && <span className="mobile-active-tag">ACTIVE</span>}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="mobile-drawer-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                >
                  <span>SIGN IN / SWITCH ACCOUNT</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="mobile-drawer-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenContact();
                  }}
                >
                  <span>CONTACT CELL</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>
    </>
  );
}
