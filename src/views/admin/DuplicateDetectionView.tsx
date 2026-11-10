import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, Complaint } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import {
  Copy,
  CheckCircle2,
  XCircle,
  Link,
  MapPin,
  Calendar,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface DuplicateDetectionViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const DuplicateDetectionView: React.FC<DuplicateDetectionViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const duplicates = db.scanForDuplicates();
  const [selectedPairIndex, setSelectedPairIndex] = useState<number>(0);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const currentPair = duplicates[selectedPairIndex];

  const handleLink = (decision: 'LINKED_AS_DUPLICATE' | 'DISMISSED' | 'RELATED_SUB_ISSUE') => {
    if (!currentPair) return;

    db.linkAsDuplicate(
      currentPair.primary.id,
      currentPair.candidate.id,
      decision,
      currentPair.similarityScore,
      currentPair.matchReasons
    );

    setActionMessage(
      decision === 'LINKED_AS_DUPLICATE'
        ? `Successfully linked ${currentPair.candidate.complaint_code} to primary issue ${currentPair.primary.complaint_code}. Citizen history preserved.`
        : `Suggestion dismissed as distinct independent issue.`
    );

    setTimeout(() => {
      setActionMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200 mb-1">
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            Duplicate Intelligence Engine
          </div>
          <h1 className="text-xl font-bold text-slate-900">Duplicate Incident Detector</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-references title semantics, category matches, locality names, and GPS coordinate proximity to group related citizen reports.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 font-bold text-xs flex items-center gap-2">
          <Copy className="w-4 h-4 text-orange-600" />
          <span>{duplicates.length} Potential Duplicate Suggestions</span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {duplicates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No Potential Duplicates Detected</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All active complaints in the system currently represent distinct geographic locations or categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Duplicate Pairs List (Left) */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Detected Pairs ({duplicates.length})
            </h2>

            <div className="space-y-2">
              {duplicates.map((pair, idx) => {
                const isSelected = selectedPairIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPairIndex(idx)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/70 border-orange-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                        {pair.similarityScore}% Match Confidence
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {pair.primary.complaint_code} ⟷ {pair.candidate.complaint_code}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 line-clamp-1">
                      {pair.primary.title}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      vs: {pair.candidate.title}
                    </div>

                    <div className="text-[11px] text-emerald-700 font-medium mt-2">
                      {pair.matchReasons[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side-by-Side Comparison Workspace (Right) */}
          {currentPair && (
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
                {/* Confidence Bar */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-orange-900">
                      Similarity Confidence: {currentPair.similarityScore}%
                    </div>
                    <p className="text-[11px] text-orange-700 mt-0.5">
                      Matched on: {currentPair.matchReasons.join(' • ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLink('DISMISSED')}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium"
                    >
                      Dismiss (Distinct Issue)
                    </button>
                    <button
                      onClick={() => handleLink('LINKED_AS_DUPLICATE')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Link className="w-3.5 h-3.5" />
                      Link to Primary
                    </button>
                  </div>
                </div>

                {/* Side-by-Side Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Complaint */}
                  <div className="p-4 rounded-xl border-2 border-emerald-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                        Primary (Earlier Report)
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {currentPair.primary.complaint_code}
                      </span>
                    </div>

                    {currentPair.primary.media?.[0] && (
                      <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={currentPair.primary.media[0].preview_url}
                          alt="Primary Report"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <h3 className="text-xs font-bold text-slate-900">
                      {currentPair.primary.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 line-clamp-3">
                      {currentPair.primary.description}
                    </p>

                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 space-y-1">
                      <div>
                        <strong>Locality:</strong> {currentPair.primary.locality}
                      </div>
                      <div>
                        <strong>Submitted:</strong>{' '}
                        {new Date(currentPair.primary.submitted_at).toLocaleString()}
                      </div>
                      <div>
                        <strong>Citizen:</strong> {currentPair.primary.citizen_name}
                      </div>
                    </div>
                  </div>

                  {/* Candidate Duplicate */}
                  <div className="p-4 rounded-xl border-2 border-orange-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 uppercase tracking-wider">
                        Potential Duplicate
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {currentPair.candidate.complaint_code}
                      </span>
                    </div>

                    {currentPair.candidate.media?.[0] && (
                      <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={currentPair.candidate.media[0].preview_url}
                          alt="Candidate Report"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <h3 className="text-xs font-bold text-slate-900">
                      {currentPair.candidate.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 line-clamp-3">
                      {currentPair.candidate.description}
                    </p>

                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 space-y-1">
                      <div>
                        <strong>Locality:</strong> {currentPair.candidate.locality}
                      </div>
                      <div>
                        <strong>Submitted:</strong>{' '}
                        {new Date(currentPair.candidate.submitted_at).toLocaleString()}
                      </div>
                      <div>
                        <strong>Citizen:</strong> {currentPair.candidate.citizen_name}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 text-[11px] text-slate-500 leading-relaxed border border-slate-200">
                  <strong>Policy Reminder:</strong> Linking as a duplicate does NOT delete or silence the citizen's report. The reporting citizen will continue to receive live status updates as the primary operational issue progresses.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
