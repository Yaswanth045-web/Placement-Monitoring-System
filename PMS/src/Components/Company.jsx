import React, { useEffect, useState, useMemo } from 'react';
import { Building2, Plus, Search, MapPin, Globe, Briefcase, Trash2, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { getAuthHeaders, getAuthToken } from '../utils/authService';
import '../Styles/Companies.css';

const API_URL = API_ENDPOINTS.companies;

export default function Company({ companies = [], setCompanies, currentUser, onOpenAuth }) {
  const isAdmin = currentUser?.role === 'admin';
  const isStudent = !isAdmin;
  const [form, setForm] = useState({
    name: '',
    location: '',
    industry: '',
    website: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  async function loadCompanies() {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to load companies');
      }

      setCompanies(result.data || []);
    } catch (err) {
      setError(err.message || 'Unable to connect to backend server');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (companies.length === 0) {
      loadCompanies();
    }
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!isAdmin) {
      setError('Administrator clearance required: Please switch to Admin Clearance or sign in with an Administrator account (admin@yaswanth.edu / admin123).');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError('Authentication token missing: Please sign in as an Administrator (admin@yaswanth.edu / admin123) to register corporate partners.');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!form.name.trim()) {
      setError('Company name is required.');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          location: form.location.trim(),
          industry: form.industry.trim(),
          website: form.website.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || (result.message && (result.message.includes('token') || result.message.includes('clearance')))) {
          throw new Error('Authentication required: Administrator clearance expired or missing. Please sign in as Administrator (admin@yaswanth.edu / admin123).');
        }
        throw new Error(result.message || 'Unable to add company');
      }

      setCompanies((prev) => [result.data, ...prev]);
      setForm({
        name: '',
        location: '',
        industry: '',
        website: '',
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err.message || 'Unable to save company');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!isAdmin) {
      setError('Administrator clearance required: Only Placement Officers can delete company profiles.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError('Authentication token missing: Please sign in as an Administrator (admin@yaswanth.edu / admin123).');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!window.confirm('Delete this partner company and its associated records?')) {
      return;
    }

    setError('');
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || (result.message && (result.message.includes('token') || result.message.includes('clearance')))) {
          throw new Error('Authentication required: Administrator clearance expired or missing. Please sign in as Administrator (admin@yaswanth.edu / admin123).');
        }
        throw new Error(result.message || 'Unable to delete company');
      }

      setCompanies((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      setError(err.message || 'Unable to delete company');
    }
  }

  // Extract unique industries for filter
  const industryOptions = useMemo(() => {
    const set = new Set();
    companies.forEach((c) => {
      if (c.industry) set.add(c.industry.trim());
    });
    return Array.from(set).sort();
  }, [companies]);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIndustry =
        industryFilter === 'ALL' ||
        (c.industry || '').trim() === industryFilter;

      return matchesSearch && matchesIndustry;
    });
  }, [companies, searchTerm, industryFilter]);

  return (
    <div className="management-page-container">
      {/* Header */}
      <div className="management-header-row">
        <div>
          <div className="mgmt-badge">CORPORATE NETWORK // MODULE 03</div>
          <h2 className="mgmt-title">PARTNER COMPANIES</h2>
          <p className="mgmt-subtitle">
            Recruiter directory, enterprise placement partnerships, and industry domains.
          </p>
        </div>

        <div className="mgmt-actions-group">
          <button
            type="button"
            className="btn-steel btn-sm"
            onClick={loadCompanies}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            <span>REFRESH</span>
          </button>

          {!isStudent ? (
            <button
              type="button"
              className="btn-rust btn-sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus size={16} />
              <span>{showAddForm ? 'CLOSE FORM' : '+ ADD COMPANY'}</span>
            </button>
          ) : (
            <div
              className="mgmt-role-tag mono"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                padding: '7px 12px',
                background: 'rgba(255, 138, 61, 0.1)',
                border: '1px solid rgba(255, 138, 61, 0.3)',
                borderRadius: '3px',
                color: '#ff8a3d',
                letterSpacing: '0.06em',
                fontWeight: 500,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff8a3d' }} />
              <span>STUDENT VIEW // READ-ONLY</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mgmt-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Add Company Section */}
      {!isStudent && showAddForm && (
        <section className="mgmt-form-card industrial-rivet-card">
          <div className="form-card-header">
            <h3 className="form-card-title">REGISTER PARTNER COMPANY</h3>
            <span className="form-card-code">FORM // CORP-NEW</span>
          </div>

          <form className="student-grid-form" onSubmit={handleSubmit}>
            <div className="form-field-group">
              <label htmlFor="company-name">Company Name *</label>
              <input
                id="company-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Google, Microsoft, Infosys"
                required
              />
            </div>

            <div className="form-field-group">
              <label htmlFor="company-location">Location / Headquarters</label>
              <input
                id="company-location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Bengaluru, Hyderabad, San Jose"
              />
            </div>

            <div className="form-field-group">
              <label htmlFor="company-industry">Industry Domain</label>
              <input
                id="company-industry"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                placeholder="e.g. Technology, Cloud Computing, FinTech"
              />
            </div>

            <div className="form-field-group">
              <label htmlFor="company-website">Website URL</label>
              <input
                id="company-website"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://company.com"
              />
            </div>

            <div className="form-buttons-row">
              <button
                type="button"
                className="btn-steel btn-sm"
                onClick={() => setShowAddForm(false)}
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="btn-rust btn-sm"
                disabled={saving}
              >
                {saving ? 'REGISTERING...' : 'REGISTER RECRUITER'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="mgmt-filter-toolbar industrial-rivet-card">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search company by name, location, or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-selects-row">
          <div className="filter-item">
            <span className="filter-label">INDUSTRY:</span>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">ALL DOMAINS</option>
              {industryOptions.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <section className="companies-section-wrapper">
        <div className="table-header-row">
          <div className="table-count-badge">
            SHOWING <strong>{filteredCompanies.length}</strong> OF <strong>{companies.length}</strong> REGISTERED RECRUITERS
          </div>
        </div>

        {loading ? (
          <div className="mgmt-loading-state industrial-rivet-card">
            <RefreshCw size={28} className="spin-icon" />
            <p>Loading company directory from MongoDB Atlas...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="mgmt-empty-state industrial-rivet-card">
            <Building2 size={40} className="empty-state-icon" />
            <h4>NO PARTNER COMPANIES REGISTERED</h4>
            <p>
              {companies.length === 0
                ? 'No recruiters registered yet. Click "+ Add Company" above to register campus recruiters.'
                : 'No companies match your current search query.'}
            </p>
            {!isStudent && companies.length === 0 && (
              <button
                type="button"
                className="btn-rust btn-sm"
                onClick={() => setShowAddForm(true)}
              >
                + ADD FIRST PARTNER
              </button>
            )}
          </div>
        ) : (
          <div className="company-cards-grid">
            {filteredCompanies.map((company) => {
              const companyId = company._id || company.id;
              return (
                <article className="company-card industrial-rivet-card" key={companyId}>
                  <div className="company-card-top">
                    <div className="company-logo-avatar">
                      {(company.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    {!isStudent && (
                      <button
                        type="button"
                        className="company-delete-icon-btn"
                        onClick={() => handleDelete(companyId)}
                        title="Delete company"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <h3 className="company-title">{company.name}</h3>

                  <div className="company-meta-list">
                    <div className="company-meta-item">
                      <Briefcase size={14} className="meta-icon" />
                      <span>{company.industry || 'Domain: General'}</span>
                    </div>

                    <div className="company-meta-item">
                      <MapPin size={14} className="meta-icon" />
                      <span>{company.location || 'Location: Remote / Multiple'}</span>
                    </div>
                  </div>

                  {company.website ? (
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="company-website-link"
                    >
                      <Globe size={13} />
                      <span>Visit Corporate Portal</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="no-website-text">Corporate site not listed</span>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}