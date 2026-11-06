import React from 'react';
import {
  Users,
  Award,
  Building2,
  TrendingUp,
  UserPlus,
  PlusCircle,
  FileCheck2,
  ArrowRight,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import '../Styles/Dashboard.css';

export default function DashboardView({
  students = [],
  companies = [],
  applications = [],
  loading = false,
  error = '',
  onRefresh,
  onNavigate,
}) {
  // Real Calculated Statistics
  const totalStudents = students.length;
  const studentsPlaced = students.filter((s) => s.status === 'Placed').length;
  const studentsInterview = students.filter((s) => s.status === 'Interview').length;
  const studentsApplied = students.filter((s) => s.status === 'Applied').length;
  const studentsNotPlaced = students.filter((s) => s.status === 'Not Placed' || !s.status).length;
  const totalCompanies = companies.length;

  const placementRate =
    totalStudents > 0 ? Math.round((studentsPlaced / totalStudents) * 100) : 0;

  // Branch Breakdown
  const branchMap = {};
  students.forEach((s) => {
    const branch = (s.branch || 'OTHER').toUpperCase().trim();
    if (!branchMap[branch]) {
      branchMap[branch] = { total: 0, placed: 0 };
    }
    branchMap[branch].total += 1;
    if (s.status === 'Placed') {
      branchMap[branch].placed += 1;
    }
  });

  const branchList = Object.keys(branchMap)
    .map((branch) => ({
      branch,
      total: branchMap[branch].total,
      placed: branchMap[branch].placed,
      rate: Math.round((branchMap[branch].placed / branchMap[branch].total) * 100) || 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Status breakdown slices
  const statusItems = [
    { label: 'Placed', count: studentsPlaced, color: '#10b981', bg: '#ecfdf5', dot: '#10b981' },
    { label: 'Interviewing', count: studentsInterview, color: '#f59e0b', bg: '#fffbeb', dot: '#f59e0b' },
    { label: 'Applied', count: studentsApplied, color: '#3b82f6', bg: '#eff6ff', dot: '#3b82f6' },
    { label: 'Not Placed', count: studentsNotPlaced, color: '#94a3b8', bg: '#f1f5f9', dot: '#94a3b8' },
  ];

  // Circumference for clean SVG donut
  const circumference = 2 * Math.PI * 40;
  let currentOffset = 0;
  const donutSegments = statusItems.map((item) => {
    const percent = totalStudents > 0 ? item.count / totalStudents : 0;
    const strokeDash = percent * circumference;
    const dashArray = `${strokeDash} ${circumference - strokeDash}`;
    const dashOffset = -currentOffset;
    currentOffset += strokeDash;
    return { ...item, dashArray, dashOffset, percent: Math.round(percent * 100) };
  });

  // Recent applications list
  const recentApps = [...applications].slice(-5).reverse();

  return (
    <div className="modern-dashboard">
      {/* Top Header Banner */}
      <div className="dashboard-hero-header">
        <div className="hero-text-col">
          <div className="hero-pill-badge">
            <Sparkles size={13} className="hero-pill-icon" />
            <span>Campus Placement Intelligence</span>
          </div>
          <h1 className="dashboard-main-heading">Placement Operations Dashboard</h1>
          <p className="dashboard-subheading">
            Live recruitment analytics, candidate progress tracking, and partner corporate drives.
          </p>
        </div>

        <div className="hero-actions-col">
          <button
            type="button"
            className="refresh-data-btn"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Syncing...' : 'Refresh Live Data'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-alert-banner">
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="kpi-metric-grid">
        {/* Card 1: Total Students */}
        <div className="kpi-stat-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Registered Students</span>
            <div className="kpi-icon-wrap bg-indigo-subtle">
              <Users size={18} className="text-indigo" />
            </div>
          </div>
          <div className="kpi-card-body">
            <span className="kpi-value">{totalStudents}</span>
            <span className="kpi-subtext">Active 2026 Batch</span>
          </div>
          <div className="kpi-card-footer">
            <button
              type="button"
              className="kpi-link-btn"
              onClick={() => onNavigate && onNavigate('Students')}
            >
              <span>View Directory</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Card 2: Placed Students */}
        <div className="kpi-stat-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Placed Candidates</span>
            <div className="kpi-icon-wrap bg-emerald-subtle">
              <Award size={18} className="text-emerald" />
            </div>
          </div>
          <div className="kpi-card-body">
            <span className="kpi-value">{studentsPlaced}</span>
            <span className="kpi-subtext text-emerald-bold">
              {placementRate}% Conversion
            </span>
          </div>
          <div className="kpi-card-footer">
            <div className="kpi-mini-progress">
              <div
                className="mini-progress-fill bg-emerald"
                style={{ width: `${Math.min(100, placementRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Partner Companies */}
        <div className="kpi-stat-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Partner Recruiters</span>
            <div className="kpi-icon-wrap bg-sky-subtle">
              <Building2 size={18} className="text-sky" />
            </div>
          </div>
          <div className="kpi-card-body">
            <span className="kpi-value">{totalCompanies}</span>
            <span className="kpi-subtext">Active Hiring Partners</span>
          </div>
          <div className="kpi-card-footer">
            <button
              type="button"
              className="kpi-link-btn"
              onClick={() => onNavigate && onNavigate('Companies')}
            >
              <span>View Recruiters</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Card 4: Applications Pipeline */}
        <div className="kpi-stat-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Total Applications</span>
            <div className="kpi-icon-wrap bg-amber-subtle">
              <Briefcase size={18} className="text-amber" />
            </div>
          </div>
          <div className="kpi-card-body">
            <span className="kpi-value">{applications.length}</span>
            <span className="kpi-subtext">Active Pipeline Submissions</span>
          </div>
          <div className="kpi-card-footer">
            <button
              type="button"
              className="kpi-link-btn"
              onClick={() => onNavigate && onNavigate('Applications')}
            >
              <span>View Tracker</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Grid: Branch Analysis & Donut Chart */}
      <div className="dashboard-charts-grid">
        {/* Branch-wise Performance */}
        <div className="dashboard-card branch-performance-card">
          <div className="card-heading-bar">
            <div>
              <h2 className="card-title">Placement by Engineering Branch</h2>
              <p className="card-subtitle">
                Placement distribution across primary academic departments.
              </p>
            </div>
          </div>

          <div className="branch-list-wrapper">
            {branchList.length === 0 ? (
              <p className="empty-state-text">No student branch data available.</p>
            ) : (
              branchList.map((item) => (
                <div key={item.branch} className="branch-metric-row">
                  <div className="branch-row-top">
                    <span className="branch-name-label">{item.branch}</span>
                    <span className="branch-stats-text">
                      <strong>{item.placed}</strong> / {item.total} Placed ({item.rate}%)
                    </span>
                  </div>
                  <div className="branch-progress-track">
                    <div
                      className="branch-progress-bar"
                      style={{ width: `${Math.min(100, Math.max(6, item.rate))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Donut Chart: Placement Status */}
        <div className="dashboard-card status-donut-card">
          <div className="card-heading-bar">
            <div>
              <h2 className="card-title">Placement Status Breakdown</h2>
              <p className="card-subtitle">Current status distribution of all candidates.</p>
            </div>
          </div>

          <div className="donut-content-layout">
            <div className="donut-svg-wrapper">
              <svg width="120" height="120" viewBox="0 0 100 100" className="donut-svg">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="12"
                />
                {donutSegments.map((segment) => (
                  <circle
                    key={segment.label}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="12"
                    strokeDasharray={segment.dashArray}
                    strokeDashoffset={segment.dashOffset}
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                ))}
              </svg>
              <div className="donut-center-label">
                <span className="center-percentage">{placementRate}%</span>
                <span className="center-text">Placed</span>
              </div>
            </div>

            <div className="donut-legend-list">
              {statusItems.map((item) => (
                <div key={item.label} className="legend-row-item">
                  <span className="legend-color-dot" style={{ backgroundColor: item.dot }} />
                  <span className="legend-name">{item.label}</span>
                  <span className="legend-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Recent Activity */}
      <div className="dashboard-bottom-grid">
        {/* Quick Actions */}
        <div className="dashboard-card quick-actions-card">
          <div className="card-heading-bar">
            <div>
              <h2 className="card-title">Placement Quick Actions</h2>
              <p className="card-subtitle">Frequent administrative operations.</p>
            </div>
          </div>

          <div className="quick-actions-btns">
            <button
              type="button"
              className="action-tile-btn"
              onClick={() => onNavigate && onNavigate('Students')}
            >
              <div className="action-tile-icon bg-indigo-subtle">
                <UserPlus size={18} className="text-indigo" />
              </div>
              <div className="action-tile-text">
                <span className="tile-title">Enroll Student</span>
                <span className="tile-desc">Add candidate profile</span>
              </div>
              <ChevronRight size={16} className="tile-arrow" />
            </button>

            <button
              type="button"
              className="action-tile-btn"
              onClick={() => onNavigate && onNavigate('Companies')}
            >
              <div className="action-tile-icon bg-sky-subtle">
                <PlusCircle size={18} className="text-sky" />
              </div>
              <div className="action-tile-text">
                <span className="tile-title">Register Recruiter</span>
                <span className="tile-desc">Add partner company</span>
              </div>
              <ChevronRight size={16} className="tile-arrow" />
            </button>

            <button
              type="button"
              className="action-tile-btn"
              onClick={() => onNavigate && onNavigate('Drives')}
            >
              <div className="action-tile-icon bg-amber-subtle">
                <Briefcase size={18} className="text-amber" />
              </div>
              <div className="action-tile-text">
                <span className="tile-title">Recruitment Drives</span>
                <span className="tile-desc">View schedules & apply</span>
              </div>
              <ChevronRight size={16} className="tile-arrow" />
            </button>

            <button
              type="button"
              className="action-tile-btn"
              onClick={() => onNavigate && onNavigate('Applications')}
            >
              <div className="action-tile-icon bg-emerald-subtle">
                <FileCheck2 size={18} className="text-emerald" />
              </div>
              <div className="action-tile-text">
                <span className="tile-title">Manage Applications</span>
                <span className="tile-desc">Update interview outcomes</span>
              </div>
              <ChevronRight size={16} className="tile-arrow" />
            </button>
          </div>
        </div>

        {/* Recent Applications Feed */}
        <div className="dashboard-card recent-apps-card">
          <div className="card-heading-bar">
            <div>
              <h2 className="card-title">Recent Application Pipeline</h2>
              <p className="card-subtitle">Latest student drive submissions.</p>
            </div>
            {onNavigate && (
              <button
                type="button"
                className="view-all-link"
                onClick={() => onNavigate('Applications')}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          <div className="recent-apps-list">
            {recentApps.length === 0 ? (
              <p className="empty-state-text">No applications submitted yet.</p>
            ) : (
              recentApps.map((app) => {
                const statusLower = (app.status || 'applied').toLowerCase();
                return (
                  <div key={app._id || app.id} className="app-feed-item">
                    <div className="app-feed-avatar">
                      {(app.studentName || 'S')[0].toUpperCase()}
                    </div>
                    <div className="app-feed-info">
                      <span className="app-student-name">{app.studentName}</span>
                      <span className="app-company-role">
                        {app.role || 'Software Engineer'} • {app.companyName}
                      </span>
                    </div>
                    <div className="app-feed-status">
                      <span className={`status-badge ${statusLower}`}>
                        {app.status || 'Applied'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
