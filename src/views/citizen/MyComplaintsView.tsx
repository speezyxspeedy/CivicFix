import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, Complaint } from '../../types';
import { StatusBadge, PriorityBadge, SLABadge } from '../../components/StatusBadge';
import {
  Search,
  Filter,
  PlusCircle,
  Clock,
  ArrowRight,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface MyComplaintsViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const MyComplaintsView: React.FC<MyComplaintsViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Enforce RLS simulation: only citizen's complaints
  const complaints = db.getComplaints(true);

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaint_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.locality.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ACTIVE') {
      return matchesSearch && c.status !== 'RESOLVED' && c.status !== 'REJECTED';
    }
    return matchesSearch && c.status === statusFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Complaint History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and monitor resolution progress for all issues submitted from your account.
          </p>
        </div>

        <button
          onClick={() => onNavigate('citizen-report')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs self-start sm:self-auto transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Complaint code, title, or locality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-xs outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {['ALL', 'ACTIVE', 'SUBMITTED', 'IN PROGRESS', 'RESOLVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">No complaints found</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search criteria or filter options.'
              : 'You have not submitted any complaints yet.'}
          </p>
          <button
            onClick={() => onNavigate('citizen-report')}
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            File an Issue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => {
            const sla = db.getSLAStatus(item);
            const firstPhoto = item.media?.[0]?.preview_url;

            return (
              <div
                key={item.id}
                onClick={() => onNavigate('citizen-track', item.id)}
                className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all p-5 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  {/* Photo thumbnail if available */}
                  {firstPhoto ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 hidden sm:block">
                      <img
                        src={firstPhoto}
                        alt="Defect"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 hidden sm:flex">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {item.complaint_code}
                      </span>
                      <StatusBadge status={item.status} isDemo={item.is_demo} />
                      <PriorityBadge priority={item.priority} />
                      <span className="text-xs font-medium text-slate-500">
                        {item.category_name}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.locality}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(item.submitted_at).toLocaleDateString()}
                      </span>
                      {item.assigned_worker && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-medium">
                            Assigned to {item.assigned_worker.specialization}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <SLABadge sla={sla} />
                  <span className="text-xs font-semibold text-emerald-600 group-hover:text-emerald-700 inline-flex items-center gap-1">
                    Track Timeline <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
