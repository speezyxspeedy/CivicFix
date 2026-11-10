import React from 'react';
import { db } from '../../services/db';
import { UserProfile } from '../../types';
import { StatusBadge, PriorityBadge, SLABadge } from '../../components/StatusBadge';
import {
  HardHat,
  Clock,
  MapPin,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone
} from 'lucide-react';

interface FieldOperationsViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const FieldOperationsView: React.FC<FieldOperationsViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const allComplaints = db.getComplaints(false);
  const activeOps = allComplaints.filter(
    (c) => c.status === 'ASSIGNED' || c.status === 'IN PROGRESS'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-1">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            Live Ground Operations
          </div>
          <h1 className="text-xl font-bold text-slate-900">Field Operations Command</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time repair progress, dispatched crews, and active ground intervention timelines.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs flex items-center gap-2">
          <span>{activeOps.length} Active Field Tasks</span>
        </div>
      </div>

      {activeOps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <HardHat className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">No Field Tasks Currently Active</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All assigned jobs have either reached resolution verification or are awaiting assignment from the Review Queue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeOps.map((task) => {
            const sla = db.getSLAStatus(task);
            const updates = db.getComplaintUpdates(task.id);
            const latestWorkerUpdate = [...updates]
              .reverse()
              .find((u) => u.updater_role === 'WORKER');

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {task.complaint_code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} isDemo={task.is_demo} />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <HardHat className="w-3.5 h-3.5 text-indigo-600" />
                        {task.assigned_worker?.full_name || 'Assigned Crew'}
                      </span>
                      <span className="text-[11px] text-indigo-700 font-semibold font-mono">
                        {task.assigned_worker?.phone}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Specialization: {task.assigned_worker?.specialization} • Zone: {task.locality}
                    </div>
                  </div>

                  {latestWorkerUpdate && (
                    <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 space-y-0.5">
                      <span className="font-bold">Latest Ground Note:</span>
                      <p>{latestWorkerUpdate.update_note}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{task.locality}</span>
                    </div>

                    <div className="flex items-center justify-end gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Elapsed: {sla.elapsedHours}h</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <SLABadge sla={sla} />

                  <button
                    onClick={() => onNavigate('admin-all-complaints', task.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    View Timeline →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
