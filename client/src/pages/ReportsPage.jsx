import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Building2,
  Calendar,
  Filter,
  Download,
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
} from 'recharts';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  'Computer Engineering',
  'Information Technology',
  'Electronics & Telecom',
  'Mechanical Engineering',
  'Civil Engineering',
];

export const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (deptFilter) params.department = deptFilter;

      const res = await api.get('/reports/placements', { params });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load placement reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [deptFilter]);

  if (loading) return <LoadingSpinner text="Compiling academic placement reports..." size="large" />;

  const deptStats = data?.deptStats || [];
  const driveStats = data?.driveStats || [];
  const interviewFunnel = data?.interviewFunnel || [];
  const offerStats = data?.offerStats || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Placement Analytics & Academic Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Departmental placement quotas, CTC compensation distributions, and drive conversion funnels.
          </p>
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments (Aggregated)</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Department-wise Placement Rates Chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Department Placement Percentages (%)
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Proportion of enrolled final year students placed with verified corporate offers
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="department"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                interval={0}
                angle={-10}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="placementRate"
                name="Placement Rate (%)"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Detailed Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">
            Department Placement Summary Table
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Total Students</th>
                <th className="py-3 px-4 text-center">Placed</th>
                <th className="py-3 px-4 text-center">Unplaced</th>
                <th className="py-3 px-4 text-center">Placement %</th>
                <th className="py-3 px-4 text-right">Avg Package</th>
                <th className="py-3 px-4 text-right">Highest Package</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptStats.map((d) => (
                <tr key={d.department} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {d.department}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-700">
                    {d.totalStudents}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                    {d.placedCount}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-500">
                    {d.unplacedCount}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                      {d.placementRate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-700 font-medium">
                    {d.avgPackage ? `${d.avgPackage} LPA` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                    {d.maxPackage ? `${d.maxPackage} LPA` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drive-wise Conversion Funnel Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">
            Placement Drive Funnel & Conversion Rates
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Placement Drive</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4 text-center">Total Applied</th>
                <th className="py-3 px-4 text-center">Shortlisted</th>
                <th className="py-3 px-4 text-center">In Process</th>
                <th className="py-3 px-4 text-center">Selected</th>
                <th className="py-3 px-4 text-right">Conversion %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {driveStats.map((drive) => (
                <tr key={drive.driveId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {drive.jobTitle}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {drive.company}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                    {drive.totalApps}
                  </td>
                  <td className="py-3.5 px-4 text-center text-indigo-600 font-semibold">
                    {drive.shortlisted}
                  </td>
                  <td className="py-3.5 px-4 text-center text-amber-600 font-semibold">
                    {drive.inProcess}
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">
                    {drive.selected}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-blue-700">
                    {drive.conversionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
