import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Building2,
  DollarSign,
  Users,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  'Computer Engineering',
  'Information Technology',
  'Electronics & Telecom',
  'Mechanical Engineering',
  'Civil Engineering',
];

export const DrivesPage = () => {
  const { user, canManage, isStudent } = useAuth();
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Create Drive Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    jobTitle: '',
    jobDescription: '',
    jobType: 'Full-Time',
    jobLocation: 'Onsite / Hybrid',
    salaryPackage: '',
    minCgpa: '6.5',
    maxBacklogs: '0',
    eligibleDepartments: ['Computer Engineering', 'Information Technology'],
    graduationYears: [2025],
    applicationDeadline: '',
    status: 'Published',
  });

  // Applying state
  const [applyingId, setApplyingId] = useState(null);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (deptFilter) params.department = deptFilter;

      const res = await api.get('/drives', { params });
      if (res.data.success) {
        setDrives(res.data.drives || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load placement drives.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies?limit=100&isActive=true');
      if (res.data.success) {
        setCompanies(res.data.companies || []);
        if (res.data.companies.length > 0) {
          setFormData((prev) => ({ ...prev, company: res.data.companies[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, [search, statusFilter, deptFilter]);

  useEffect(() => {
    if (canManage) {
      fetchCompanies();
    }
  }, [canManage]);

  const handleApply = async (driveId) => {
    try {
      setApplyingId(driveId);
      const res = await api.post('/applications', { driveId });
      if (res.data.success) {
        toast.success('Application submitted successfully!');
        fetchDrives(); // Refresh drive eligibility & applied status
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Application failed.';
      const reasons = err.response?.data?.reasons;
      if (reasons && reasons.length > 0) {
        toast.error(`${msg}: ${reasons[0]}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setApplyingId(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        salaryPackage: Number(formData.salaryPackage),
        minCgpa: Number(formData.minCgpa),
        maxBacklogs: Number(formData.maxBacklogs),
      };

      const res = await api.post('/drives', payload);
      if (res.data.success) {
        toast.success('Placement drive created successfully!');
        setIsCreateOpen(false);
        fetchDrives();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create drive.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeptToggle = (dept) => {
    setFormData((prev) => {
      const exists = prev.eligibleDepartments.includes(dept);
      const updated = exists
        ? prev.eligibleDepartments.filter((d) => d !== dept)
        : [...prev.eligibleDepartments, dept];
      return { ...prev, eligibleDepartments: updated };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Placement Drives
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isStudent
              ? 'Browse open recruitment opportunities and check your verified eligibility.'
              : 'Create, publish, and oversee campus recruitment drives.'}
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Placement Drive
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by job title, company, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {canManage && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Closed">Closed</option>
            </select>
          )}

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <LoadingSpinner text="Loading placement drives..." />
      ) : drives.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No placement drives found"
          description="There are currently no placement drives matching your selected search criteria."
          actionText={canManage ? 'Create Drive' : null}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drives.map((drive) => {
            const eligibility = drive.eligibility;
            const isEligible = eligibility?.isEligible;
            const hasApplied = drive.hasApplied;

            return (
              <div
                key={drive._id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Top Card Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                        {drive.company?.industry || 'Technology'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5 line-clamp-1">
                        {drive.jobTitle}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 flex items-center mt-0.5">
                        <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {drive.company?.name}
                      </p>
                    </div>
                    <StatusBadge status={drive.status} />
                  </div>

                  {/* Compensation & Location */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Salary Package</p>
                      <p className="font-bold text-emerald-600 text-sm mt-0.5">
                        {drive.salaryPackage} LPA
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                      <p className="font-semibold text-slate-700 text-xs mt-0.5 truncate">
                        {drive.jobLocation}
                      </p>
                    </div>
                  </div>

                  {/* Requirements chips */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Min CGPA:</span>
                      <span className="font-bold text-slate-800">{drive.minCgpa}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Max Backlogs:</span>
                      <span className="font-bold text-slate-800">{drive.maxBacklogs}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Deadline:</span>
                      <span className="font-semibold text-rose-600">
                        {new Date(drive.applicationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Student Eligibility Callout */}
                  {isStudent && (
                    <div className="mt-3">
                      {isEligible ? (
                        <div className="flex items-center text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg font-medium border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
                          You meet all eligibility criteria!
                        </div>
                      ) : (
                        <div className="text-xs text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
                          <div className="flex items-center font-semibold">
                            <XCircle className="w-3.5 h-3.5 mr-1.5 text-rose-600 shrink-0" />
                            Not Eligible to Apply
                          </div>
                          {eligibility?.reasons && eligibility.reasons.length > 0 && (
                            <p className="text-[10px] text-rose-600 mt-1 line-clamp-2">
                              • {eligibility.reasons[0]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    to={`/drives/${drive._id}`}
                    className="font-semibold text-slate-700 hover:text-blue-600 flex items-center"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>

                  {isStudent ? (
                    hasApplied ? (
                      <span className="font-bold text-blue-600 flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Applied ({drive.applicationStatus})
                      </span>
                    ) : isEligible && drive.status === 'Published' ? (
                      <button
                        onClick={() => handleApply(drive._id)}
                        disabled={applyingId === drive._id}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {applyingId === drive._id ? 'Applying...' : 'Apply Now'}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-3.5 py-1.5 bg-slate-200 text-slate-400 font-semibold rounded-lg cursor-not-allowed"
                      >
                        Cannot Apply
                      </button>
                    )
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-500">
                      {drive.applicationsCount || 0} Applicants
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Drive Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Placement Drive"
        subtitle="Define job specifications, eligibility criteria, and deadlines"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company</label>
              <select
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Associate Software Engineer"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Description</label>
            <textarea
              required
              rows={3}
              placeholder="Outline responsibilities, required qualifications, and drive stages..."
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Salary (LPA)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="e.g. 8.5"
                value={formData.salaryPackage}
                onChange={(e) => setFormData({ ...formData, salaryPackage: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min CGPA</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.minCgpa}
                onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Backlogs</label>
              <input
                type="number"
                required
                value={formData.maxBacklogs}
                onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Department Selection Checkboxes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Eligible Academic Departments
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEPARTMENTS.map((dept) => (
                <label
                  key={dept}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.eligibleDepartments.includes(dept)}
                    onChange={() => handleDeptToggle(dept)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-800 text-xs">{dept}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                required
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Published">Published (Open for applications)</option>
                <option value="Draft">Draft (Hidden from students)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Drive'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
