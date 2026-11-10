import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile } from '../../types';
import {
  Settings,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  X,
  ExternalLink,
  Save
} from 'lucide-react';

interface SettingsModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const config = db.getSupabaseConfig();
  const [sbUrl, setSbUrl] = useState(config.url || '');
  const [sbKey, setSbKey] = useState(config.anonKey || '');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = db.configureSupabase(sbUrl, sbKey);
    if (ok) {
      setStatusMsg(
        sbUrl.trim()
          ? 'Connected to live Supabase backend instance.'
          : 'Reverted to local Demo Workspace (with simulated RLS & storage).'
      );
    } else {
      setStatusMsg('Connection error. Please check Supabase URL and Publishable Anon Key.');
    }
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        'Reset workspace to initial demo dataset? This will restore sample potholes, waste, streetlight, and water leakage records.'
      )
    ) {
      db.resetToDemoData();
      setStatusMsg('Demo workspace reset to default realistic scenarios.');
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Database & System Configuration</h3>
              <p className="text-[11px] text-slate-500">Live Supabase Cloud or Local Demo Workspace</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Supabase Connection Form */}
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Supabase Connection (Optional)</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              CivicFix operates with full local reactive persistence and RLS simulation out of the box. To connect your live Supabase cloud project, enter your project URL and publishable (anon) key below.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://your-project-id.supabase.co"
              value={sbUrl}
              onChange={(e) => setSbUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supabase Publishable / Anon Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={sbKey}
              onChange={(e) => setSbKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 outline-none"
            />
            <p className="text-[10px] text-rose-600 font-semibold mt-1">
              ⚠️ SECURITY RULE: NEVER enter the service_role secret here. Only enter your public anon key.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setSbUrl('');
                setSbKey('');
                db.configureSupabase('', '');
                setStatusMsg('Switched to Local Demo Workspace.');
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 underline"
            >
              Clear Cloud Keys
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs inline-flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Connection
            </button>
          </div>
        </form>

        {/* Demo Workspace Reset */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Reset Demo Workspace
              </h4>
              <p className="text-[11px] text-slate-500">
                Restores realistic demo complaints across all 5 municipal domains.
              </p>
            </div>

            <button
              onClick={handleResetDemo}
              className="px-3.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>
          </div>
        </div>

        {/* SQL Schema Reference */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="font-bold text-slate-800">PostgreSQL Schema Reference</div>
          <p className="text-[11px] text-slate-500">
            The full database schema with Row Level Security (RLS) policies, triggers, and RPC functions is available in <code className="font-mono text-emerald-700">/supabase-schema.sql</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
