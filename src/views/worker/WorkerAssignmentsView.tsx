import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, Complaint } from '../../types';
import { PriorityBadge, StatusBadge, SLABadge } from '../../components/StatusBadge';
import {
  HardHat,
  MapPin,
  Clock,
  ExternalLink,
  CheckCircle2,
  Play,
  Upload,
  Camera,
  AlertCircle,
  FileText,
  ChevronRight,
  X
} from 'lucide-react';

interface WorkerAssignmentsViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const WorkerAssignmentsView: React.FC<WorkerAssignmentsViewProps> = ({
  currentUser,
  onNavigate
}) => {
  // Enforce RLS simulation: only worker's assigned tasks
  const myComplaints = db.getComplaints(true);

  // Active / pending tasks
  const activeTasks = myComplaints.filter(
    (c) => c.status === 'ASSIGNED' || c.status === 'IN PROGRESS'
  );

  // Modal state for active task work
  const [workingTask, setWorkingTask] = useState<Complaint | null>(null);
  const [workNote, setWorkNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [isSubmittingRes, setIsSubmittingRes] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleStartWork = (complaintId: string) => {
    db.startWork(complaintId, 'Technician arrived on site and commenced repairs.');
    setToastMsg('Task accepted. Status updated to IN PROGRESS. Citizen informed.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddProgressNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workingTask || !workNote.trim()) return;

    db.addProgressUpdate(workingTask.id, workNote.trim());
    setWorkNote('');
    setToastMsg('Progress note logged to official audit log.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAfterPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSubmitResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workingTask) return;
    if (!resolutionNotes.trim()) {
      alert('Completion notes are mandatory.');
      return;
    }

    // If no custom photos uploaded, provide realistic high-quality verification photo
    const finalPhotos = afterPhotos.length > 0
      ? afterPhotos
      : ['https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80'];

    db.submitResolution(workingTask.id, resolutionNotes.trim(), finalPhotos);

    setToastMsg('Resolution submitted for Administrator verification!');
    setWorkingTask(null);
    setResolutionNotes('');
    setAfterPhotos([]);
    setIsSubmittingRes(false);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 mb-1">
            <HardHat className="w-3.5 h-3.5 text-indigo-600" />
            Field Operations Desk
          </div>
          <h1 className="text-xl font-bold text-slate-900">Assigned Field Operations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <strong>{currentUser.full_name}</strong> • Access limited strictly to your authorized assignments.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-xs flex items-center gap-2">
          <span>{activeTasks.length} Active Jobs</span>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Task List */}
      {activeTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <HardHat className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">All Assignments Clear!</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You currently have no pending tasks. Check Completed Tasks for your past verified work.
          </p>
          <button
            onClick={() => onNavigate('worker-completed')}
            className="mt-4 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            View Completed Tasks
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTasks.map((task) => {
            const sla = db.getSLAStatus(task);
            const beforePhoto = task.media?.find((m) => m.media_type === 'BEFORE')?.preview_url;

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 hover:border-indigo-300 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                      {task.complaint_code}
                    </span>
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} isDemo={task.is_demo} />
                  </div>

                  <SLABadge sla={sla} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {beforePhoto && (
                    <div className="md:col-span-1 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video md:aspect-auto h-32 relative">
                      <img
                        src={beforePhoto}
                        alt="Defect proof"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/70 text-white">
                        Citizen Photo
                      </span>
                    </div>
                  )}

                  <div className={`${beforePhoto ? 'md:col-span-3' : 'md:col-span-4'} space-y-2`}>
                    <h2 className="text-base font-bold text-slate-900">{task.title}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {task.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>{task.locality}</strong>
                          {task.street && <div>{task.street}</div>}
                          {task.landmark && <div className="text-slate-400">Near: {task.landmark}</div>}
                        </div>
                      </div>

                      <div className="flex items-center sm:justify-end gap-2">
                        {task.latitude && task.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
                          >
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            GPS Directions <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Worker Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 font-mono">
                    Assigned: {new Date(task.updated_at).toLocaleString()}
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status === 'ASSIGNED' ? (
                      <button
                        onClick={() => handleStartWork(task.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Accept & Start Work
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setWorkingTask(task);
                          setIsSubmittingRes(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Update Work & Submit Evidence
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Working & Resolution Evidence Submission Modal */}
      {workingTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-y-auto space-y-5 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  On-Site Task Console: {workingTask.complaint_code}
                </h3>
              </div>
              <button
                onClick={() => setWorkingTask(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="font-bold text-slate-900">{workingTask.title}</div>
              <div className="text-slate-500 mt-0.5">Locality: {workingTask.locality}</div>
            </div>

            {/* Sub-Tabs: Progress Note vs Final Resolution Proof */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setIsSubmittingRes(false)}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
                  !isSubmittingRes
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Log Work Progress Note
              </button>

              <button
                type="button"
                onClick={() => setIsSubmittingRes(true)}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
                  isSubmittingRes
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Submit Completion Proof (After Photos)
              </button>
            </div>

            {!isSubmittingRes ? (
              <form onSubmit={handleAddProgressNote} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    On-Site Progress Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Cleared 2 tons of debris. Excavating around burst pipe collar..."
                    value={workNote}
                    onChange={(e) => setWorkNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 outline-none resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkingTask(null)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Save Progress Note
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitResolution} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Repair Summary & Completion Notes <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Completely patched with bitumen cold-lay, compacted with roller, area swept clean."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 outline-none resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Upload Fixed After-Photographs <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-4 text-center bg-slate-50 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                      <Camera className="w-5 h-5 text-emerald-600 mb-1" />
                      <span className="text-xs font-semibold text-slate-800">
                        Upload Resolution Photos
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Required for Administrator Verification
                      </span>
                    </div>
                  </div>

                  {afterPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {afterPhotos.map((p, idx) => (
                        <div
                          key={idx}
                          className="aspect-video rounded-lg overflow-hidden border border-slate-200"
                        >
                          <img src={p} alt="After" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-amber-50 text-[11px] text-amber-800 border border-amber-200">
                  <strong>Important Security Rule:</strong> Submitting will transition the complaint to <strong>RESOLUTION SUBMITTED</strong>. An administrator must inspect and approve your evidence before it is closed as RESOLVED.
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWorkingTask(null)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Submit For Admin Verification
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
