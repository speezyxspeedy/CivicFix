import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, Complaint } from '../../types';
import { PriorityBadge, StatusBadge } from '../../components/StatusBadge';
import { BeforeAfterSlider } from '../../components/BeforeAfterSlider';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  HardHat,
  MessageSquare,
  FileCheck
} from 'lucide-react';

interface ResolutionTrackingViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const ResolutionTrackingView: React.FC<ResolutionTrackingViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const allComplaints = db.getComplaints(false);
  const queue = allComplaints.filter((c) => c.status === 'RESOLUTION SUBMITTED');

  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(
    queue[0] || null
  );

  const [reviewNotes, setReviewNotes] = useState('');
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    if (!reviewNotes.trim()) {
      setErrorMsg('Administrative verification notes are mandatory.');
      return;
    }

    db.reviewResolution(activeComplaint.id, decision, reviewNotes.trim());

    setFeedbackSuccess(
      decision === 'APPROVED'
        ? `Complaint ${activeComplaint.complaint_code} verified and officially RESOLVED. Citizen notified.`
        : `Resolution evidence rejected. ${activeComplaint.complaint_code} returned to IN PROGRESS for rework.`
    );

    setReviewNotes('');
    setErrorMsg(null);

    // Refresh queue
    const updated = db.getComplaints(false).filter((c) => c.status === 'RESOLUTION SUBMITTED');
    setActiveComplaint(updated[0] || null);

    setTimeout(() => {
      setFeedbackSuccess(null);
    }, 4000);
  };

  const beforePhotos = activeComplaint?.media?.filter((m) => m.media_type === 'BEFORE') || [];
  const afterPhotos = activeComplaint?.media?.filter((m) => m.media_type === 'AFTER') || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Quality Control & Verification
          </div>
          <h1 className="text-xl font-bold text-slate-900">Resolution Verification Desk</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect on-site completion photographs and worker repair notes before granting formal administrative sign-off.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-bold text-xs flex items-center gap-2">
          <span>{queue.length} Awaiting Quality Review</span>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {queue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900">All Resolutions Verified!</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No pending completion proofs awaiting supervisor review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue List (Left) */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Select Evidence to Inspect
            </h2>

            <div className="space-y-2">
              {queue.map((item) => {
                const isSelected = activeComplaint?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveComplaint(item);
                      setErrorMsg(null);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50/70 border-purple-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {item.complaint_code}
                      </span>
                      <PriorityBadge priority={item.priority} />
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h3>

                    <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                      <span className="truncate max-w-[150px]">{item.locality}</span>
                      <span className="text-indigo-700 font-semibold font-mono">
                        {item.assigned_worker?.full_name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification Workspace (Right) */}
          {activeComplaint && (
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                      {activeComplaint.complaint_code}
                    </span>
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                      Resolution Submitted by Worker
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Logged: {new Date(activeComplaint.updated_at).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-base font-bold text-slate-900">{activeComplaint.title}</h2>
                  <p className="text-xs text-slate-500">
                    Location: {activeComplaint.locality} • Assigned Crew:{' '}
                    <strong>{activeComplaint.assigned_worker?.full_name}</strong> (
                    {activeComplaint.assigned_worker?.specialization})
                  </p>
                </div>

                {/* Interactive Before & After Evidence Comparison */}
                {beforePhotos.length > 0 && afterPhotos.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Interactive Photographic Comparison
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Slide divider to inspect repair quality
                      </span>
                    </div>

                    <BeforeAfterSlider
                      beforeUrl={beforePhotos[0].preview_url}
                      afterUrl={afterPhotos[0].preview_url}
                      beforeLabel="Reported Problem"
                      afterLabel="Field Technician Repair"
                      aspectRatio="aspect-16/9"
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    Before or After photograph missing. Please review attached gallery below.
                  </div>
                )}

                {/* All Media Gallery */}
                {activeComplaint.media && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      All Evidence Photos ({activeComplaint.media.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {activeComplaint.media.map((med, idx) => (
                        <div
                          key={med.id || idx}
                          className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group"
                        >
                          <img
                            src={med.preview_url}
                            alt="Evidence"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-white bg-slate-900/70">
                            {med.media_type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision Form */}
                <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Administrative Decision & Verification Notes
                  </h3>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors">
                      <input
                        type="radio"
                        name="decision"
                        checked={decision === 'APPROVED'}
                        onChange={() => setDecision('APPROVED')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Approve & Mark Resolved
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl hover:bg-rose-100 transition-colors">
                      <input
                        type="radio"
                        name="decision"
                        checked={decision === 'REJECTED'}
                        onChange={() => setDecision('REJECTED')}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Reject (Send for Rework)
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Verification Assessment & Sign-Off Notes <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder={
                        decision === 'APPROVED'
                          ? 'e.g. Inspected after-photos. Bitumen surface flush with roadway. Sealed properly. Approved.'
                          : 'e.g. Edges not sealed. Debris left behind on sidewalk. Return to site to finish cleanup.'
                      }
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none resize-none"
                      required
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className={`px-6 py-2.5 rounded-xl text-white font-semibold text-xs shadow-xs inline-flex items-center gap-2 transition-colors ${
                        decision === 'APPROVED'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      <FileCheck className="w-4 h-4" />
                      {decision === 'APPROVED' ? 'Finalize & Close Complaint' : 'Return Task to Worker'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
