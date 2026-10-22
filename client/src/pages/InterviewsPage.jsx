import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import {
  CalendarCheck,
  Search,
  Building2,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const InterviewsPage = () => {
  const { user, canManage, isStudent } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'all'

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (activeTab === 'upcoming') params.upcoming = 'true';

      const res = await api.get('/interviews', { params });
      if (res.data.success) {
        setInterviews(res.data.interviews || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load interviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter, activeTab]);

  const handleOutcomeUpdate = async (id, status) => {
    const feedback = window.prompt(`Feedback for status '${status}':`) || '';
    try {
      const res = await api.patch(`/interviews/${id}`, { status, feedback });
      if (res.data.success) {
        toast.success(`Interview marked as '${status}'.`);
        fetchInterviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update interview outcome.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Interview Rounds & Schedules
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isStudent
              ? 'Keep track of upcoming assessment rounds, venue details, and evaluation feedback.'
              : 'Oversee scheduled assessments and record student evaluation outcomes.'}
          </p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Upcoming Interviews
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Historical Rounds
          </button>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Outcome Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Cleared">Cleared</option>
          <option value="Failed">Failed</option>
          <option value="Absent">Absent</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Interviews List */}
      {loading ? (
        <LoadingSpinner text="Loading interview rounds..." />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No interview rounds found"
          description="There are no interview sessions matching your selected filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      Round {item.roundNumber}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {item.roundName}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5 flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {item.drive?.company?.name} • {item.drive?.jobTitle}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                {!isStudent && (
                  <div className="mt-3.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-400 font-medium">Candidate:</span>{' '}
                    <span className="font-bold text-slate-800">
                      {item.student?.user?.name}
                    </span>{' '}
                    <span className="font-mono text-slate-500 text-[11px]">
                      ({item.student?.prn})
                    </span>
                  </div>
                )}

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center text-slate-700 font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                    {new Date(item.scheduledDate).toLocaleString()}
                  </div>
                  <div className="flex items-center text-slate-500">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                    {item.venueOrLink}
                  </div>
                  {item.interviewerName && (
                    <div className="flex items-center text-slate-500">
                      <User className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                      Interviewer: {item.interviewerName}
                    </div>
                  )}
                </div>

                {item.feedback && (
                  <p className="mt-3 text-xs italic text-slate-600 bg-amber-50/50 p-2 rounded border border-amber-100">
                    "{item.feedback}"
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/applications/${item.application}`}
                  className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center"
                >
                  View Application <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>

                {canManage && item.status === 'Scheduled' && (
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOutcomeUpdate(item._id, 'Cleared')}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => handleOutcomeUpdate(item._id, 'Failed')}
                      className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-bold"
                    >
                      Fail
                    </button>
                    <button
                      onClick={() => handleOutcomeUpdate(item._id, 'Absent')}
                      className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded text-[11px] font-bold"
                    >
                      Absent
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
