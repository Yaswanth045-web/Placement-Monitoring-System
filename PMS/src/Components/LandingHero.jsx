import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Award, Building2, Users, TrendingUp, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import NovaRobotCanvas from './NovaRobotCanvas';
import '../Styles/LandingHero.css';

export default function LandingHero({
  onNavigate,
  totalStudents = 0,
  studentsPlaced = 0,
  totalCompanies = 0,
  placementRate = 0,
}) {
  /* ========================================================
     1. AUTO-TYPING PROMPT BOX (SECTION 1)
     ======================================================== */
  const prompts = [
    "Predict top CTC package trends and hiring demand for Computer Science.",
    "Match eligible candidates with upcoming Google & Microsoft hiring drives.",
    "Audit student resume for core engineering & full-stack vulnerabilities.",
    "What is our campus placement conversion rate and offer index this season?"
  ];

  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const fullText = prompts[currentPromptIdx];

    if (!isDeleting) {
      if (typingText.length < fullText.length) {
        timer = setTimeout(() => {
          setTypingText(fullText.substring(0, typingText.length + 1));
        }, 38);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2600);
      }
    } else {
      if (typingText.length > 0) {
        timer = setTimeout(() => {
          setTypingText(fullText.substring(0, Math.max(0, typingText.length - 2)));
        }, 14);
      } else {
        setIsDeleting(false);
        setCurrentPromptIdx((prev) => (prev + 1) % prompts.length);
        timer = setTimeout(() => {}, 250);
      }
    }

    return () => clearTimeout(timer);
  }, [typingText, isDeleting, currentPromptIdx, prompts]);

  const nextPromptText = prompts[(currentPromptIdx + 1) % prompts.length];

  /* ========================================================
     2. TAB CAROUSEL (SECTION 2: 10 TABS, 33vw WIDE)
     ======================================================== */
  const tabLabels = [
    "AI Placement Bot",
    "Resume Auditor",
    "Drive Scheduler",
    "CTC Analytics",
    "Skill Match Engine",
    "Company Radar",
    "Technical Evaluator",
    "Campus News AI",
    "Placement Auditor",
    "AI Placement Bot"
  ];

  const [activeTabIdx, setActiveTabIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTabIdx((prev) => (prev + 1) % tabLabels.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [tabLabels.length]);

  /* ========================================================
     3. REVIEWS SLIDER (SECTION 3)
     ======================================================== */
  const reviews = [
    {
      num: "01",
      name: "Dr. Arvind Rao",
      role: "Dean of Career Affairs, Halden Institute",
      quote: "“Campus placement operations and eligibility auditing used to be an administrative bottleneck. Yaswanth Placement solves this in seconds."
    },
    {
      num: "02",
      name: "Rhea Okafor",
      role: "Head of University Hiring, Tessel Network",
      quote: "Yaswanth Placement is a vital asset for tech recruiters, simplifying student shortlisting and verified profile review effortlessly."
    },
    {
      num: "03",
      name: "Mara Elling",
      role: "Director of Talent, Northline Labs",
      quote: "“The fastest way we have found to go from opening a campus drive to shortlisting and hiring high-tier talent."
    }
  ];

  const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
  const [reviewFading, setReviewFading] = useState(false);

  const switchReview = (newIdx) => {
    setReviewFading(true);
    setTimeout(() => {
      setCurrentReviewIdx(newIdx);
      setReviewFading(false);
    }, 450);
  };

  const curReview = reviews[currentReviewIdx];
  const nextReview = reviews[(currentReviewIdx + 1) % reviews.length];

  return (
    <div className="nova-landing-page">
      {/* 3D Fixed Robot Canvas */}
      <NovaRobotCanvas />

      {/* ========================================================
          SECTION 1: INTRO (100vh)
          ======================================================== */}
      <section className="nova-section section-intro" id="intro">
        {/* Floating Prompt Box */}
        <div className="intro-prompt-box-wrap">
          <div className="prompt-tab">“</div>
          <div className="prompt-box">
            <div className="corner-bracket cb-tl" />
            <div className="corner-bracket cb-tr" />
            <div className="corner-bracket cb-bl" />
            <div className="corner-bracket cb-br" />
            <span className="prompt-text mono">{typingText}</span>
            <span className="typing-caret" />
            <div className="prompt-next-preview mono">NEXT: {nextPromptText}</div>
          </div>
        </div>

        {/* Hairline rule to 83% guide */}
        <div className="intro-top-rule" />

        {/* Feature List */}
        <div className="intro-feature-list">
          <div className="feature-row mono">
            <span className="feature-dot" />
            <span className="feature-label">CAMPUS DRIVES</span>
          </div>
          <div className="feature-row mono">
            <span className="feature-dot" />
            <span className="feature-label">CTC ANALYTICS</span>
          </div>
          <div className="feature-row mono">
            <span className="feature-dot" />
            <span className="feature-label">AI RESUME AUDIT</span>
          </div>
          <div className="feature-row mono dim">
            <span className="feature-dot" />
            <span className="feature-label">AND MUCH MORE</span>
          </div>
        </div>

        {/* Bottom Left Headline */}
        <div className="intro-bottom-left">
          <span className="unleash-tag mono">UNLEASH THE POWER OF</span>
          <div className="headline-stack">
            {/* Thinking with 45deg cut bottom-right corner */}
            <div className="headline-line headline-box-thinking">
              Placement
            </div>
            {/* Machines with amber->orange->pink border */}
            <div className="headline-line headline-box-machines">
              Intelligence
            </div>
          </div>

          <div className="intro-cta-row">
            <button
              type="button"
              className="btn-rust mono"
              onClick={() => onNavigate('Dashboard')}
            >
              <span>EXPLORE DASHBOARD</span>
              <ArrowUpRight size={16} />
            </button>
            <button
              type="button"
              className="btn-steel mono"
              onClick={() => onNavigate('Students')}
            >
              <Award size={15} />
              <span>VIEW PLACEMENTS</span>
            </button>
          </div>
        </div>

        {/* Sub line */}
        <p className="intro-sub-line">
          Your personal expert in all campus placements &amp; career analytics.
        </p>

        {/* Scroll link */}
        <a href="#product" className="intro-scroll-link mono">
          <span>SCROLL</span>
          <div className="scroll-bracket-box">
            <div className="corner-bracket cb-tl" />
            <div className="corner-bracket cb-tr" />
            <div className="corner-bracket cb-bl" />
            <div className="corner-bracket cb-br" />
            <span className="scroll-arrow-icon">↓</span>
          </div>
        </a>

        {/* Bottom rule from 50% to right edge at bottom 14% */}
        <div className="intro-bottom-rule" />
      </section>

      {/* Snapshot Metrics Ticker Card */}
      <div className="metrics-ticker-wrapper">
        <div className="metrics-ticker-panel industrial-rivet-card">
          <div className="metric-ticker-item">
            <div className="metric-icon-box">
              <Users size={20} />
            </div>
            <div className="metric-data-lockup">
              <span className="metric-value">{totalStudents}</span>
              <span className="metric-label mono">ENROLLED CANDIDATES</span>
            </div>
          </div>

          <div className="metric-divider" />

          <div className="metric-ticker-item">
            <div className="metric-icon-box placed-icon">
              <Award size={20} />
            </div>
            <div className="metric-data-lockup">
              <span className="metric-value placed-value">{studentsPlaced}</span>
              <span className="metric-label mono">PLACED GRADUATES</span>
            </div>
          </div>

          <div className="metric-divider" />

          <div className="metric-ticker-item">
            <div className="metric-icon-box">
              <Building2 size={20} />
            </div>
            <div className="metric-data-lockup">
              <span className="metric-value">{totalCompanies}</span>
              <span className="metric-label mono">HIRING COMPANIES</span>
            </div>
          </div>

          <div className="metric-divider" />

          <div className="metric-ticker-item">
            <div className="metric-icon-box rate-icon">
              <TrendingUp size={20} />
            </div>
            <div className="metric-data-lockup">
              <span className="metric-value rate-value">{placementRate}%</span>
              <span className="metric-label mono">PLACEMENT RATE</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 2: PRODUCT (100vh)
          ======================================================== */}
      <section className="nova-section section-product" id="product">
        {/* 74px Tab Carousel */}
        <div className="product-carousel-strip">
          <div
            className="product-carousel-track"
            style={{ transform: `translateX(-${activeTabIdx * 33}vw)` }}
          >
            {tabLabels.map((label, idx) => {
              const numFormatted = String(idx + 1).padStart(2, '0');
              const isActive = idx === activeTabIdx;
              const isPassed = idx < activeTabIdx;
              return (
                <div
                  key={idx}
                  className={`carousel-tab mono ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                >
                  <div className="corner-bracket cb-tl" />
                  <div className="corner-bracket cb-tr" />
                  <div className="corner-bracket cb-bl" />
                  <div className="corner-bracket cb-br" />
                  <span className="carousel-tab-num">[ {numFormatted} ]</span>
                  <span className="carousel-tab-label">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2 Headline */}
        <div className="product-headline-block">
          <span className="product-dots-tag mono">··</span>
          <div className="product-gateway-box">Your Gateway</div>
          <span className="product-sub-title">To Campus AI</span>
        </div>
      </section>

      {/* ========================================================
          SECTION 3: REVIEWS (100vh)
          ======================================================== */}
      <section className="nova-section section-reviews" id="reviews">
        {/* Header strip */}
        <div className="reviews-header-strip">
          <div className="tstmnl-badge mono">TSTMNL <span>[ {curReview.num} ]</span></div>
          <div className="reviews-avatar-box">
            {/* Inline SVG avatar: a figure in front of a brick wall */}
            <svg viewBox="0 0 56 56" width="56" height="56" fill="none">
              <rect width="56" height="56" fill="#ded9d0" />
              <path d="M0 14 H56 M0 28 H56 M0 42 H56" stroke="#c8c2b7" strokeWidth="1.2" />
              <path d="M14 0 V14 M42 0 V14 M28 14 V28 M14 28 V42 M42 28 V42 M28 42 V56" stroke="#c8c2b7" strokeWidth="1.2" />
              <circle cx="28" cy="22" r="8.5" fill="#2a2928" />
              <path d="M13 52 C13 36 21 34 28 34 C35 34 43 36 43 52 Z" fill="#2a2928" />
              <circle cx="28" cy="21" r="3.2" fill="#ff8a3d" />
            </svg>
          </div>
          <div
            className="reviews-meta"
            style={{
              opacity: reviewFading ? 0 : 1,
              transform: reviewFading ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 0.45s ease, transform 0.45s ease'
            }}
          >
            <span className="reviews-name">{curReview.name}</span>
            <span className="mono">·</span>
            <span className="reviews-role mono">{curReview.role}</span>
          </div>
        </div>

        {/* Quote */}
        <div
          className="reviews-quote-wrap"
          style={{
            opacity: reviewFading ? 0 : 1,
            transform: reviewFading ? 'translateY(10px)' : 'translateY(0)',
            transition: 'opacity 0.45s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1)'
          }}
        >
          <div className="reviews-quote-text">
            {curReview.quote}
          </div>
          <button
            type="button"
            className="reviews-action-link mono"
            onClick={() => onNavigate('Dashboard')}
          >
            <span className="action-rule" />
            <span>Try for yourself (Click Here)</span>
          </button>
        </div>

        {/* Nav Arrows */}
        <div className="reviews-nav-arrows">
          <button
            type="button"
            className="review-arrow-btn"
            onClick={() => switchReview((currentReviewIdx - 1 + reviews.length) % reviews.length)}
            aria-label="Previous Review"
          >
            ←
          </button>
          <button
            type="button"
            className="review-arrow-btn"
            onClick={() => switchReview((currentReviewIdx + 1) % reviews.length)}
            aria-label="Next Review"
          >
            →
          </button>
        </div>

        {/* Ghost Next Review */}
        <div className="reviews-ghost-wrap">
          <div className="reviews-ghost-text">
            {nextReview.quote}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="nova-footer mono">
        YASWANTH PLACEMENT · 2026
      </footer>
    </div>
  );
}
