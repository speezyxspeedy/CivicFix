import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, Complaint } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { BeforeAfterSlider } from '../../components/BeforeAfterSlider';
import {
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Waves,
  Droplets,
  LightbulbOff,
  Building2,
  Sparkles
} from 'lucide-react';

interface CitizenHomeProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
  onSelectCategory?: (categoryId: string) => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({
  currentUser,
  onNavigate,
  onSelectCategory
}) => {
  const [searchCode, setSearchCode] = useState('');
  const complaints = db.getComplaints(true); // Filtered by current citizen
  const categories = db.getCategories();
  const allComplaints = db.getComplaints(false);

  // Spotlights a resolved complaint with before/after photos
  const resolvedSpotlight = allComplaints.find(
    (c) => c.status === 'RESOLVED' && c.media && c.media.some((m) => m.media_type === 'AFTER')
  );

  const activeCount = complaints.filter(
    (c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      onNavigate('citizen-track', searchCode.trim());
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'Trash2':
        return <Trash2 className="w-5 h-5 text-emerald-600" />;
      case 'Waves':
        return <Waves className="w-5 h-5 text-cyan-600" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'LightbulbOff':
        return <LightbulbOff className="w-5 h-5 text-orange-600" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-indigo-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner (Clean, Bright, Crisp Light Theme - No dark background) */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-100 p-6 sm:p-8 overflow-hidden shadow-2xs">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            CivicFix Public Platform
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Report It. Track It. <span className="text-emerald-600">Fix It.</span>
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Directly connect with local community administrators and dedicated field crews to resolve potholes, waste overflows, water leaks, and streetlight outages.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('citizen-report')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Report New Issue Now
            </button>

            <button
              onClick={() => onNavigate('citizen-complaints')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm transition-colors shadow-2xs"
            >
              My Reported Issues ({complaints.length})
            </button>
          </div>
        </div>

        {/* Decorative civic illustration elements */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-8 opacity-25 pointer-events-none hidden lg:block">
          <div className="w-64 h-64 rounded-full bg-emerald-300 blur-3xl" />
        </div>
      </div>

      {/* Quick Complaint Tracker Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Track by Complaint ID (e.g. CF-2026-000101)..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-colors shrink-0"
          >
            Track Status
          </button>
        </form>
      </div>

      {/* Citizen Personal Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Reported</span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{complaints.length}</div>
          <p className="mt-1 text-xs text-slate-500">Submitted from your account</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>In Resolution Pipeline</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{activeCount}</div>
          <p className="mt-1 text-xs text-slate-500">Under review or field repair</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Successfully Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{resolvedCount}</div>
          <p className="mt-1 text-xs text-slate-500">With verified photo evidence</p>
        </div>
      </div>

      {/* Category Fast Launch Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">What issue are you observing?</h2>
            <p className="text-xs text-slate-500">Select a category to begin your geo-tagged complaint report</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600">10 Categories Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                if (onSelectCategory) onSelectCategory(cat.id);
                onNavigate('citizen-report');
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-all group flex flex-col justify-between"
            >
              <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-white w-fit mb-2 transition-colors">
                {getCategoryIcon(cat.icon_name)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 line-clamp-1">
                  {cat.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  SLA: {cat.sla_critical_hours}h - {cat.sla_medium_hours / 24}d
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Verified Resolution Spotlight (Before & After evidence) */}
      {resolvedSpotlight && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Community Resolution Proof
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Verified Before & After Fix: {resolvedSpotlight.title}
              </h2>
              <p className="text-xs text-slate-500">
                Location: {resolvedSpotlight.locality} • Resolved in 54 hours
              </p>
            </div>
            <button
              onClick={() => onNavigate('citizen-track', resolvedSpotlight.id)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              Inspect Timeline <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <BeforeAfterSlider
            beforeUrl={
              resolvedSpotlight.media?.find((m) => m.media_type === 'BEFORE')?.preview_url || ''
            }
            afterUrl={
              resolvedSpotlight.media?.find((m) => m.media_type === 'AFTER')?.preview_url || ''
            }
            beforeLabel="Reported Hazard"
            afterLabel="Repaired & Sealed"
            aspectRatio="aspect-21/9"
          />
        </div>
      )}

      {/* Citizen's Recent Complaints */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Your Recent Submissions</h2>
          <button
            onClick={() => onNavigate('citizen-complaints')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            View All ({complaints.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {complaints.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No issues reported yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Spotted a pothole or broken streetlight? Report it in under 60 seconds.
            </p>
            <button
              onClick={() => onNavigate('citizen-report')}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              File First Report
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('citizen-track', item.id)}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {item.complaint_code}
                    </span>
                    <StatusBadge status={item.status} isDemo={item.is_demo} />
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.locality} • Submitted {new Date(item.submitted_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-xs font-medium text-emerald-600 group-hover:text-emerald-700 inline-flex items-center gap-1">
                    Track <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
