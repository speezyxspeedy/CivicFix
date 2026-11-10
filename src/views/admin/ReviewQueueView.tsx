import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, Complaint, ComplaintPriority } from '../../types';
import { PriorityBadge } from '../../components/StatusBadge';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  FileCheck
} from 'lucide-react';

interface ReviewQueueViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const allComplaints = db.getComplaints(false);
  const queue = allComplaints.filter((c) => c.status === 'SUBMITTED');

  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(
    queue[0] || null
  );

  // Verification form state
  const [priority, setPriority] = useState<ComplaintPriority>('HIGH');
  const [adminNotes, setAdminNotes] = useState('');

  // Rejection modal state
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    setErrorMsg(null);

    db.verifyComplaint(activeComplaint.id, priority, adminNotes);

    // Refresh queue
    const updated = db.getComplaints(false).filter((c) => c.status === 'SUBMITTED');
    setActiveComplaint(updated[0] || null);
    setAdminNotes('');
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    if (!rejectionReason.trim()) {
      setErrorMsg('A detailed reason for rejection is strictly mandatory.');
      return;
    }

    try {
      db.rejectComplaint(activeComplaint.id, rejectionReason.trim());
      setIsRejecting(false);
      setRejectionReason('');
      setErrorMsg(null);

      // Refresh queue
      const updated = db.getComplaints(false).filter((c) => c.status === 'SUBMITTED');
      setActiveComplaint(updated[0] || null);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to reject complaint.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Triage Desk
          </div>
          <h1 className="text-xl font-bold text-slate-900">Incoming Complaint Review Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assess citizen submissions, verify authenticity, prioritize emergency level, or reject invalid claims with audited reasoning.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-2">
          <span>{queue.length} Awaiting Verification</span>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Review Queue Cleared!</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All newly reported citizen incidents have been triaged and verified. Check the Worker Assignment desk to dispatch field crews.
          </p>
          <button
            onClick={() => onNavigate('admin-assignments')}
            className="mt-4 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-2"
          >
            Worker Assignment Desk →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue List (Left Column) */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Select Incident to Review
            </h2>

            <div className="space-y-2">
              {queue.map((item) => {
                const isSelected = activeComplaint?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveComplaint(item);
                      setIsRejecting(false);
                      setErrorMsg(null);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {item.complaint_code}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {new Date(item.submitted_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span className="truncate max-w-[160px]">{item.locality}</span>
                      <span className="font-semibold text-emerald-700">{item.category_name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Inspection & Verification Workspace (Right Column) */}
          {activeComplaint && (
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                      {activeComplaint.complaint_code}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {activeComplaint.category_name}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Logged: {new Date(activeComplaint.submitted_at).toLocaleString()}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {activeComplaint.title}
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {activeComplaint.description}
                  </p>
                </div>

                {/* Citizen & Location Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Reporting Citizen
                    </span>
                    <div className="font-bold text-slate-900">{activeComplaint.citizen_name}</div>
                    <div className="text-slate-500 font-mono">{activeComplaint.citizen_phone || 'Phone verified'}</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Incident Location & Landmark
                    </span>
                    <div className="font-bold text-slate-900">{activeComplaint.locality}</div>
                    {activeComplaint.street && (
                      <div className="text-slate-600">{activeComplaint.street}</div>
                    )}
                    {activeComplaint.landmark && (
                      <div className="text-slate-500">Landmark: {activeComplaint.landmark}</div>
                    )}
                    {activeComplaint.latitude && activeComplaint.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${activeComplaint.latitude},${activeComplaint.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:underline inline-flex items-center gap-1 font-semibold text-[11px] pt-1"
                      >
                        Inspect Location on Map <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Attached Photographs */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Attached Photographs ({activeComplaint.media?.length || 0})
                  </h3>

                  {(!activeComplaint.media || activeComplaint.media.length === 0) ? (
                    <div className="p-4 rounded-xl bg-slate-50 text-slate-400 text-xs text-center border border-slate-200">
                      No photographic media provided with this report.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {activeComplaint.media.map((med, idx) => (
                        <div
                          key={med.id || idx}
                          className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video relative group"
                        >
                          <img
                            src={med.preview_url}
                            alt="Incident Evidence"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900/70 text-white">
                            Citizen Evidence
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Verification / Rejection Forms */}
                {!isRejecting ? (
                  <form onSubmit={handleVerify} className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Triage Decision & Prioritization
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsRejecting(true)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                      >
                        Decline / Reject Report →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Operational Priority
                        </label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none"
                        >
                          <option value="CRITICAL">CRITICAL (Target: &lt;24 hours)</option>
                          <option value="HIGH">HIGH (Target: &lt;72 hours)</option>
                          <option value="MEDIUM">MEDIUM (Target: &lt;7 days)</option>
                          <option value="LOW">LOW (Target: &lt;14 days)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Internal Admin Dispatch Notes
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Verified road hazard. Requires cold-lay asphalt."
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs inline-flex items-center gap-2 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Verify & Queue for Assignment
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleReject} className="pt-4 border-t border-rose-100 bg-rose-50/50 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Reject Report with Mandatory Explanation
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsRejecting(false)}
                        className="text-xs text-slate-500 hover:text-slate-800"
                      >
                        Cancel Rejection
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Reason for Rejection <span className="text-rose-600">* (Sent directly to citizen)</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Explain why this issue cannot be serviced (e.g. Falls within private property boundary, duplicate of CF-2026-..., or outside municipal jurisdiction)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-rose-200 bg-white text-xs text-slate-900 outline-none resize-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsRejecting(false)}
                        className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium bg-white"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs inline-flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Confirm Rejection
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
