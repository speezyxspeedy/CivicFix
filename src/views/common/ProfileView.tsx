import React from 'react';
import { db } from '../../services/db';
import { UserProfile } from '../../types';
import {
  User,
  Shield,
  Wrench,
  Mail,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onNavigate
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-xs">
            {currentUser.full_name.charAt(0)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentUser.full_name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider font-mono">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Member since: {new Date(currentUser.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Contact & Identity Details
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Email Address</span>
                <span className="font-semibold text-slate-800">{currentUser.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <Phone className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Phone Number</span>
                <span className="font-semibold text-slate-800">{currentUser.phone || 'Not configured'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Registered Locality</span>
                <span className="font-semibold text-slate-800">{currentUser.locality || 'General Sector'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access Rights */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Role Privileges & Security Enforcement
          </h2>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Database Row Level Security (RLS) Active</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Users can never self-elevate permissions from the frontend. Administrative and field technician privileges are strictly provisioned through PostgreSQL database functions.
            </p>
          </div>

          <div className="space-y-2 text-xs pt-1">
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-emerald-900">
              <span>Submit & Track Public Incidents</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 text-slate-700">
              <span>Direct Administrative Triage & Verification</span>
              {currentUser.role === 'ADMIN' ? (
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
              ) : (
                <span className="text-[10px] text-slate-400 font-mono">Restricted to Admin</span>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 text-slate-700">
              <span>On-Site Evidence Upload & Task Execution</span>
              {currentUser.role === 'WORKER' || currentUser.role === 'ADMIN' ? (
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              ) : (
                <span className="text-[10px] text-slate-400 font-mono">Restricted to Worker</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
