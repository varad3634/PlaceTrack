import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Plus,
  Send,
  User,
  MapPin,
  FileCheck,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const { user, canManage, isStudent } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status Change State
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Interview Schedule Modal
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    roundNumber: 1,
    roundName: 'Technical Interview',
    scheduledDate: '',
    venueOrLink: 'Placement Seminar Hall 1 / Online',
    interviewerName: '',
  });

  // Offer Modal
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({
    jobRole: '',
    packageLpa: '',
    responseDeadline: '',
  });

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/applications/${id}`);
      if (res.data.success) {
        setData(res.data);
        setNewStatus(res.data.application?.status);
        if (res.data.application?.drive) {
          setOfferForm({
            jobRole: res.data.application.drive.jobTitle,
            packageLpa: res.data.application.drive.salaryPackage,
            responseDeadline: '',
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingStatus(true);
      const res = await api.patch(`/applications/${id}/status`, {
        status: newStatus,
        comment: statusComment,
      });
      if (res.data.success) {
        toast.success(`Application status updated to '${newStatus}'.`);
        setStatusComment('');
        fetchApplication();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status transition failed.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/applications/${id}/interviews`, interviewForm);
      if (res.data.success) {
        toast.success('Interview round scheduled successfully!');
        setIsInterviewModalOpen(false);
        fetchApplication();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule interview.');
    }
  };

  const handleInterviewOutcome = async (interviewId, status) => {
    const feedback = window.prompt(`Enter evaluation notes / feedback for status '${status}':`) || '';
    try {
      const res = await api.patch(`/interviews/${interviewId}`, { status, feedback });
      if (res.data.success) {
        toast.success(`Interview marked as '${status}'.`);
        fetchApplication();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update interview outcome.');
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/applications/${id}/offer`, {
        jobRole: offerForm.jobRole,
        packageLpa: Number(offerForm.packageLpa),
        responseDeadline: offerForm.responseDeadline || null,
      });
      if (res.data.success) {
        toast.success('Job offer generated and extended successfully!');
        setIsOfferModalOpen(false);
        fetchApplication();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate offer.');
    }
  };

  const handleOfferResponse = async (offerId, responseStatus) => {
    if (!window.confirm(`Are you sure you want to mark this offer as '${responseStatus}'?`)) return;
    try {
      const res = await api.patch(`/offers/${offerId}`, { status: responseStatus });
      if (res.data.success) {
        toast.success(`Offer marked as '${responseStatus}'. Congratulations!`);
        fetchApplication();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update offer response.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading application..." size="large" />;
  if (!data?.application) return <div className="p-8 text-center text-slate-500">Application not found.</div>;

  const { application, interviewRounds = [], offer } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/applications"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to applications list
        </Link>
      </div>

      {/* Main Application Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {application.drive?.jobTitle || 'Role'}
              </h1>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-sm font-semibold text-slate-600 mt-1 flex items-center">
              <Building2 className="w-4 h-4 mr-1 text-slate-400" />
              {application.company?.name} • Package: {application.drive?.salaryPackage} LPA
            </p>
          </div>

          {/* Quick Actions (TPO) */}
          {canManage && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setInterviewForm((prev) => ({
                    ...prev,
                    roundNumber: interviewRounds.length + 1,
                  }));
                  setIsInterviewModalOpen(true);
                }}
                className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-xl text-xs flex items-center transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Schedule Interview
              </button>

              {!offer && (
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center shadow-xs transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 mr-1" /> Issue Offer
                </button>
              )}
            </div>
          )}
        </div>

        {/* Candidate Details Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Candidate</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {application.student?.user?.name}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">PRN / Roll Number</p>
            <p className="font-mono font-semibold text-slate-700 mt-0.5">
              {application.student?.prn}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Department</p>
            <p className="font-semibold text-slate-700 mt-0.5">
              {application.student?.department}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Academic Standing</p>
            <p className="font-semibold text-slate-700 mt-0.5">
              CGPA: {application.student?.cgpa} • Backlogs: {application.student?.activeBacklogs}
            </p>
          </div>
        </div>
      </div>

      {/* Offer Extension / Acceptance Banner (Module 9) */}
      {offer && (
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 rounded-2xl p-6 text-white shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Award className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold tracking-tight">
                  Official Placement Offer Extended!
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-400/30">
                  {offer.status}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Position: <span className="text-white font-semibold">{offer.jobRole}</span> • Package:{' '}
                <span className="text-amber-300 font-bold text-sm">{offer.packageLpa} LPA</span>
              </p>
            </div>

            {/* If Student & Status is Pending, give Accept / Decline actions */}
            {isStudent && offer.status === 'Pending' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOfferResponse(offer._id, 'Accepted')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 mr-1" /> Accept Offer
                </button>
                <button
                  onClick={() => handleOfferResponse(offer._id, 'Declined')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors flex items-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Decline
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Two Column Layout: Interviews & Status Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Interview Rounds */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">
                Interview Rounds ({interviewRounds.length})
              </h3>
            </div>

            {interviewRounds.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No interview rounds have been scheduled yet.
              </div>
            ) : (
              <div className="space-y-3">
                {interviewRounds.map((round) => (
                  <div
                    key={round._id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                          Round {round.roundNumber}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                          {round.roundName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {new Date(round.scheduledDate).toLocaleString()} • {round.venueOrLink}
                        </p>
                      </div>
                      <StatusBadge status={round.status} />
                    </div>

                    {round.feedback && (
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 italic">
                        Feedback: "{round.feedback}"
                      </p>
                    )}

                    {/* TPO Outcome action buttons */}
                    {canManage && round.status === 'Scheduled' && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-slate-200 text-xs">
                        <span className="text-slate-500 font-medium">Record Outcome:</span>
                        <button
                          onClick={() => handleInterviewOutcome(round._id, 'Cleared')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md font-semibold text-[11px]"
                        >
                          Cleared
                        </button>
                        <button
                          onClick={() => handleInterviewOutcome(round._id, 'Failed')}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md font-semibold text-[11px]"
                        >
                          Failed
                        </button>
                        <button
                          onClick={() => handleInterviewOutcome(round._id, 'Absent')}
                          className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md font-semibold text-[11px]"
                        >
                          Absent
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status Transitions & Audit Trail */}
        <div className="space-y-4">
          {/* Status updater form for TPO */}
          {canManage && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 mb-3">
                Update Status
              </h3>
              <form onSubmit={handleStatusUpdate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Workflow State
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="In Process">In Process</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Audit Note / Comment
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cleared technical interview round"
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingStatus || newStatus === application.status}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingStatus ? 'Updating...' : 'Save Status Change'}
                </button>
              </form>
            </div>
          )}

          {/* Audit Trail Timeline */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-3">
              Application History Trail
            </h3>

            <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 text-xs">
              {(application.statusHistory || []).map((hist, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white" />
                  <p className="font-bold text-slate-800">{hist.status}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {hist.comment || 'Status updated'}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {new Date(hist.changedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title="Schedule Interview Round"
        subtitle="Specify interview stage, date, time, and venue"
      >
        <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Round Number</label>
              <input
                type="number"
                min="1"
                required
                value={interviewForm.roundNumber}
                onChange={(e) => setInterviewForm({ ...interviewForm, roundNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Round Stage Name</label>
              <select
                value={interviewForm.roundName}
                onChange={(e) => setInterviewForm({ ...interviewForm, roundName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="Online Assessment">Online Assessment</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="Managerial Interview">Managerial Interview</option>
                <option value="HR Interview">HR Interview</option>
                <option value="Final Decision">Final Decision</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              required
              value={interviewForm.scheduledDate}
              onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Venue / Online Link</label>
            <input
              type="text"
              required
              placeholder="e.g. Google Meet Link or Seminar Hall 1"
              value={interviewForm.venueOrLink}
              onChange={(e) => setInterviewForm({ ...interviewForm, venueOrLink: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Interviewer Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Nitin Sharma, Senior SDE"
              value={interviewForm.interviewerName}
              onChange={(e) => setInterviewForm({ ...interviewForm, interviewerName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsInterviewModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Schedule Round
            </button>
          </div>
        </form>
      </Modal>

      {/* Issue Offer Modal */}
      <Modal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title="Extend Placement Offer"
        subtitle="Record selection decision and formal package terms"
      >
        <form onSubmit={handleCreateOffer} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Designation</label>
            <input
              type="text"
              required
              value={offerForm.jobRole}
              onChange={(e) => setOfferForm({ ...offerForm, jobRole: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Package CTC (LPA)</label>
            <input
              type="number"
              step="0.1"
              required
              value={offerForm.packageLpa}
              onChange={(e) => setOfferForm({ ...offerForm, packageLpa: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Response Deadline</label>
            <input
              type="date"
              value={offerForm.responseDeadline}
              onChange={(e) => setOfferForm({ ...offerForm, responseDeadline: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOfferModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Extend Offer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
