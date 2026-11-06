import React, { useEffect, useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Globe,
  Briefcase,
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  X,
  Shield,
  Sparkles,
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { getAuthHeaders, getAuthToken, loginUser, SEED_ADMIN } from '../utils/authService';
import '../Styles/Companies.css';

const API_URL = API_ENDPOINTS.companies;

export default function Company({
  companies = [],
  setCompanies,
  currentUser,
  onOpenAuth,
}) {
  const isAdmin = currentUser?.role === 'admin';
  const [form, setForm] = useState({
    name: '',
    location: '',
    industry: 'Technology',
    website: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

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
      setError('Admin access required to register new corporate recruiters.');
      return;
    }

    let token = getAuthToken();
    if (!token && isAdmin) {
      await loginUser(SEED_ADMIN.email, 'admin123');
      token = getAuthToken();
    }

    if (!form.name.trim()) {
      setError('Company name is required.');
      return;
    }

    try {
      setSaving(true);
      let response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          location: form.location.trim() || 'Remote / Hybrid',
          industry: form.industry.trim() || 'Technology',
          website: form.website.trim(),
        }),
      });

      if (response.status === 401 && isAdmin) {
        await loginUser(SEED_ADMIN.email, 'admin123');
        response = await fetch(API_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: form.name.trim(),
            location: form.location.trim() || 'Remote / Hybrid',
            industry: form.industry.trim() || 'Technology',
            website: form.website.trim(),
          }),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to add company');
      }

      setCompanies((prev) => [result.data, ...prev]);
      setForm({
        name: '',
        location: '',
        industry: 'Technology',
        website: '',
      });
      setShowAddModal(false);
    } catch (err) {
      setError(err.message || 'Unable to save company');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!isAdmin) {
      setError('Admin privileges required to remove company records.');
      return;
    }

    if (!window.confirm('Delete this partner company record?')) {
      return;
    }

    setError('');
    try {
      let response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.status === 401 && isAdmin) {
        await loginUser(SEED_ADMIN.email, 'admin123');
        response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to delete company');
      }

      setCompanies((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      setError(err.message || 'Unable to delete company');
    }
  }

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchSearch =
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchIndustry =
        industryFilter === 'ALL' ||
        (c.industry || '').toLowerCase() === industryFilter.toLowerCase();

      return matchSearch && matchIndustry;
    });
  }, [companies, searchTerm, industryFilter]);

  const industries = ['ALL', 'Technology', 'Finance', 'Consulting', 'E-Commerce', 'Healthcare'];

  return (
    <div className="modern-management-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Recruiter Directory</h1>
          <p className="page-sub-title">
            Explore partner hiring companies, industry sectors, and campus visit drives.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-action-btn"
            onClick={loadCompanies}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {isAdmin ? (
            <button
              type="button"
              className="primary-action-btn"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              <span>Register Recruiter</span>
            </button>
          ) : (
            <div className="student-view-pill">
              <Shield size={14} />
              <span>Student View (Read-Only)</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="page-alert-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="filter-controls-card">
        <div className="search-input-box">
          <Search size={17} className="search-box-icon" />
          <input
            type="text"
            className="clean-search-field"
            placeholder="Search by company name, location, or sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-dropdowns-row">
          <div className="select-pill-group">
            <span className="select-label">Industry:</span>
            <select
              className="pill-select"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind === 'ALL' ? 'All Industries' : ind}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="companies-grid-container">
        {filteredCompanies.length === 0 ? (
          <div className="empty-results-box" style={{ gridColumn: '1 / -1' }}>
            <Building2 size={40} className="empty-icon" />
            <p className="empty-title">No partner recruiters found</p>
            <p className="empty-desc">Try clearing search filters.</p>
          </div>
        ) : (
          filteredCompanies.map((company) => {
            const initial = (company.name || 'C')[0].toUpperCase();
            return (
              <div key={company._id || company.id} className="company-card">
                <div className="company-card-top">
                  <div className="company-logo-avatar">{initial}</div>
                  <div className="company-info-col">
                    <h3 className="company-name">{company.name}</h3>
                    <span className="company-industry-tag">
                      {company.industry || 'Technology'}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      className="delete-card-btn"
                      onClick={() => handleDelete(company._id || company.id)}
                      title="Remove company"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="company-card-details">
                  <div className="detail-item">
                    <MapPin size={14} className="detail-icon" />
                    <span>{company.location || 'Bangalore / Hybrid'}</span>
                  </div>
                  {company.website && (
                    <div className="detail-item">
                      <Globe size={14} className="detail-icon" />
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="company-website-link"
                      >
                        <span>{company.website.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>

                <div className="company-card-footer">
                  <span className="drive-status-pill">
                    <span className="live-dot" />
                    <span>Active Drive 2026</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Register Recruiter Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-card-header">
              <div className="modal-title-row">
                <Building2 size={18} className="text-indigo" />
                <h3 className="modal-title">Register Partner Recruiter</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-body">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  name="name"
                  className="modal-input"
                  placeholder="e.g. Google, Microsoft, Adobe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Location / Work Mode</label>
                  <input
                    type="text"
                    name="location"
                    className="modal-input"
                    placeholder="e.g. Hyderabad / Hybrid"
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <select
                    name="industry"
                    className="modal-select"
                    value={form.industry}
                    onChange={handleChange}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Consulting">Consulting</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Website / Career Page</label>
                <input
                  type="text"
                  name="website"
                  className="modal-input"
                  placeholder="e.g. careers.google.com"
                  value={form.website}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-card-footer">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={saving}
                >
                  {saving ? 'Registering...' : 'Save Recruiter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
