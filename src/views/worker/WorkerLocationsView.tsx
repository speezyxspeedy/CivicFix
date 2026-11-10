import React from 'react';
import { db } from '../../services/db';
import { UserProfile } from '../../types';
import { MapPin, Navigation, ExternalLink, HardHat, CheckCircle2 } from 'lucide-react';

interface WorkerLocationsViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const WorkerLocationsView: React.FC<WorkerLocationsViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const myComplaints = db.getComplaints(true);
  const activeLocations = myComplaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Assigned Zones & Route Map
          </div>
          <h1 className="text-xl font-bold text-slate-900">Assigned Area & Field Route</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic coordinates and landmarks for your current active dispatch itinerary.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs font-mono">
          {activeLocations.length} Route Stops
        </span>
      </div>

      {/* Locations List */}
      <div className="space-y-3">
        {activeLocations.map((c, index) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
                #{index + 1}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {c.complaint_code}
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold">{c.category_name}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>

                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{c.locality}</span>
                  {c.street && <span>• {c.street}</span>}
                  {c.landmark && <span className="text-slate-400 font-medium">({c.landmark})</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {c.latitude && c.longitude ? (
                <a
                  href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Open Navigation <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-xs text-slate-400">Manual Address</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
