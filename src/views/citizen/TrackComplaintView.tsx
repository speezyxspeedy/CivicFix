import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, Complaint } from '../../types';
import { StatusBadge, PriorityBadge, SLABadge } from '../../components/StatusBadge';
import { ComplaintTimeline } from '../../components/ComplaintTimeline';
import { BeforeAfterSlider } from '../../components/BeforeAfterSlider';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  HardHat,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface TrackComplaintViewProps {
  currentUser: UserProfile;
  initialComplaintId?: string;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const TrackComplaintView: React.FC<TrackComplaintViewProps> = ({
  currentUser,
  initialComplaintId,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState(initialComplaintId || '');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | undefined>(() => {
    if (initialComplaintId) {
      return db.getComplaintById(initialComplaintId);
    }
    // Default to the first complaint available to citizen
    const myComplaints = db.getComplaints(true);
    return myComplaints[0];
  });

  // Feedback form state
  const [rating, setRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackQuality, setFeedbackQuality] = useState<string>('Exceptional repair');
  const [feedbackSaved, setFeedbackSaved] = useState<boolean>(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = db.getComplaintById(searchQuery.trim());
    setSelectedComplaint(found);
    setFeedbackSaved(false);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    db.submitFeedback(selectedComplaint.id, rating, feedbackComment, feedbackQuality);
    setFeedbackSaved(true);
    // Refresh
    setSelectedComplaint(db.getComplaintById(selectedComplaint.id));
  };

  const updates = selectedComplaint ? db.getComplaintUpdates(selectedComplaint.id) : [];
  const sla = selectedComplaint ? db.getSLAStatus(selectedComplaint) : null;

  // Separate media by stage
  const beforePhotos = selectedComplaint?.media?.filter((m) => m.media_type === 'BEFORE') || [];
  const progressPhotos = selectedComplaint?.media?.filter((m) => m.media_type === 'DURING_WORK') || [];
  const afterPhotos = selectedComplaint?.media?.filter((m) => m.media_type === 'AFTER') || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="max-w-xl">
          <h1 className="text-xl font-bold text-slate-900">Track Civic Issue Lifecycle</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter your complaint reference code to view real-time field progress and verified resolution proof.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. CF-2026-000101"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shrink-0"
          >
            Lookup Complaint
          </button>
        </form>
      </div>

      {!selectedComplaint ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">Complaint Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            We couldn't find a complaint matching "{searchQuery}". Please check the ID or choose from your complaints history.
          </p>
          <button
            onClick={() => onNavigate('citizen-complaints')}
            className="mt-4 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            View My Complaints
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Complaint Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-base font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                  {selectedComplaint.complaint_code}
                </span>
                <StatusBadge status={selectedComplaint.status} isDemo={selectedComplaint.is_demo} />
                <PriorityBadge priority={selectedComplaint.priority} />
                {sla && <SLABadge sla={sla} />}
              </div>

              <span className="text-xs font-semibold text-slate-500">
                Category: <span className="text-slate-800">{selectedComplaint.category_name}</span>
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {selectedComplaint.title}
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              {selectedComplaint.description}
            </p>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Location</div>
                  <div>{selectedComplaint.locality}</div>
                  {selectedComplaint.street && <div>{selectedComplaint.street}</div>}
                  {selectedComplaint.landmark && (
                    <div className="text-slate-400 text-[11px] font-medium">Near: {selectedComplaint.landmark}</div>
                  )}
                  {selectedComplaint.latitude && selectedComplaint.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedComplaint.latitude},${selectedComplaint.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 hover:underline inline-flex items-center gap-1 text-[11px] mt-0.5"
                    >
                      Open in Public Map <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Submitted Timestamp</div>
                  <div>{new Date(selectedComplaint.submitted_at).toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400">By {selectedComplaint.citizen_name}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <HardHat className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Assigned Team</div>
                  <div>
                    {selectedComplaint.assigned_worker
                      ? `${selectedComplaint.assigned_worker.full_name} (${selectedComplaint.assigned_worker.specialization})`
                      : 'Pending Dispatch'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Status: {selectedComplaint.status}
                  </div>
                </div>
              </div>
            </div>

            {selectedComplaint.rejection_reason && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Administrative Decline Reason: </span>
                  {selectedComplaint.rejection_reason}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Before & After Slider (If Resolution submitted or resolved) */}
          {beforePhotos.length > 0 && afterPhotos.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Interactive Evidence Inspection
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Before & After Resolution Verification
                  </h3>
                </div>
              </div>

              <BeforeAfterSlider
                beforeUrl={beforePhotos[0].preview_url}
                afterUrl={afterPhotos[0].preview_url}
                beforeLabel="Reported Problem"
                afterLabel="Verified Fix"
                aspectRatio="aspect-16/9"
              />
            </div>
          )}

          {/* Photographic Evidence Gallery */}
          {selectedComplaint.media && selectedComplaint.media.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Attached Field Photographs ({selectedComplaint.media.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedComplaint.media.map((med, idx) => (
                  <div
                    key={med.id || idx}
                    className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group"
                  >
                    <div className="aspect-video relative overflow-hidden bg-slate-100">
                      <img
                        src={med.preview_url}
                        alt={med.description || 'Evidence'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs uppercase tracking-wider bg-slate-900/70">
                        {med.media_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="p-2.5 text-xs text-slate-600">
                      <p className="line-clamp-2">{med.description || 'Incident photograph'}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                        {new Date(med.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citizen Feedback Form (When Resolved) */}
          {selectedComplaint.status === 'RESOLVED' && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Star className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Rate Resolution Quality & Satisfaction
                  </h3>
                  <p className="text-xs text-slate-600">
                    Your feedback helps evaluate field technician performance and ensure municipal accountability.
                  </p>
                </div>
              </div>

              {selectedComplaint.feedback || feedbackSaved ? (
                <div className="p-4 rounded-xl bg-white border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (selectedComplaint.feedback?.rating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="font-bold text-slate-700 ml-1">
                      {selectedComplaint.feedback?.rating || rating} / 5 Stars
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800">
                    Quality Assessment: {selectedComplaint.feedback?.quality_assessment || feedbackQuality}
                  </div>
                  {selectedComplaint.feedback?.comment && (
                    <p className="text-slate-600 italic">
                      "{selectedComplaint.feedback.comment}"
                    </p>
                  )}
                  <p className="text-[11px] text-emerald-700 font-medium">
                    ✓ Feedback recorded in official civic audit log.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Overall Satisfaction (1 to 5 Stars)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">
                        {rating === 5 ? '5 - Exceptional' : rating === 4 ? '4 - Good' : rating === 3 ? '3 - Acceptable' : '2 - Needs Improvement'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Resolution Quality Assessment
                    </label>
                    <select
                      value={feedbackQuality}
                      onChange={(e) => setFeedbackQuality(e.target.value)}
                      className="w-full sm:w-80 px-3 py-2 rounded-lg border border-emerald-200 bg-white text-xs font-medium text-slate-800 outline-none"
                    >
                      <option value="Exceptional repair">Exceptional repair & complete cleanup</option>
                      <option value="Good and timely">Good and timely repair</option>
                      <option value="Adequate resolution">Adequate resolution</option>
                      <option value="Rough finish but functional">Rough finish but functional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Comments & Appreciation (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Share your experience or note any details about the fix..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-emerald-200 bg-white text-xs text-slate-800 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs inline-flex items-center gap-2 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Citizen Feedback
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Timeline Audit Trail */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Lifecycle Progress Timeline</h3>
                <p className="text-xs text-slate-500">
                  Every transition is signed with timestamps and role verifications.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500">
                {updates.length} Updates Recorded
              </span>
            </div>

            <ComplaintTimeline updates={updates} />
          </div>
        </div>
      )}
    </div>
  );
};
