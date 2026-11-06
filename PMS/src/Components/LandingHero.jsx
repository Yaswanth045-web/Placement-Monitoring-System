import React from 'react';
import {
  ArrowRight,
  Award,
  Building2,
  Users,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  ChevronRight,
  Compass,
} from 'lucide-react';
import '../Styles/LandingHero.css';

export default function LandingHero({
  onNavigate,
  totalStudents = 0,
  studentsPlaced = 0,
  totalCompanies = 0,
  placementRate = 0,
  currentUser,
}) {
  const handleCtaClick = () => {
    if (currentUser) {
      onNavigate('Dashboard');
    } else {
      onNavigate('Login');
    }
  };

  const recruiters = [
    'Google',
    'Microsoft',
    'Amazon',
    'Adobe',
    'Atlassian',
    'Oracle',
    'Infosys',
    'TCS',
  ];

  return (
    <div className="modern-landing-container">
      {/* Hero Section */}
      <section className="landing-hero-section">
        <div className="hero-pill">
          <Sparkles size={14} className="hero-pill-icon" />
          <span>Campus Career & Recruitment Portal</span>
        </div>

        <h1 className="hero-headline">
          Empowering Next-Gen <span className="hero-gradient-text">Campus Placements</span>
        </h1>

        <p className="hero-subtext">
          A modern, unified platform for students, placement cells, and corporate recruiters.
          Streamline campus drives, automate eligibility verification, and track interview pipelines.
        </p>

        <div className="hero-cta-group">
          <button
            type="button"
            className="hero-primary-cta"
            onClick={handleCtaClick}
          >
            <span>{currentUser ? 'Open Dashboard' : 'Enter Portal / Sign In'}</span>
            <ArrowRight size={18} />
          </button>

          {currentUser && (
            <button
              type="button"
              className="hero-secondary-cta"
              onClick={() => onNavigate('Students')}
            >
              <span>Explore Students</span>
            </button>
          )}
        </div>
      </section>

      {/* Metric Counters Card */}
      <section className="landing-stats-grid">
        <div className="stat-card">
          <span className="stat-value">{placementRate || 94}%</span>
          <span className="stat-label">Placement Conversion</span>
          <span className="stat-hint">Across all engineering branches</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalCompanies > 0 ? totalCompanies : '180+'}</span>
          <span className="stat-label">Partner Recruiters</span>
          <span className="stat-hint">Top global tech & consulting firms</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">₹42 LPA</span>
          <span className="stat-label">Highest Package</span>
          <span className="stat-hint">Current 2026 hiring season</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">₹14.2 LPA</span>
          <span className="stat-label">Average CTC</span>
          <span className="stat-hint">Consistent year-on-year growth</span>
        </div>
      </section>

      {/* Recruiter Marquee / Grid */}
      <section className="recruiters-marquee-section">
        <span className="recruiters-label">Trusted by Leading Global Employers</span>
        <div className="recruiters-logo-row">
          {recruiters.map((company) => (
            <div key={company} className="recruiter-badge">
              <Building2 size={16} className="recruiter-icon" />
              <span>{company}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="landing-features-section">
        <div className="section-header-centered">
          <h2 className="features-title">Engineered for Seamless Career Operations</h2>
          <p className="features-sub">
            Built from the ground up to replace clumsy spreadsheets with intelligent recruitment workflows.
          </p>
        </div>

        <div className="features-card-grid">
          <div className="feature-card">
            <div className="feature-icon-box bg-indigo">
              <CheckCircle2 size={22} />
            </div>
            <h3 className="feature-card-title">Automated Eligibility Auditing</h3>
            <p className="feature-card-desc">
              Instantly match student profiles against company eligibility criteria including CGPA,
              branch, backlogs, and technical proficiencies.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box bg-emerald">
              <TrendingUp size={22} />
            </div>
            <h3 className="feature-card-title">Real-Time Application Pipeline</h3>
            <p className="feature-card-desc">
              Track candidate progression across online assessments, technical interviews,
              HR rounds, and final offer releases in real-time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box bg-sky">
              <Building2 size={22} />
            </div>
            <h3 className="feature-card-title">Partner Recruiter Directory</h3>
            <p className="feature-card-desc">
              Manage corporate relations, hiring drive schedules, JD repositories, and
              salary package analytics in a unified dashboard.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box bg-amber">
              <ShieldCheck size={22} />
            </div>
            <h3 className="feature-card-title">Verified Candidate Dossier</h3>
            <p className="feature-card-desc">
              Maintain tamper-proof academic credentials, resume links, GitHub repositories,
              and project portfolios ready for recruiter review.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
