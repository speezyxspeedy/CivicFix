import React from 'react';
import { db } from '../../services/db';
import { UserProfile, Complaint } from '../../types';
import { StatusBadge, PriorityBadge, SLABadge } from '../../components/StatusBadge';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  Users,
  HardHat,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Flame,
  FileCheck2
} from 'lucide-react';

interface AdminOverviewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  currentUser,
  onNavigate
}) => {
  const analytics = db.getAnalytics();
  const allComplaints = db.getComplaints(false);

  // Operational alerts
  const criticalComplaints = allComplaints.filter(
    (c) => c.priority === 'CRITICAL' && c.status !== 'RESOLVED' && c.status !== 'REJECTED'
  );
  const overdueComplaints = allComplaints.filter((c) => {
    if (c.status === 'RESOLVED' || c.status === 'REJECTED') return false;
    return db.getSLAStatus(c).status === 'OVERDUE';
  });
  const unassignedVerified = allComplaints.filter((c) => c.status === 'VERIFIED');
  const awaitingResolutionReview = allComplaints.filter(
    (c) => c.status === 'RESOLUTION SUBMITTED'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-sky-600" />
            Civic Operations Command
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Municipal Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time citizen reporting triage, field workforce dispatch, and resolution verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('admin-review-queue')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Review Queue ({analytics.submitted})
          </button>

          <button
            onClick={() => onNavigate('admin-resolutions')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Verify Resolutions ({awaitingResolutionReview.length})
          </button>
        </div>
      </div>

      {/* 8 Required KPI Cards (Clean Light Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Reports
          </span>
          <div className="mt-1 text-xl font-black text-slate-900">{analytics.total}</div>
          <span className="text-[10px] text-slate-500">All submissions</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
            Submitted
          </span>
          <div className="mt-1 text-xl font-black text-amber-700">{analytics.submitted}</div>
          <span className="text-[10px] text-slate-500">Awaiting triage</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
            Under Review
          </span>
          <div className="mt-1 text-xl font-black text-orange-700">{analytics.underReview}</div>
          <span className="text-[10px] text-slate-500">In triage</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
            Verified
          </span>
          <div className="mt-1 text-xl font-black text-sky-700">{analytics.verified}</div>
          <span className="text-[10px] text-slate-500">Ready to assign</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
            Assigned
          </span>
          <div className="mt-1 text-xl font-black text-indigo-700">{analytics.assigned}</div>
          <span className="text-[10px] text-slate-500">Dispatched crew</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
            In Progress
          </span>
          <div className="mt-1 text-xl font-black text-blue-700">{analytics.inProgress}</div>
          <span className="text-[10px] text-slate-500">Field work active</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            Resolved
          </span>
          <div className="mt-1 text-xl font-black text-emerald-700">{analytics.resolved}</div>
          <span className="text-[10px] text-slate-500">Approved fixes</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-rose-200 shadow-2xs bg-rose-50/30">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
            Overdue SLA
          </span>
          <div className="mt-1 text-xl font-black text-rose-700">{analytics.overdue}</div>
          <span className="text-[10px] text-rose-500 font-medium">Exceeded target</span>
        </div>
      </div>

      {/* Operational Alerts Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Alerts */}
        <div className="p-4 rounded-xl bg-white border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-600" />
              Critical Incidents ({criticalComplaints.length})
            </span>
          </div>
          {criticalComplaints.length === 0 ? (
            <p className="text-xs text-slate-400">No critical emergencies logged.</p>
          ) : (
            <div className="space-y-2 mt-2">
              {criticalComplaints.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate('admin-all-complaints', c.id)}
                  className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer text-xs"
                >
                  <div className="font-bold text-rose-900 line-clamp-1">{c.title}</div>
                  <div className="text-[11px] text-rose-700 mt-0.5">{c.locality}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue SLA Tasks */}
        <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Overdue Tasks ({overdueComplaints.length})
            </span>
          </div>
          {overdueComplaints.length === 0 ? (
            <p className="text-xs text-slate-400">All active tasks within SLA targets.</p>
          ) : (
            <div className="space-y-2 mt-2">
              {overdueComplaints.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate('admin-all-complaints', c.id)}
                  className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer text-xs"
                >
                  <div className="font-bold text-amber-900 line-clamp-1">{c.title}</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    Target missed by {db.getSLAStatus(c).overdueHours}h
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unassigned Verified Reports */}
        <div className="p-4 rounded-xl bg-white border border-sky-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-600" />
              Unassigned Verified ({unassignedVerified.length})
            </span>
          </div>
          {unassignedVerified.length === 0 ? (
            <p className="text-xs text-slate-400">No unassigned reports pending dispatch.</p>
          ) : (
            <div className="space-y-2 mt-2">
              {unassignedVerified.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate('admin-assignments')}
                  className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer text-xs"
                >
                  <div className="font-bold text-sky-900 line-clamp-1">{c.title}</div>
                  <div className="text-[11px] text-sky-700 mt-0.5 font-medium">Click to dispatch worker →</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Awaiting Resolution Verification */}
        <div className="p-4 rounded-xl bg-white border border-purple-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-purple-600" />
              Evidence Sign-Off ({awaitingResolutionReview.length})
            </span>
          </div>
          {awaitingResolutionReview.length === 0 ? (
            <p className="text-xs text-slate-400">No completion evidence pending approval.</p>
          ) : (
            <div className="space-y-2 mt-2">
              {awaitingResolutionReview.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate('admin-resolutions')}
                  className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer text-xs"
                >
                  <div className="font-bold text-purple-900 line-clamp-1">{c.title}</div>
                  <div className="text-[11px] text-purple-700 mt-0.5 font-medium">Verify after-photos →</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Highlights / Quick Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (SVG Chart) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Category Distribution</h2>
            <button
              onClick={() => onNavigate('admin-analytics')}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Full Analytics →
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
            {Object.entries(analytics.categoryCounts).map(([catName, count]) => {
              const pct = Math.round((count / (analytics.total || 1)) * 100);
              return (
                <div key={catName} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="truncate max-w-[200px]">{catName}</span>
                    <span className="font-mono text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Locality Hotspots */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Locality Hotspots</h2>
            <span className="text-xs text-slate-400 font-mono">By Complaint Volume</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {Object.entries(analytics.localityCounts).map(([locName, count]) => {
              const pct = Math.round((count / (analytics.total || 1)) * 100);
              return (
                <div key={locName} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="truncate max-w-[200px]">{locName}</span>
                    <span className="font-mono text-slate-500">{count} issues</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Performance & SLA Compliance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Performance Metrics</h2>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  SLA Compliance Rate
                </span>
                <span className="text-2xl font-black text-emerald-700">
                  {analytics.slaComplianceRate}%
                </span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Average Resolution Time
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {analytics.avgResolutionHours} hrs
                </span>
              </div>
              <Clock className="w-8 h-8 text-sky-500" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Citizen Satisfaction Score
                </span>
                <span className="text-2xl font-black text-amber-600">
                  ★ {analytics.avgRating} <span className="text-xs font-normal text-slate-500">/ 5.0</span>
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                ({analytics.feedbackCount} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Complaints Log</h2>
            <p className="text-xs text-slate-500">Directly inspect and manage incoming complaints</p>
          </div>
          <button
            onClick={() => onNavigate('admin-all-complaints')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            Open All Complaints ({allComplaints.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Complaint Code</th>
                <th className="py-2.5 px-3">Issue Title & Category</th>
                <th className="py-2.5 px-3">Locality</th>
                <th className="py-2.5 px-3">Submitted</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allComplaints.slice(0, 5).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {item.complaint_code}
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate">{item.title}</div>
                    <div className="text-[11px] text-slate-500">{item.category_name}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{item.locality}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    {new Date(item.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3">
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={item.status} isDemo={item.is_demo} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigate('admin-all-complaints', item.id)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                    >
                      Inspect
                    </button>
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
