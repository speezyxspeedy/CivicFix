import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, NotificationItem } from '../../types';
import {
  Bell,
  CheckCircle2,
  CheckCheck,
  Clock,
  X,
  Volume2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface NotificationsModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onNavigate
}) => {
  if (!isOpen) return null;

  const notifs = db.getNotifications();
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const handleRequestBrowserPerm = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const result = await Notification.requestPermission();
      setBrowserPerm(result);
      if (result === 'granted') {
        new Notification('CivicFix Notifications Enabled', {
          body: 'You will receive status updates when your civic reports are verified or resolved.',
          icon: '/favicon.ico'
        });
      }
    } catch (e) {
      console.warn('Notification permission error', e);
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    db.markNotificationRead(n.id);
    onClose();

    if (n.related_complaint_id) {
      if (currentUser.role === 'CITIZEN') {
        onNavigate('citizen-track', n.related_complaint_id);
      } else if (currentUser.role === 'ADMIN') {
        onNavigate('admin-all-complaints', n.related_complaint_id);
      } else {
        onNavigate('worker-assignments', n.related_complaint_id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Notifications</h3>
              <p className="text-[11px] text-slate-500">Real-time alerts and state transitions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => db.markAllNotificationsRead()}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Notification Opt-In Banner */}
        {browserPerm !== 'granted' && typeof Notification !== 'undefined' && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Enable browser push alerts for instant status notifications</span>
            </div>
            <button
              onClick={handleRequestBrowserPerm}
              className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 shrink-0"
            >
              Enable
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto space-y-2 flex-1 pr-1">
          {notifs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No notifications yet.
            </div>
          ) : (
            notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  n.is_read
                    ? 'bg-white border-slate-100 hover:border-slate-200'
                    : 'bg-emerald-50/40 border-emerald-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 self-center" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
