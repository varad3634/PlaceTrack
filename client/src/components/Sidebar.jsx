import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  CalendarCheck,
  Building2,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  UserCheck,
  LogOut,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout, canManage, isAdmin, isStudent } = useAuth();

  const navItemClass = ({ isActive }) =>
    `flex items-center px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand logo & title */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
            PT
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              Place<span className="text-blue-400">Track</span>
            </h1>
            <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">
              TPO Management
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
          Main Navigation
        </div>

        <NavLink to="/dashboard" className={navItemClass}>
          <LayoutDashboard className="w-4 h-4 mr-3 shrink-0" />
          Dashboard
        </NavLink>

        <NavLink to="/drives" className={navItemClass}>
          <Briefcase className="w-4 h-4 mr-3 shrink-0" />
          Placement Drives
        </NavLink>

        <NavLink to="/applications" className={navItemClass}>
          <FileCheck2 className="w-4 h-4 mr-3 shrink-0" />
          {isStudent ? 'My Applications' : 'Applications'}
        </NavLink>

        <NavLink to="/interviews" className={navItemClass}>
          <CalendarCheck className="w-4 h-4 mr-3 shrink-0" />
          Interviews & Rounds
        </NavLink>

        <NavLink to="/companies" className={navItemClass}>
          <Building2 className="w-4 h-4 mr-3 shrink-0" />
          Companies
        </NavLink>

        {canManage && (
          <>
            <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Administration
            </div>

            <NavLink to="/students" className={navItemClass}>
              <GraduationCap className="w-4 h-4 mr-3 shrink-0" />
              Student Directory
            </NavLink>

            <NavLink to="/reports" className={navItemClass}>
              <BarChart3 className="w-4 h-4 mr-3 shrink-0" />
              Placement Reports
            </NavLink>
          </>
        )}

        {isAdmin && (
          <NavLink to="/audit-logs" className={navItemClass}>
            <ShieldCheck className="w-4 h-4 mr-3 shrink-0" />
            System Audit Trail
          </NavLink>
        )}

        {isStudent && user?.profile && (
          <>
            <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Student Space
            </div>
            <NavLink
              to={`/students/${user.profile._id}`}
              className={navItemClass}
            >
              <UserCheck className="w-4 h-4 mr-3 shrink-0" />
              My Academic Profile
            </NavLink>
          </>
        )}
      </div>

      {/* User info & Logout at footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name}
              </p>
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
