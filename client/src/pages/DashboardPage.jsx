import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import {
  Users,
  GraduationCap,
  Building2,
  Briefcase,
  FileText,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  Applied: '#3b82f6',
  Shortlisted: '#6366f1',
  'In Process': '#f59e0b',
  Selected: '#10b981',
  Rejected: '#ef4444',
  Withdrawn: '#94a3b8',
};

export const DashboardPage = () => {
  const { user, isStudent } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/summary');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing real-time placement analytics..." size="large" />;
  }

  // ================= STUDENT DASHBOARD =================
  if (isStudent) {
    const summary = data?.summary || {};
    const recentApps = data?.recentApplications || [];
    const upcomingInterviews = data?.upcomingInterviews || [];

    return (
      <div className="space-y-6">
        {/* Welcome & Placement Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-400/20 mb-3">
              Student Placement Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Track eligible placement drives, follow your interview stages, and respond to official job offers.
            </p>

            {/* Academic profile summary pills */}
            <div className="flex flex-wrap gap-3 mt-4 text-xs">
              <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-slate-400">Department:</span>{' '}
                <span className="font-semibold text-white">{summary.department || 'General'}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-slate-400">CGPA:</span>{' '}
                <span className="font-bold text-amber-300">{Number(summary.cgpa || 0).toFixed(2)}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-slate-400">Backlogs:</span>{' '}
                <span className={`font-bold ${summary.activeBacklogs > 0 ? 'text-rose-400' : 'text-emerald-300'}`}>
                  {summary.activeBacklogs || 0} Active
                </span>
              </div>
              {summary.isPlaced && (
                <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1.5 rounded-lg font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Placed ({summary.placedPackage} LPA)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Student KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Applications"
            value={summary.totalApplications || 0}
            subtitle="Submitted to drives"
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Active Interviews"
            value={summary.activeInterviews || 0}
            subtitle="Scheduled rounds"
            icon={Calendar}
            color="amber"
          />
          <StatCard
            title="Job Offers"
            value={summary.offersCount || 0}
            subtitle="Received offers"
            icon={Award}
            color="emerald"
          />
          <StatCard
            title="Placement Status"
            value={summary.isPlaced ? 'Placed' : 'In Process'}
            subtitle={summary.isPlaced ? `${summary.placedPackage} LPA Offer` : 'Actively applying'}
            icon={GraduationCap}
            color={summary.isPlaced ? 'emerald' : 'purple'}
          />
        </div>

        {/* Two Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications Tracker */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Recent Applications</h3>
              <Link to="/applications" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center">
                View All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            {recentApps.length === 0 ? (
              <EmptyState
                title="No applications yet"
                description="Browse active placement drives and submit your application."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApps.map((app) => (
                  <div key={app._id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        {app.drive?.jobTitle || 'Placement Drive'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {app.drive?.company?.name} • Package: {app.drive?.salaryPackage} LPA
                      </p>
                    </div>
                    <div className="text-right flex items-center space-x-3">
                      <StatusBadge status={app.status} />
                      <Link
                        to={`/applications/${app._id}`}
                        className="text-xs font-semibold text-slate-600 hover:text-blue-600 p-1 rounded-md hover:bg-slate-100"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Interviews Schedule */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Upcoming Interviews</h3>
              <Link to="/interviews" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center">
                Calendar <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            {upcomingInterviews.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming interviews"
                description="You have no scheduled interview rounds at this time."
              />
            ) : (
              <div className="space-y-3">
                {upcomingInterviews.map((item) => (
                  <div key={item._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-blue-700">{item.roundName}</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      {item.drive?.jobTitle} • {item.drive?.company?.name}
                    </p>
                    <div className="flex items-center text-[11px] text-slate-500 mt-2">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {new Date(item.scheduledDate).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================= ADMIN & TPO DASHBOARD =================
  const metrics = data?.metrics || {};
  const departmentStats = data?.departmentStats || [];
  const companyStats = data?.companyStats || [];
  const appStatusDist = (data?.applicationStatusDistribution || []).map((item) => ({
    name: item.status,
    value: item.count,
  }));
  const upcomingInterviews = data?.upcomingInterviews || [];
  const recentActivities = data?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Placement Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time analytics computed directly from verified database records.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/drives"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center"
          >
            <Briefcase className="w-3.5 h-3.5 mr-1.5" /> Manage Drives
          </Link>
          <Link
            to="/reports"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Full Reports
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Placement Rate"
          value={`${metrics.placementPercentage || 0}%`}
          subtitle={`${metrics.placedStudentsCount || 0} of ${metrics.totalStudents || 0} students placed`}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Total Students"
          value={metrics.totalStudents || 0}
          subtitle={`${metrics.unplacedStudentsCount || 0} currently seeking placement`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Drives"
          value={metrics.activeDrivesCount || 0}
          subtitle="Currently open for application"
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Total Applications"
          value={metrics.totalApplications || 0}
          subtitle={`${metrics.totalOffers || 0} offers extended`}
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Placement Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Department-wise Placement Performance
              </h3>
              <p className="text-xs text-slate-500">
                Total registered students vs. students successfully placed
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentStats}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="totalStudents" name="Total Students" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="placedStudents" name="Placed Students" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Funnel / Donut Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Application Pipeline
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Distribution across hiring workflow stages
          </p>
          <div className="h-56 w-full flex items-center justify-center">
            {appStatusDist.length === 0 ? (
              <EmptyState title="No applications recorded" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appStatusDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {appStatusDist.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
            {appStatusDist.map((item) => (
              <div key={item.name} className="flex items-center text-xs text-slate-600">
                <span
                  className="w-2.5 h-2.5 rounded-full mr-2 shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[item.name] || '#64748b' }}
                />
                <span className="truncate">{item.name}:</span>
                <span className="font-bold ml-1 text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Company Placements & Upcoming Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Recruiting Companies */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Top Hiring Partners & Offers
              </h3>
              <p className="text-xs text-slate-500">
                Selections and packages offered by participating companies
              </p>
            </div>
            <Link to="/companies" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center">
              All Companies <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {companyStats.length === 0 ? (
            <EmptyState title="No company offers recorded yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3">Industry</th>
                    <th className="py-2.5 px-3 text-center">Selections</th>
                    <th className="py-2.5 px-3 text-right">Avg Package</th>
                    <th className="py-2.5 px-3 text-right">Highest Package</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companyStats.map((comp) => (
                    <tr key={comp.companyName} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {comp.companyName}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {comp.industry}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-full">
                          {comp.selectionsCount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {comp.avgPackage} LPA
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">
                        {comp.maxPackage} LPA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Audit Activities */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Recent Audit Trail</h3>
            {user?.role === 'admin' && (
              <Link to="/audit-logs" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center">
                All Logs <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div key={act._id} className="text-xs border-b border-slate-100 pb-2.5 last:border-none">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 font-mono text-[11px]">
                    {act.action}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  By {act.performedBy?.name || 'System'} ({act.role})
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
