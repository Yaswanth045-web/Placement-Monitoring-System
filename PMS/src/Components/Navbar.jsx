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
            <strong className="desktop-only-inline">Security Status:</strong>
            <strong className="mobile-only-inline">Security:</strong>{' '}
            {!currentUser ? (
              <span style={{ color: '#fbbf24' }}>
                <span className="desktop-only-inline">Guest / Unauthenticated Session (Read-Only)</span>
                <span className="mobile-only-inline">Guest (Read-Only)</span>
              </span>
            ) : isAdmin ? (
              <span style={{ color: '#4ade80' }}>
                <span className="desktop-only-inline">Placement Administrator (Full Operational Clearance)</span>
                <span className="mobile-only-inline">Admin Mode (Full Clearance)</span>
              </span>
            ) : (
              <span>
                <span className="desktop-only-inline">Candidate / Student (Protected Read-Only Access)</span>
                <span className="mobile-only-inline">Student Mode (Protected)</span>
              </span>
            )}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {currentUser ? (
              <button
                type="button"
                className="top-bar-switch-btn"
                onClick={() => onSwitchRole && onSwitchRole(isAdmin ? 'student' : 'admin')}
                title="Quickly switch between Student and Admin testing views"
              >
                <span className="desktop-only-inline">⇄ Toggle to {isAdmin ? 'Student Mode' : 'Admin Clearance'}</span>
                <span className="mobile-only-inline">⇄ {isAdmin ? 'Student' : 'Admin'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="top-bar-switch-btn"
                onClick={onOpenAuth}
                title="Sign in or register for an account"
              >
                Log In / Sign Up
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
              <span className="nav-logo-title">PLACEMENT TRACKER</span>
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
              <span>Tracker Pad ↗</span>
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
                <span>LOG IN / SIGN UP</span>
              </button>
            )}

            <button
              type="button"
              className="btn-launch mono"
              onClick={() => handleNavClick(activePage === 'Home' ? 'Dashboard' : 'Home')}
            >
              <span>••</span> {activePage === 'Home' ? 'LAUNCH TRACKER' : 'RETURN HOME'}
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
          <>
            <div
              className="mobile-nav-backdrop"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="mobile-nav-drawer mono">
              {currentUser && (
                <div className="mobile-user-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={`chip-role-badge ${isAdmin ? 'role-admin' : 'role-student'}`}>
                      {isAdmin ? 'ADMIN CLEARANCE' : 'STUDENT ACCESS'}
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
                  <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 600 }}>{currentUser.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--dim-text)' }}>{currentUser.email}</div>
                </div>
              )}

              <div className="mobile-quick-launch-wrap">
                <button
                  type="button"
                  className="mobile-quick-launch-btn"
                  onClick={() => handleNavClick(activePage === 'Home' ? 'Dashboard' : 'Home')}
                >
                  <span>••</span>
                  <strong>{activePage === 'Home' ? 'LAUNCH OPERATIONS DASHBOARD ↗' : 'RETURN TO HOME ↗'}</strong>
                </button>
              </div>

              <div className="mobile-menu-section-label">NAVIGATION OPTIONS</div>
              <ul className="mobile-drawer-list">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`mobile-drawer-btn ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => handleNavClick(item.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </div>
                        {activePage === item.id && <span className="mobile-active-tag">ACTIVE</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mobile-menu-section-label" style={{ marginTop: '14px' }}>OPERATIONS &amp; ACCESS</div>
              <ul className="mobile-drawer-list">
                <li>
                  <button
                    type="button"
                    className="mobile-drawer-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <LogIn size={15} />
                      <span>{currentUser ? 'SWITCH ACCOUNT / SIGN IN' : 'LOG IN / SIGN UP'}</span>
                    </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={15} />
                      <span>CONTACT PLACEMENT CELL</span>
                    </div>
                  </button>
                </li>
                {currentUser && (
                  <li>
                    <button
                      type="button"
                      className="mobile-drawer-btn mobile-logout-btn"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <LogOut size={15} />
                        <span>SIGN OUT OF SESSION</span>
                      </div>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </header>
    </>
  );
}
