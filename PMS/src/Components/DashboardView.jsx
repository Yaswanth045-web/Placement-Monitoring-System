import React from 'react';
import {
  Users,
  Award,
  Building2,
  TrendingUp,
  UserPlus,
  PlusCircle,
  FileCheck2,
  Clock,
  ArrowRight,
  Database,
  BarChart3,
  PieChart as PieIcon,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
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

  const placementRate = totalStudents > 0
    ? Math.round((studentsPlaced / totalStudents) * 100)
    : 0;

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

  const branchList = Object.keys(branchMap).map((branch) => ({
    branch,
    total: branchMap[branch].total,
    placed: branchMap[branch].placed,
    rate: Math.round((branchMap[branch].placed / branchMap[branch].total) * 100),
  })).slice(0, 5);

  // Application Pipeline Distribution
  const totalApps = applications.length;
  const appsApplied = applications.filter((a) => a.status === 'Applied').length;
  const appsInterview = applications.filter((a) => a.status === 'Interview').length;
  const appsSelected = applications.filter((a) => a.status === 'Selected').length;
  const appsRejected = applications.filter((a) => a.status === 'Rejected').length;

  // Donut Chart calculations for Student Placement Status
  const donutData = [
    { label: 'Placed', count: studentsPlaced, color: '#4ade80' },
    { label: 'Interview', count: studentsInterview, color: '#fde047' },
    { label: 'Applied', count: studentsApplied, color: '#93c5fd' },
    { label: 'Not Placed', count: studentsNotPlaced, color: '#71768c' },
  ];

  // Compute SVG circle segments
  const circumference = 2 * Math.PI * 40; // r=40 -> ~251.3
  let currentOffset = 0;
  const donutSegments = donutData.map((slice) => {
    const percent = totalStudents > 0 ? slice.count / totalStudents : 0;
    const strokeDash = percent * circumference;
    const dashArray = `${strokeDash} ${circumference - strokeDash}`;
    const dashOffset = -currentOffset;
    currentOffset += strokeDash;
    return { ...slice, dashArray, dashOffset, percent: Math.round(percent * 100) };
  });

  return (
    <div className="dashboard-container">
      {/* Top Industrial Header & Summary */}
      <header className="dashboard-header-bar">
        <div>
          <div className="dashboard-badge-row">
            <span className="live-dot" />
            <span className="live-code">CAMPUS PLACEMENT CONTROL ROOM // LIVE API</span>
          </div>
          <h2 className="dashboard-title">OPERATIONS DASHBOARD</h2>
          <p className="dashboard-subtitle">
            Real-time analytics, recruitment statistics, and student career pipelines.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            type="button"
            className="btn-steel btn-sm"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh database records"
          >
            <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
            <span>SYNC DATA</span>
          </button>

          <button
            type="button"
            className="btn-rust btn-sm"
            onClick={() => onNavigate('Applications')}
          >
            <PlusCircle size={15} />
            <span>NEW APPLICATION</span>
          </button>
        </div>
      </header>

      {/* Error Notice */}
      {error && (
        <div className="dashboard-alert-banner" role="alert">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button type="button" onClick={onRefresh} className="alert-retry-btn">
            Retry Connection
          </button>
        </div>
      )}

      {/* 4 Rounded Statistic Cards */}
      <section className="stats-cards-grid" aria-label="Placement Metrics">
        {/* Card 1: Total Students */}
        <div className="stat-metric-card industrial-rivet-card">
          <div className="card-top-row">
            <span className="card-kpi-label">TOTAL STUDENTS</span>
            <div className="card-icon-wrapper">
              <Users size={20} />
            </div>
          </div>
          <div className="card-value-row">
            <strong className="card-number">{loading ? '...' : totalStudents}</strong>
            <span className="card-trend-tag">CANDIDATES</span>
          </div>
          <div className="card-bottom-bar">
            <span className="card-meta-text">Active placement registry</span>
          </div>
        </div>

        {/* Card 2: Students Placed */}
        <div className="stat-metric-card industrial-rivet-card card-placed-highlight">
          <div className="card-top-row">
            <span className="card-kpi-label">STUDENTS PLACED</span>
            <div className="card-icon-wrapper placed-icon">
              <Award size={20} />
            </div>
          </div>
          <div className="card-value-row">
            <strong className="card-number placed-number">{loading ? '...' : studentsPlaced}</strong>
            <span className="card-trend-tag tag-success">CONFIRMED</span>
          </div>
          <div className="card-bottom-bar">
            <div className="stat-mini-progress">
              <div
                className="progress-fill placed-fill"
                style={{ width: `${placementRate}%` }}
              />
            </div>
            <span className="card-meta-text">{placementRate}% of total batch placed</span>
          </div>
        </div>

        {/* Card 3: Registered Companies */}
        <div className="stat-metric-card industrial-rivet-card">
          <div className="card-top-row">
            <span className="card-kpi-label">REGISTERED COMPANIES</span>
            <div className="card-icon-wrapper">
              <Building2 size={20} />
            </div>
          </div>
          <div className="card-value-row">
            <strong className="card-number">{loading ? '...' : totalCompanies}</strong>
            <span className="card-trend-tag">PARTNERS</span>
          </div>
          <div className="card-bottom-bar">
            <span className="card-meta-text">Tier-1 & tech recruiters</span>
          </div>
        </div>

        {/* Card 4: Placement Rate */}
        <div className="stat-metric-card industrial-rivet-card card-rate-highlight">
          <div className="card-top-row">
            <span className="card-kpi-label">PLACEMENT RATE</span>
            <div className="card-icon-wrapper rate-icon">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="card-value-row">
            <strong className="card-number rate-number">{loading ? '...' : `${placementRate}%`}</strong>
            <span className="card-trend-tag tag-orange">CAMPUS RATIO</span>
          </div>
          <div className="card-bottom-bar">
            <div className="stat-mini-progress">
              <div
                className="progress-fill rate-fill"
                style={{ width: `${placementRate}%` }}
              />
            </div>
            <span className="card-meta-text">Target: 100% student placement</span>
          </div>
        </div>
      </section>

      {/* Analytics & Pipeline Grid */}
      <section className="dashboard-analytics-grid">
        {/* Left Chart: Placement Distribution Donut Chart */}
        <div className="analytics-card industrial-rivet-card">
          <div className="card-section-header">
            <div>
              <h3 className="section-title">STUDENT PLACEMENT STATUS</h3>
              <p className="section-desc">Distribution across current recruitment stages</p>
            </div>
            <PieIcon size={18} className="header-icon-muted" />
          </div>

          <div className="donut-chart-layout">
            <div className="svg-donut-wrapper">
              <svg viewBox="0 0 100 100" className="donut-svg">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="rgba(47, 50, 64, 0.5)"
                  strokeWidth="12"
                />
                {/* Colored Segments */}
                {donutSegments.map((seg, idx) => (
                  <circle
                    key={seg.label}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                    transform="rotate(-90 50 50)"
                    strokeLinecap="round"
                    className="donut-segment"
                  />
                ))}
              </svg>
              <div className="donut-center-info">
                <span className="donut-center-val">{totalStudents}</span>
                <span className="donut-center-lbl">TOTAL</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="donut-legend-list">
              {donutData.map((item) => (
                <div key={item.label} className="legend-row">
                  <div className="legend-indicator">
                    <span className="legend-dot" style={{ backgroundColor: item.color }} />
                    <span className="legend-name">{item.label}</span>
                  </div>
                  <div className="legend-data">
                    <strong className="legend-count">{item.count}</strong>
                    <span className="legend-pct">
                      ({totalStudents > 0 ? Math.round((item.count / totalStudents) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Chart: Application Funnel Pipeline */}
        <div className="analytics-card industrial-rivet-card">
          <div className="card-section-header">
            <div>
              <h3 className="section-title">APPLICATION PIPELINE</h3>
              <p className="section-desc">Conversion funnel across interview stages</p>
            </div>
            <BarChart3 size={18} className="header-icon-muted" />
          </div>

          <div className="pipeline-funnel-list">
            <div className="funnel-stage-item">
              <div className="stage-top-meta">
                <span className="stage-name">1. APPLIED</span>
                <span className="stage-numbers">{appsApplied} Applications</span>
              </div>
              <div className="stage-track">
                <div
                  className="stage-bar bar-applied"
                  style={{ width: `${totalApps > 0 ? (appsApplied / totalApps) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="funnel-stage-item">
              <div className="stage-top-meta">
                <span className="stage-name">2. INTERVIEW ROUNDS</span>
                <span className="stage-numbers">{appsInterview} Applications</span>
              </div>
              <div className="stage-track">
                <div
                  className="stage-bar bar-interview"
                  style={{ width: `${totalApps > 0 ? (appsInterview / totalApps) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="funnel-stage-item">
              <div className="stage-top-meta">
                <span className="stage-name">3. SELECTED / OFFERS</span>
                <span className="stage-numbers">{appsSelected} Selected</span>
              </div>
              <div className="stage-track">
                <div
                  className="stage-bar bar-selected"
                  style={{ width: `${totalApps > 0 ? (appsSelected / totalApps) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="funnel-stage-item">
              <div className="stage-top-meta">
                <span className="stage-name">4. REJECTED</span>
                <span className="stage-numbers">{appsRejected} Applications</span>
              </div>
              <div className="stage-track">
                <div
                  className="stage-bar bar-rejected"
                  style={{ width: `${totalApps > 0 ? (appsRejected / totalApps) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {totalApps === 0 && (
            <p className="empty-subtext">No applications tracked yet. Create one via Applications.</p>
          )}
        </div>
      </section>

      {/* Branch Placement Ratios */}
      {branchList.length > 0 && (
        <section className="branch-overview-section industrial-rivet-card">
          <div className="card-section-header">
            <div>
              <h3 className="section-title">BRANCH PLACEMENT BREAKDOWN</h3>
              <p className="section-desc">Performance comparison by academic department</p>
            </div>
          </div>

          <div className="branch-cards-row">
            {branchList.map((b) => (
              <div key={b.branch} className="branch-card">
                <div className="branch-code-row">
                  <span className="branch-name">{b.branch}</span>
                  <span className="branch-rate">{b.rate}%</span>
                </div>
                <div className="branch-progress-bar">
                  <div
                    className="branch-progress-fill"
                    style={{ width: `${b.rate}%` }}
                  />
                </div>
                <div className="branch-counts">
                  <span>{b.placed} placed</span>
                  <span>/ {b.total} candidates</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Placement Activity Feed */}
      <section className="recent-activity-section industrial-rivet-card">
        <div className="card-section-header">
          <div>
            <h3 className="section-title">RECENT PLACEMENT ACTIVITY</h3>
            <p className="section-desc">Live log of candidate applications and recruiter milestones</p>
          </div>
          <button
            type="button"
            className="view-all-link-btn"
            onClick={() => onNavigate('Applications')}
          >
            <span>VIEW ALL</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="empty-activity-box">
            <Clock size={36} className="empty-icon" />
            <h4 className="empty-title">NO RECENT ACTIVITY</h4>
            <p className="empty-text">
              No application activity recorded in this session yet. Create applications to monitor live recruitment pipelines.
            </p>
            <button
              type="button"
              className="btn-rust btn-sm"
              onClick={() => onNavigate('Applications')}
            >
              <PlusCircle size={15} />
              <span>CREATE FIRST APPLICATION</span>
            </button>
          </div>
        ) : (
          <div className="activity-records-table-wrapper">
            <table className="activity-records-table">
              <thead>
                <tr>
                  <th>CANDIDATE</th>
                  <th>RECRUITER / COMPANY</th>
                  <th>ROLE</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((app) => (
                  <tr key={app._id || app.id}>
                    <td>
                      <div className="student-cell-lockup">
                        <div className="avatar-chip">
                          {(app.studentName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <span className="student-name-text">{app.studentName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="company-text">{app.companyName}</span>
                    </td>
                    <td>
                      <span className="role-text">{app.role}</span>
                    </td>
                    <td>
                      <span className="date-text">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Active'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${app.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quick Action Dock */}
      <div className="dashboard-action-dock">
        <button
          type="button"
          className="dock-action-btn"
          onClick={() => onNavigate('Students')}
        >
          <UserPlus size={18} />
          <span>MANAGE STUDENTS</span>
        </button>

        <button
          type="button"
          className="dock-action-btn"
          onClick={() => onNavigate('Companies')}
        >
          <Building2 size={18} />
          <span>PARTNER COMPANIES</span>
        </button>

        <button
          type="button"
          className="dock-action-btn"
          onClick={() => onNavigate('Applications')}
        >
          <FileCheck2 size={18} />
          <span>APPLICATION PIPELINE</span>
        </button>
      </div>
    </div>
  );
}
