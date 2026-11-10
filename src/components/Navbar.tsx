import React, { useState } from 'react';
import { db } from '../services/db';
import { UserProfile } from '../types';
import {
  Bell,
  Settings,
  Shield,
  User,
  Wrench,
  Database,
  CheckCircle2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  unreadCount,
  onOpenNotifications,
  onOpenSettings,
  onNavigate
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const profiles = db.getProfiles();
  const sbConfig = db.getSupabaseConfig();

  const handleRoleSelect = (role: 'CITIZEN' | 'ADMIN' | 'WORKER') => {
    db.switchRole(role);
    setShowRoleDropdown(false);
    // Switch to role default home view
    if (role === 'CITIZEN') onNavigate('citizen-home');
    if (role === 'ADMIN') onNavigate('admin-overview');
    if (role === 'WORKER') onNavigate('worker-assignments');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Operations Admin',
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          icon: Shield
        };
      case 'WORKER':
        return {
          label: 'Field Technician',
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: Wrench
        };
      default:
        return {
          label: 'Registered Citizen',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: User
        };
    }
  };

  const roleBadge = getRoleBadge(currentUser.role);
  const RoleIcon = roleBadge.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
          if (currentUser.role === 'CITIZEN') onNavigate('citizen-home');
          else if (currentUser.role === 'ADMIN') onNavigate('admin-overview');
          else onNavigate('worker-assignments');
        }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Civic<span className="text-emerald-600">Fix</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                Report • Track • Fix
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Civic Issue Reporting & Resolution Management
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase status indicator */}
          <button
            onClick={onOpenSettings}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              sbConfig.isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Configure Supabase Cloud or Demo Mode"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>{sbConfig.isConnected ? 'Supabase Live' : 'Demo Workspace'}</span>
          </button>

          {/* Quick Persona / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-all shadow-2xs"
            >
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] ${roleBadge.bg}`}>
                <RoleIcon className="w-3 h-3" />
                {roleBadge.label}
              </span>
              <span className="hidden sm:inline text-slate-700">{currentUser.full_name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Switch Persona / Role
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Experience CivicFix across all 3 user roles
                  </p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => handleRoleSelect('CITIZEN')}
                    className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser.role === 'CITIZEN'
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Citizen Persona</div>
                        <div className="text-[11px] text-slate-500">Report issues, track timeline</div>
                      </div>
                    </div>
                    {currentUser.role === 'CITIZEN' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    onClick={() => handleRoleSelect('ADMIN')}
                    className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-sky-50 text-sky-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Administrator Persona</div>
                        <div className="text-[11px] text-slate-500">Triage, dispatch, verify & analytics</div>
                      </div>
                    </div>
                    {currentUser.role === 'ADMIN' && (
                      <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    )}
                  </button>

                  <button
                    onClick={() => handleRoleSelect('WORKER')}
                    className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser.role === 'WORKER'
                        ? 'bg-indigo-50 text-indigo-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Field Worker Persona</div>
                        <div className="text-[11px] text-slate-500">Tasks, on-site proof, completion</div>
                      </div>
                    </div>
                    {currentUser.role === 'WORKER' && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Settings modal trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="System Settings & Database"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
