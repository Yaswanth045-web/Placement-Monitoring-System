import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Briefcase,
  Home,
  UserCheck,
  Shield,
  GraduationCap,
  LogIn,
  LogOut,
  ChevronDown,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import '../Styles/Navbar.css';

export default function Navbar({
  activePage,
  setActivePage,
  onOpenContact,
  backendStatus = 'Connected',
  currentUser,
  onOpenAuth,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Drives', label: 'Drives', icon: Briefcase },
    { id: 'Students', label: 'Students', icon: Users },
    { id: 'Companies', label: 'Companies', icon: Building2 },
    { id: 'Applications', label: 'Applications', icon: FileText },
    { id: 'Profile', label: 'Profile', icon: UserCheck },
    { id: 'Home', label: 'Overview', icon: Home },
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const isDbConnected = backendStatus === 'Connected' || backendStatus === 1;

  return (
    <header className={`modern-navbar-wrapper ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => handleNavClick(currentUser ? 'Dashboard' : 'Home')}>
          <div className="brand-icon-box">
            <GraduationCap size={22} className="brand-svg" />
          </div>
          <div className="brand-text-col">
            <span className="brand-name">PlacementPulse</span>
            <span className="brand-sub">Career Portal</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        {currentUser && (
          <nav className="desktop-nav-menu">
            {navLinks.map((item) => {
              const IconComponent = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-link-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <IconComponent size={17} className="nav-item-icon" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="navbar-right-actions">
          {/* Database Live Status Indicator */}
          <div
            className={`db-status-pill ${isDbConnected ? 'connected' : 'offline'}`}
            title={`Database status: ${backendStatus}`}
          >
            <span className="status-dot" />
            <span className="status-label">{isDbConnected ? 'DB Live' : 'Offline'}</span>
          </div>

          {/* Placement Cell Contact Drawer */}
          {onOpenContact && (
            <button
              type="button"
              className="navbar-icon-btn"
              onClick={onOpenContact}
              title="Placement Cell Contact"
            >
              <PhoneCall size={16} />
              <span className="btn-label-desktop">Contact Cell</span>
            </button>
          )}

          {/* User Profile or Login Trigger */}
          {currentUser ? (
            <div className="user-profile-menu-container" ref={dropdownRef}>
              <button
                type="button"
                className="user-profile-capsule"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
              >
                <div className={`user-avatar ${isAdmin ? 'admin-avatar' : 'student-avatar'}`}>
                  {userInitials}
                </div>
                <div className="user-info-text">
                  <span className="user-display-name">{currentUser.name || 'User'}</span>
                  <span className={`user-role-badge ${isAdmin ? 'role-admin' : 'role-student'}`}>
                    {isAdmin ? 'Admin' : 'Student'}
                  </span>
                </div>
                <ChevronDown size={14} className={`dropdown-chevron ${userDropdownOpen ? 'open' : ''}`} />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="user-dropdown-popup">
                  <div className="dropdown-user-header">
                    <p className="dropdown-name">{currentUser.name}</p>
                    <p className="dropdown-email">{currentUser.email}</p>
                    <div className="dropdown-role-tag">
                      {isAdmin ? <Shield size={12} /> : <GraduationCap size={12} />}
                      <span>{isAdmin ? 'Administrator' : 'Candidate Student'}</span>
                    </div>
                  </div>

                  <div className="dropdown-menu-list">
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => handleNavClick('Profile')}
                    >
                      <UserCheck size={16} />
                      <span>My Profile</span>
                    </button>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => handleNavClick('Dashboard')}
                    >
                      <LayoutDashboard size={16} />
                      <span>Placement Dashboard</span>
                    </button>
                    <div className="dropdown-separator" />
                    <button
                      type="button"
                      className="dropdown-item logout-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="navbar-primary-btn"
              onClick={onOpenAuth}
            >
              <LogIn size={16} />
              <span>Sign In / Enter Portal</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-links">
            {currentUser &&
              navLinks.map((item) => {
                const IconComponent = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`mobile-link ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <IconComponent size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

            {!currentUser && (
              <button
                type="button"
                className="mobile-link is-active"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
              >
                <LogIn size={18} />
                <span>Sign In to Portal</span>
              </button>
            )}

            {currentUser && (
              <button
                type="button"
                className="mobile-link logout"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
