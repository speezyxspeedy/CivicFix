import React from 'react';
import { UserRole } from '../types';
import {
  Home,
  PlusCircle,
  FolderOpen,
  Search,
  Bell,
  User,
  LayoutDashboard,
  ListFilter,
  CheckSquare,
  Copy,
  Users,
  HardHat,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
  Tags,
  Settings,
  MapPin,
  ClipboardCheck
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: number;
  badgeColor?: string;
}

interface SidebarProps {
  role: UserRole;
  currentView: string;
  onNavigate: (view: string) => void;
  reviewQueueCount?: number;
  duplicateCount?: number;
  resolutionReviewCount?: number;
  workerTaskCount?: number;
  unreadNotifsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  currentView,
  onNavigate,
  reviewQueueCount = 0,
  duplicateCount = 0,
  resolutionReviewCount = 0,
  workerTaskCount = 0,
  unreadNotifsCount = 0
}) => {
  // Navigation definitions based on specification Section 3
  const citizenItems: NavItem[] = [
    { id: 'citizen-home', label: 'Home', icon: Home },
    { id: 'citizen-report', label: 'Report an Issue', icon: PlusCircle, highlight: true },
    { id: 'citizen-complaints', label: 'My Complaints', icon: FolderOpen },
    { id: 'citizen-track', label: 'Track Complaint', icon: Search },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const adminItems: NavItem[] = [
    { id: 'admin-overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'admin-all-complaints', label: 'All Complaints', icon: ListFilter },
    { id: 'admin-review-queue', label: 'Review Queue', icon: CheckSquare, badge: reviewQueueCount, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'admin-duplicates', label: 'Duplicate Reports', icon: Copy, badge: duplicateCount, badgeColor: 'bg-orange-100 text-orange-800' },
    { id: 'admin-assignments', label: 'Worker Assignment', icon: Users },
    { id: 'admin-field-ops', label: 'Field Operations', icon: HardHat },
    { id: 'admin-resolutions', label: 'Resolution Tracking', icon: Sparkles, badge: resolutionReviewCount, badgeColor: 'bg-purple-100 text-purple-800' },
    { id: 'admin-analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'admin-reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'admin-categories', label: 'Categories & SLAs', icon: Tags },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const workerItems: NavItem[] = [
    { id: 'worker-assignments', label: 'My Assignments', icon: ClipboardCheck, badge: workerTaskCount, badgeColor: 'bg-indigo-100 text-indigo-800' },
    { id: 'worker-active', label: 'Active Tasks', icon: HardHat },
    { id: 'worker-completed', label: 'Completed Tasks', icon: CheckSquare },
    { id: 'worker-locations', label: 'Location Details', icon: MapPin },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const getItems = () => {
    switch (role) {
      case 'ADMIN':
        return adminItems;
      case 'WORKER':
        return workerItems;
      default:
        return citizenItems;
    }
  };

  const items = getItems();

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 md:min-h-[calc(100vh-4rem)] p-3 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {role === 'ADMIN' ? 'Admin Portal' : role === 'WORKER' ? 'Field Crew App' : 'Citizen Services'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs'
                      : item.highlight
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-emerald-700'
                          : item.highlight
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badgeColor || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="mt-6 pt-4 border-t border-slate-100 px-3">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-700">
            <span>CivicFix Engine</span>
            <span className="text-emerald-600 font-mono">v1.2.0</span>
          </div>
          <p className="text-[10px] leading-tight text-slate-400">
            Independent civic coordination platform. Not affiliated with government authorities.
          </p>
        </div>
      </div>
    </aside>
  );
};
