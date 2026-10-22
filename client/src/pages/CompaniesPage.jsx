import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import {
  Building2,
  Plus,
  Search,
  Globe,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompaniesPage = () => {
  const { canManage } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    industry: 'Software & IT',
    website: '',
    hrContactName: '',
    hrContactEmail: '',
    hrContactPhone: '',
    location: 'Pan India',
    description: '',
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (industryFilter) params.industry = industryFilter;

      const res = await api.get('/companies', { params });
      if (res.data.success) {
        setCompanies(res.data.companies || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, industryFilter]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      industry: 'Software & IT',
      website: '',
      hrContactName: '',
      hrContactEmail: '',
      hrContactPhone: '',
      location: 'Pan India',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setEditingId(comp._id);
    setForm({
      name: comp.name,
      industry: comp.industry,
      website: comp.website || '',
      hrContactName: comp.hrContactName,
      hrContactEmail: comp.hrContactEmail,
      hrContactPhone: comp.hrContactPhone || '',
      location: comp.location || 'Pan India',
      description: comp.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingId) {
        await api.patch(`/companies/${editingId}`, form);
        toast.success('Company profile updated successfully.');
      } else {
        await api.post('/companies', form);
        toast.success('Company created successfully.');
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove or deactivate company '${name}'?`)) return;
    try {
      const res = await api.delete(`/companies/${id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Company removed.');
        fetchCompanies();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete operation failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Hiring Partners & Companies
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registered corporate recruiters, industry classifications, and HR points of contact.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Register Company
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search company name, industry, HR contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Industries</option>
          <option value="Software & IT">Software & IT</option>
          <option value="IT Services & Consulting">IT Services & Consulting</option>
          <option value="Cloud Computing & IT">Cloud Computing</option>
          <option value="Management & Technology Consulting">Consulting</option>
          <option value="Core Engineering & Infrastructure">Core Engineering</option>
        </select>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <LoadingSpinner text="Loading registered companies..." />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies registered"
          description="Register your corporate recruitment partners to start launching placement drives."
          actionText={canManage ? 'Register Company' : null}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((comp) => (
            <div
              key={comp._id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {comp.industry}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {comp.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {comp.location || 'Multiple Locations'}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      comp.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {comp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {comp.description && (
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                )}

                {/* HR Details */}
                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">
                    HR: {comp.hrContactName}
                  </p>
                  <p className="flex items-center text-slate-500 text-[11px]">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {comp.hrContactEmail}
                  </p>
                  {comp.hrContactPhone && (
                    <p className="flex items-center text-slate-500 text-[11px]">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {comp.hrContactPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom stats and action footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 flex items-center">
                  <Briefcase className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  {comp.drivesCount || 0} Drives
                </span>

                <div className="flex items-center space-x-1">
                  {comp.website && (
                    <a
                      href={comp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Visit Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {canManage && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(comp)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(comp._id, comp.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Deactivate / Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Company Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Company Information' : 'Register Corporate Recruiter'}
        subtitle="Manage company background, industry, and HR communication details"
      >
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Google India"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry Sector</label>
              <select
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="Software & IT">Software & IT</option>
                <option value="IT Services & Consulting">IT Services & Consulting</option>
                <option value="Cloud Computing & IT">Cloud Computing</option>
                <option value="Management & Technology Consulting">Management Consulting</option>
                <option value="Core Engineering & Infrastructure">Core Engineering</option>
                <option value="FinTech & Banking">FinTech & Banking</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Office Location</label>
              <input
                type="text"
                placeholder="e.g. Bangalore / Pune"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">HR Contact Person</label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram Mehta"
                value={form.hrContactName}
                onChange={(e) => setForm({ ...form, hrContactName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">HR Contact Email</label>
              <input
                type="email"
                required
                placeholder="e.g. hr@company.com"
                value={form.hrContactEmail}
                onChange={(e) => setForm({ ...form, hrContactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+91 9822..."
                value={form.hrContactPhone}
                onChange={(e) => setForm({ ...form, hrContactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Careers Website URL</label>
              <input
                type="url"
                placeholder="https://company.com/careers"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Brief overview of company operations..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
            >
              {isSubmitting ? 'Saving...' : editingId ? 'Update Company' : 'Register'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
