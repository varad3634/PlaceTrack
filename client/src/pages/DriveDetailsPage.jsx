import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  Users,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DriveDetailsPage = () => {
  const { id } = useParams();
  const { user, canManage, isStudent } = useAuth();
  const [drive, setDrive] = useState(null);
  const [cohortSummary, setCohortSummary] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'cohort' | 'applicants'
  const [isApplying, setIsApplying] = useState(false);

  const fetchDriveDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/drives/${id}`);
      if (res.data.success) {
        setDrive(res.data.drive);
      }

      if (canManage) {
        // Fetch cohort eligibility breakdown
        const cohortRes = await api.get(`/drives/${id}/eligibility`);
        if (cohortRes.data.success) {
          setCohortSummary(cohortRes.data);
        }

        // Fetch applications for this drive
        const appsRes = await api.get(`/applications?drive=${id}`);
        if (appsRes.data.success) {
          setApplications(appsRes.data.applications || []);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load placement drive details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriveDetails();
  }, [id]);

  const handleApply = async () => {
    try {
      setIsApplying(true);
      const res = await api.post('/applications', { driveId: drive._id });
      if (res.data.success) {
        toast.success('Application submitted successfully!');
        fetchDriveDetails();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application.';
      toast.error(msg);
    } finally {
      setIsApplying(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.patch(`/drives/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Drive status updated to '${newStatus}'.`);
        fetchDriveDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading placement drive..." size="large" />;
  if (!drive) return <div className="p-8 text-center text-slate-500">Placement drive not found.</div>;

  const eligibility = drive.eligibility;
  const isEligible = eligibility?.isEligible;
  const hasApplied = drive.hasApplied;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/drives"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to all placement drives
        </Link>
      </div>

      {/* Main Drive Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-xl shrink-0">
              {drive.company?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {drive.jobTitle}
                </h1>
                <StatusBadge status={drive.status} />
              </div>
              <p className="text-sm font-semibold text-slate-600 mt-1 flex items-center">
                <Building2 className="w-4 h-4 mr-1 text-slate-400" />
                {drive.company?.name} • {drive.company?.industry}
              </p>
            </div>
          </div>

          {/* Administrative Status Selector */}
          {canManage && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={drive.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Closed">Closed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Package</p>
            <p className="text-base font-bold text-emerald-600 mt-0.5">
              {drive.salaryPackage} LPA
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Job Type</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {drive.jobType}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {drive.jobLocation}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Deadline</p>
            <p className="text-sm font-semibold text-rose-600 mt-0.5">
              {new Date(drive.applicationDeadline).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Student Eligibility & Application Action Bar */}
      {isStudent && (
        <div
          className={`rounded-xl p-5 border ${
            hasApplied
              ? 'bg-blue-50/70 border-blue-200'
              : isEligible
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-rose-50/70 border-rose-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                {hasApplied ? (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                ) : isEligible ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                <h3 className="text-sm font-bold text-slate-900">
                  {hasApplied
                    ? `Application Submitted: ${drive.application?.status || 'Applied'}`
                    : isEligible
                    ? 'You are eligible to apply for this drive!'
                    : 'Eligibility Criteria Not Met'}
                </h3>
              </div>

              {!isEligible && eligibility?.reasons && (
                <ul className="mt-2 space-y-1 text-xs text-rose-700 pl-7 list-disc">
                  {eligibility.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}

              {hasApplied && (
                <p className="text-xs text-blue-700 mt-1 pl-7">
                  You submitted your application on{' '}
                  {new Date(drive.application?.appliedAt).toLocaleDateString()}.
                </p>
              )}
            </div>

            <div>
              {hasApplied ? (
                <Link
                  to={`/applications/${drive.application?._id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  View My Application
                </Link>
              ) : isEligible && drive.status === 'Published' ? (
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {isApplying ? 'Submitting...' : 'Apply for this Role'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Tabs navigation for TPO/Admin */}
      {canManage && (
        <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Drive Specifications
          </button>
          <button
            onClick={() => setActiveTab('cohort')}
            className={`pb-3 transition-colors ${
              activeTab === 'cohort'
                ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Eligibility Cohort Analysis ({cohortSummary?.eligibleCount || 0} Qualified)
          </button>
          <button
            onClick={() => setActiveTab('applicants')}
            className={`pb-3 transition-colors ${
              activeTab === 'applicants'
                ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Applications ({applications.length})
          </button>
        </div>
      )}

      {/* Tab 1: Overview */}
      {(activeTab === 'overview' || isStudent) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Job Description & Skills */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 mb-3">Job Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {drive.jobDescription}
              </p>
            </div>

            {drive.requiredSkills?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-800 mb-3">
                  Required Competencies & Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {drive.requiredSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Explicit Eligibility Thresholds */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs h-fit space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
              Eligibility Thresholds
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">
                  Academic Merit (Minimum CGPA)
                </p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {drive.minCgpa} / 10.0
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">
                  Permitted Active Backlogs
                </p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  Max {drive.maxBacklogs} backlog(s) allowed
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">
                  Target Graduation Years
                </p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {drive.graduationYears?.join(', ')} Batch
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px] mb-1">
                  Eligible Departments
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {drive.eligibleDepartments?.map((d) => (
                    <span
                      key={d}
                      className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 font-medium rounded-md border border-blue-100"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cohort Analysis (Admin/TPO only) */}
      {canManage && activeTab === 'cohort' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-xs text-slate-500 font-semibold uppercase">Total Students Evaluated</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {cohortSummary?.totalEvaluated || 0}
              </h3>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 text-center">
              <p className="text-xs text-emerald-700 font-semibold uppercase">Qualified Cohort</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                {cohortSummary?.eligibleCount || 0}
              </h3>
            </div>
            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 text-center">
              <p className="text-xs text-rose-700 font-semibold uppercase">Disqualified Cohort</p>
              <h3 className="text-2xl font-bold text-rose-700 mt-1">
                {cohortSummary?.ineligibleCount || 0}
              </h3>
            </div>
          </div>

          {/* Qualified students table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">
                Eligible Student Candidates ({cohortSummary?.eligibleCount || 0})
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-4">PRN</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4 text-center">CGPA</th>
                    <th className="py-2.5 px-4 text-center">Backlogs</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cohortSummary?.eligible?.map(({ student }) => (
                    <tr key={student._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {student.user?.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {student.prn}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {student.department}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {student.cgpa}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {student.activeBacklogs}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Eligible
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Applications list */}
      {canManage && activeTab === 'applicants' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">
              Submitted Applications ({applications.length})
            </h4>
          </div>
          {applications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No applications have been submitted to this drive yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Applicant</th>
                    <th className="py-2.5 px-4">PRN</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4">Applied Date</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {app.student?.user?.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {app.student?.prn}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {app.student?.department}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/applications/${app._id}`}
                          className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md font-semibold text-xs"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
