import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile } from '../../types';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  CheckCircle2,
  Clock,
  Star,
  Users,
  HardHat,
  Filter,
  Download
} from 'lucide-react';

interface AnalyticsViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const analytics = db.getAnalytics();
  const allComplaints = db.getComplaints(false);
  const workers = db.getWorkers();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  const filteredComplaints = allComplaints.filter((c) => {
    const matchCat = selectedCategory === 'ALL' || c.category_id === selectedCategory;
    const matchPri = selectedPriority === 'ALL' || c.priority === selectedPriority;
    return matchCat && matchPri;
  });

  const categories = db.getCategories();

  // Status breakdown numbers
  const statusCounts: Record<string, number> = {
    SUBMITTED: 0,
    VERIFIED: 0,
    ASSIGNED: 0,
    'IN PROGRESS': 0,
    'RESOLUTION SUBMITTED': 0,
    RESOLVED: 0,
    REJECTED: 0
  };

  filteredComplaints.forEach((c) => {
    if (statusCounts[c.status] !== undefined) {
      statusCounts[c.status]++;
    }
  });

  // Resolution rate
  const totalClosed = (statusCounts['RESOLVED'] || 0) + (statusCounts['REJECTED'] || 0);
  const resolutionPct = filteredComplaints.length > 0
    ? Math.round(((statusCounts['RESOLVED'] || 0) / filteredComplaints.length) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            Civic Intelligence & Metrics
          </div>
          <h1 className="text-xl font-bold text-slate-900">Operations Analytics & SLA KPIs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated operational performance calculated from live PostgreSQL database records.
          </p>
        </div>

        <button
          onClick={() => onNavigate('admin-reports')}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export Formatted Reports
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3 shadow-2xs">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-bold text-slate-700">Filter Analysis:</span>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 outline-none"
        >
          <option value="ALL">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 outline-none"
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Primary KPI Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Resolution Rate
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-700">{resolutionPct}%</div>
          <span className="text-[10px] text-slate-500">Of total complaints</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            SLA Compliance
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-700">
            {analytics.slaComplianceRate}%
          </div>
          <span className="text-[10px] text-slate-500">Within target hours</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Avg Turnaround
          </span>
          <div className="mt-1 text-2xl font-black text-sky-700">
            {analytics.avgResolutionHours}h
          </div>
          <span className="text-[10px] text-slate-500">Submission to fix</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Overdue Count
          </span>
          <div className="mt-1 text-2xl font-black text-rose-700">{analytics.overdue}</div>
          <span className="text-[10px] text-rose-500 font-medium">Attention needed</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Citizen Rating
          </span>
          <div className="mt-1 text-2xl font-black text-amber-600">
            ★ {analytics.avgRating}
          </div>
          <span className="text-[10px] text-slate-500">({analytics.feedbackCount} reviews)</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Technicians
          </span>
          <div className="mt-1 text-2xl font-black text-indigo-700">{workers.length}</div>
          <span className="text-[10px] text-slate-500">On-field roster</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Horizontal Bars */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Complaints by Category Volume</h2>

          <div className="space-y-3 pt-2">
            {Object.entries(analytics.categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / (analytics.total || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat}</span>
                    <span className="font-mono text-slate-500 font-bold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
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

        {/* Status Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Current Pipeline Status Distribution</h2>

          <div className="space-y-3 pt-2">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = Math.round((count / (filteredComplaints.length || 1)) * 100);
              let barColor = 'bg-slate-400';
              if (status === 'RESOLVED') barColor = 'bg-emerald-500';
              if (status === 'IN PROGRESS') barColor = 'bg-blue-500';
              if (status === 'SUBMITTED') barColor = 'bg-amber-500';
              if (status === 'VERIFIED') barColor = 'bg-sky-500';
              if (status === 'REJECTED') barColor = 'bg-rose-500';
              if (status === 'RESOLUTION SUBMITTED') barColor = 'bg-purple-500';

              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{status}</span>
                    <span className="font-mono text-slate-500 font-bold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Locality Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Complaints by Locality</h2>

          <div className="space-y-3 pt-2">
            {Object.entries(analytics.localityCounts).map(([loc, count]) => {
              const pct = Math.round((count / (analytics.total || 1)) * 100);
              return (
                <div key={loc} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{loc}</span>
                    <span className="font-mono text-slate-500 font-bold">
                      {count} reports
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
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

        {/* Field Worker Workload Balancing */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Worker Active Workload Distribution</h2>

          <div className="space-y-3 pt-2">
            {workers.map((w) => {
              const maxLoad = 5;
              const pct = Math.min(100, Math.round((w.active_assignment_count / maxLoad) * 100));

              return (
                <div key={w.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{w.full_name}</span>
                      <span className="text-[11px] text-slate-400 ml-1.5">
                        ({w.specialization})
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-700">
                      {w.active_assignment_count} tasks
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        w.active_assignment_count > 2 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
