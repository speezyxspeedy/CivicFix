import React from 'react';
import { ComplaintPriority, ComplaintStatus, SLAStatus } from '../types';
import { AlertTriangle, Clock, CheckCircle2, XCircle, ArrowUpRight, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export const StatusBadge: React.FC<{ status: ComplaintStatus; isDemo?: boolean }> = ({ status, isDemo }) => {
  const getStyle = () => {
    switch (status) {
      case 'SUBMITTED':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          dot: 'bg-amber-500',
          icon: Clock
        };
      case 'UNDER REVIEW':
        return {
          bg: 'bg-orange-50 border-orange-200 text-orange-800',
          dot: 'bg-orange-500',
          icon: Clock
        };
      case 'VERIFIED':
        return {
          bg: 'bg-sky-50 border-sky-200 text-sky-800',
          dot: 'bg-sky-500',
          icon: ShieldAlert
        };
      case 'ASSIGNED':
        return {
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          dot: 'bg-indigo-500',
          icon: ArrowUpRight
        };
      case 'IN PROGRESS':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-800',
          dot: 'bg-blue-500 animate-pulse',
          icon: RefreshCw
        };
      case 'RESOLUTION SUBMITTED':
        return {
          bg: 'bg-purple-50 border-purple-200 text-purple-800',
          dot: 'bg-purple-500',
          icon: Sparkles
        };
      case 'RESOLVED':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-500',
          icon: CheckCircle2
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-500',
          icon: XCircle
        };
      case 'REOPENED':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-900',
          dot: 'bg-amber-600',
          icon: AlertTriangle
        };
      default:
        return {
          bg: 'bg-slate-100 border-slate-200 text-slate-700',
          dot: 'bg-slate-400',
          icon: Clock
        };
    }
  };

  const style = getStyle();
  const Icon = style.icon;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        <Icon className="w-3 h-3" />
        {status}
      </span>
      {isDemo && (
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
          Demo
        </span>
      )}
    </div>
  );
};

export const PriorityBadge: React.FC<{ priority: ComplaintPriority }> = ({ priority }) => {
  switch (priority) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          MEDIUM
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          LOW
        </span>
      );
    default:
      return null;
  }
};

export const SLABadge: React.FC<{ sla: SLAStatus }> = ({ sla }) => {
  switch (sla.status) {
    case 'OVERDUE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          OVERDUE (+{sla.overdueHours}h)
        </span>
      );
    case 'DUE SOON':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          DUE SOON ({sla.remainingHours}h left)
        </span>
      );
    case 'ON TRACK':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ON TRACK ({sla.remainingHours}h left)
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
          RESOLVED ({sla.elapsedHours}h total)
        </span>
      );
  }
};
