import React from 'react';
import { ComplaintUpdate } from '../types';
import { Clock, CheckCircle2, User, Wrench, Shield, AlertTriangle } from 'lucide-react';

interface ComplaintTimelineProps {
  updates: ComplaintUpdate[];
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ updates }) => {
  if (updates.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
        <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">No activity records logged yet.</p>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3.5 h-3.5 text-sky-600" />;
      case 'WORKER':
        return <Wrench className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <User className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'border-emerald-500 bg-emerald-50 text-emerald-700';
      case 'REJECTED':
        return 'border-rose-500 bg-rose-50 text-rose-700';
      case 'IN PROGRESS':
      case 'RESOLUTION SUBMITTED':
        return 'border-blue-500 bg-blue-50 text-blue-700';
      case 'VERIFIED':
      case 'ASSIGNED':
        return 'border-sky-500 bg-sky-50 text-sky-700';
      default:
        return 'border-amber-500 bg-amber-50 text-amber-700';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {updates.map((update, index) => {
        const isLatest = index === updates.length - 1;
        const date = new Date(update.created_at);
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <div key={update.id} className="relative group">
            {/* Dot marker */}
            <div
              className={`absolute -left-[30px] top-1 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center shadow-xs transition-colors ${
                isLatest ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-300'
              }`}
            >
              {isLatest ? (
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              )}
            </div>

            {/* Content card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(
                      update.new_status
                    )}`}
                  >
                    {update.new_status}
                  </span>
                  {update.previous_status && (
                    <span className="text-xs text-slate-400">
                      from <span className="font-medium text-slate-600">{update.previous_status}</span>
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {formattedDate} • {formattedTime}
                </div>
              </div>

              <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                {update.update_note}
              </p>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-1 font-medium text-slate-700">
                  {getRoleIcon(update.updater_role)}
                  <span>{update.updater_name}</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] uppercase">
                  {update.updater_role}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
