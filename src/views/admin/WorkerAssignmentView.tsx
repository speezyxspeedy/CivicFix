import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, Worker, Complaint } from '../../types';
import { PriorityBadge, StatusBadge } from '../../components/StatusBadge';
import {
  Users,
  HardHat,
  PlusCircle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  UserPlus,
  Briefcase,
  AlertCircle,
  X
} from 'lucide-react';

interface WorkerAssignmentViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const WorkerAssignmentView: React.FC<WorkerAssignmentViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const workers = db.getWorkers();
  const allComplaints = db.getComplaints(false);

  // Complaints ready for worker dispatch
  const unassignedVerified = allComplaints.filter((c) => c.status === 'VERIFIED');

  // Assignment modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || '');
  const [instructions, setInstructions] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New worker modal state
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerSpec, setNewWorkerSpec] = useState('Road Maintenance');
  const [newWorkerArea, setNewWorkerArea] = useState('Greenwood & Sector 4');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedWorkerId) return;

    db.assignWorker(selectedComplaint.id, selectedWorkerId, instructions);
    const worker = workers.find((w) => w.id === selectedWorkerId);

    setSuccessMsg(
      `Dispatched task ${selectedComplaint.complaint_code} to ${worker?.full_name} (${worker?.specialization}).`
    );
    setSelectedComplaint(null);
    setInstructions('');

    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  const handleAddWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim() || !newWorkerPhone.trim()) return;

    db.addWorker({
      profile_id: 'user-worker-' + Date.now(),
      full_name: newWorkerName.trim(),
      specialization: newWorkerSpec,
      assigned_area: newWorkerArea,
      phone: newWorkerPhone.trim(),
      email: newWorkerEmail.trim() || `worker.${Date.now()}@civicfix.org`,
      availability: true
    });

    setShowAddWorker(false);
    setNewWorkerName('');
    setNewWorkerPhone('');
    setNewWorkerEmail('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 mb-1">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            Field Operations Management
          </div>
          <h1 className="text-xl font-bold text-slate-900">Worker Directory & Task Dispatch</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor technician workloads, specializations, zones, and assign verified civic incidents.
          </p>
        </div>

        <button
          onClick={() => setShowAddWorker(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Field Technician
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Unassigned Verified Complaints Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Verified Complaints Ready for Dispatch ({unassignedVerified.length})
            </h2>
            <p className="text-xs text-slate-500">
              These complaints have passed triage and require technician assignment.
            </p>
          </div>
        </div>

        {unassignedVerified.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            No unassigned verified complaints right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unassignedVerified.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all bg-white flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {c.complaint_code}
                    </span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span className="text-emerald-700 font-semibold">{c.category_name}</span>
                    <span>•</span>
                    <span>{c.locality}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedComplaint(c);
                      // Auto pick matching specialization worker if possible
                      const match = workers.find((w) =>
                        c.category_name?.toLowerCase().includes(w.specialization.split(' ')[0].toLowerCase())
                      );
                      if (match) setSelectedWorkerId(match.id);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    <HardHat className="w-3.5 h-3.5" />
                    Dispatch Field Worker
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Field Technicians Roster Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Certified Field Crew Roster ({workers.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {worker.worker_code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    worker.availability
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {worker.availability ? 'Available' : 'On Leave'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{worker.full_name}</h3>
                <div className="text-xs text-indigo-700 font-semibold flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  {worker.specialization}
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{worker.assigned_area}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{worker.phone}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Active Workload:</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded ${
                    worker.active_assignment_count > 2
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {worker.active_assignment_count} tasks
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worker Assignment Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Dispatch Task to Field Worker</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">
                {selectedComplaint.complaint_code}: {selectedComplaint.title}
              </div>
              <div className="text-slate-600">
                Category: <strong>{selectedComplaint.category_name}</strong> • Locality:{' '}
                <strong>{selectedComplaint.locality}</strong>
              </div>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Field Worker
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.full_name} — {w.specialization} ({w.assigned_area} | {w.active_assignment_count} active tasks)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Operational Instructions for Worker (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Bring cold patch bitumen compound. Check for secondary hairline fractures."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs inline-flex items-center gap-1.5"
                >
                  <HardHat className="w-3.5 h-3.5" />
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      {showAddWorker && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Field Worker</h3>
              <button onClick={() => setShowAddWorker(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWorkerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kulkarni"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Specialization</label>
                <select
                  value={newWorkerSpec}
                  onChange={(e) => setNewWorkerSpec(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none bg-white"
                >
                  <option value="Road Maintenance">Road Maintenance</option>
                  <option value="Sanitation & Solid Waste">Sanitation & Solid Waste</option>
                  <option value="Drainage & Water Supply">Drainage & Water Supply</option>
                  <option value="Electrical & Streetlights">Electrical & Streetlights</option>
                  <option value="General Public Works">General Public Works</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Area</label>
                <input
                  type="text"
                  placeholder="e.g. Central Zone & Sector 9"
                  value={newWorkerArea}
                  onChange={(e) => setNewWorkerArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98200 11223"
                  value={newWorkerPhone}
                  onChange={(e) => setNewWorkerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddWorker(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Register Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
