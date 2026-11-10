import React from 'react';
import { db } from '../../services/db';
import { UserProfile } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { BeforeAfterSlider } from '../../components/BeforeAfterSlider';
import { CheckCircle2, Calendar, MapPin, Star } from 'lucide-react';

interface CompletedTasksViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const CompletedTasksView: React.FC<CompletedTasksViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const myComplaints = db.getComplaints(true);
  const completed = myComplaints.filter((c) => c.status === 'RESOLVED');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified Field Records
          </div>
          <h1 className="text-xl font-bold text-slate-900">Completed & Verified Assignments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            History of all tasks completed by you that have received formal administrative sign-off.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs font-mono">
          {completed.length} Verified Closures
        </span>
      </div>

      {completed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">No Verified Closures Yet</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Once you submit resolution evidence and an administrator approves it, completed tasks will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {completed.map((task) => {
            const beforePhoto = task.media?.find((m) => m.media_type === 'BEFORE')?.preview_url;
            const afterPhoto = task.media?.find((m) => m.media_type === 'AFTER')?.preview_url;

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                      {task.complaint_code}
                    </span>
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} isDemo={task.is_demo} />
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Resolved: {new Date(task.resolved_at || task.updated_at).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900">{task.title}</h2>

                {/* Before / After Slider */}
                {beforePhoto && afterPhoto && (
                  <BeforeAfterSlider
                    beforeUrl={beforePhoto}
                    afterUrl={afterPhoto}
                    aspectRatio="aspect-16/9"
                    title="Verified Completion Evidence"
                  />
                )}

                {/* Citizen Feedback if available */}
                {task.feedback && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">
                        Citizen Rating: {task.feedback.rating}/5
                      </span>
                      {task.feedback.comment && (
                        <span className="text-slate-600 italic">
                          — "{task.feedback.comment}"
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
