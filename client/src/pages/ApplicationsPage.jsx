import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import {
  FileText,
  Search,
  Filter,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronRight,
  Clock,
  Briefcase,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ApplicationsPage = () => {
  const { user, canManage, isStudent } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/applications', { params });
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw your application?')) return;
    try {
      const res = await api.patch(`/applications/${applicationId}/status`, {
        status: 'Withdrawn',
        comment: 'Withdrawn by student.',
      });
      if (res.data.success) {
        toast.success('Application withdrawn successfully.');
        fetchApplications();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed.');
    }
  };

  const filteredApps = applications.filter((app) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      app.drive?.jobTitle?.toLowerCase().includes(s) ||
      app.company?.name?.toLowerCase().includes(s) ||
      app.student?.user?.name?.toLowerCase().includes(s) ||
      app.student?.prn?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {isStudent ? 'My Applications' : 'Application Pipeline'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isStudent
              ? 'Track recruitment stages, interview invitations, and selection outcomes.'
              : 'Review submitted applications, manage interview stages, and extend offers.'}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={isStudent ? 'Search drives...' : 'Search student, PRN, company...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Workflow Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="In Process">In Process</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <LoadingSpinner text="Loading applications..." />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description="There are no applications matching your filter parameters."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Drive & Company</th>
                  {!isStudent && <th className="py-3 px-4">Candidate</th>}
                  {!isStudent && <th className="py-3 px-4">Department & CGPA</th>}
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {app.drive?.jobTitle || 'Role'}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center mt-0.5 font-medium">
                          <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {app.company?.name} • {app.drive?.salaryPackage} LPA
                        </p>
                      </div>
                    </td>

                    {!isStudent && (
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">
                          {app.student?.user?.name || 'Student'}
                        </p>
                        <p className="text-slate-500 font-mono text-[11px]">
                          {app.student?.prn}
                        </p>
                      </td>
                    )}

                    {!isStudent && (
                      <td className="py-3.5 px-4 text-slate-600">
                        <p>{app.student?.department}</p>
                        <p className="text-[11px] font-bold text-slate-800">
                          CGPA: {app.student?.cgpa}
                        </p>
                      </td>
                    )}

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/applications/${app._id}`}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors inline-flex items-center"
                      >
                        Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </Link>

                      {isStudent && ['Applied', 'Shortlisted'].includes(app.status) && (
                        <button
                          onClick={() => handleWithdraw(app._id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
