/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NotificationsModal } from './views/common/NotificationsModal';
import { SettingsModal } from './views/common/SettingsModal';
import { ProfileView } from './views/common/ProfileView';

// Citizen Views
import { CitizenHome } from './views/citizen/CitizenHome';
import { ReportIssueView } from './views/citizen/ReportIssueView';
import { MyComplaintsView } from './views/citizen/MyComplaintsView';
import { TrackComplaintView } from './views/citizen/TrackComplaintView';

// Admin Views
import { AdminOverview } from './views/admin/AdminOverview';
import { AllComplaintsView } from './views/admin/AllComplaintsView';
import { ReviewQueueView } from './views/admin/ReviewQueueView';
import { DuplicateDetectionView } from './views/admin/DuplicateDetectionView';
import { WorkerAssignmentView } from './views/admin/WorkerAssignmentView';
import { FieldOperationsView } from './views/admin/FieldOperationsView';
import { ResolutionTrackingView } from './views/admin/ResolutionTrackingView';
import { AnalyticsView } from './views/admin/AnalyticsView';
import { ReportsExportView } from './views/admin/ReportsExportView';
import { CategoriesView } from './views/admin/CategoriesView';

// Worker Views
import { WorkerAssignmentsView } from './views/worker/WorkerAssignmentsView';
import { CompletedTasksView } from './views/worker/CompletedTasksView';
import { WorkerLocationsView } from './views/worker/WorkerLocationsView';

import { Menu, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(db.getCurrentUser());
  const [currentView, setCurrentView] = useState<string>('citizen-home');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setTick] = useState(0);

  // Subscribe to reactive database changes
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setCurrentUser(db.getCurrentUser());
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // When user role changes, set reasonable default view
  useEffect(() => {
    if (currentUser.role === 'CITIZEN' && !currentView.startsWith('citizen') && currentView !== 'notifications' && currentView !== 'profile') {
      setCurrentView('citizen-home');
    } else if (currentUser.role === 'ADMIN' && !currentView.startsWith('admin') && currentView !== 'settings' && currentView !== 'notifications' && currentView !== 'profile') {
      setCurrentView('admin-overview');
    } else if (currentUser.role === 'WORKER' && !currentView.startsWith('worker') && currentView !== 'notifications' && currentView !== 'profile') {
      setCurrentView('worker-assignments');
    }
  }, [currentUser.role]);

  const handleNavigate = (view: string, complaintId?: string) => {
    if (complaintId) {
      setSelectedComplaintId(complaintId);
    }
    if (view === 'settings') {
      setIsSettingsOpen(true);
      return;
    }
    if (view === 'notifications') {
      setIsNotificationsOpen(true);
      return;
    }
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Badge calculations
  const allComplaints = db.getComplaints(false);
  const reviewQueueCount = allComplaints.filter((c) => c.status === 'SUBMITTED').length;
  const resolutionReviewCount = allComplaints.filter((c) => c.status === 'RESOLUTION SUBMITTED').length;
  const duplicateCount = db.scanForDuplicates().length;
  const unreadNotifsCount = db.getUnreadNotificationCount();
  const workerTaskCount = db.getComplaints(true).filter(
    (c) => c.status === 'ASSIGNED' || c.status === 'IN PROGRESS'
  ).length;

  // Render view router
  const renderViewContent = () => {
    switch (currentView) {
      // Citizen Views
      case 'citizen-home':
        return (
          <CitizenHome
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onSelectCategory={(catId) => setSelectedCategoryId(catId)}
          />
        );
      case 'citizen-report':
        return (
          <ReportIssueView
            currentUser={currentUser}
            initialCategoryId={selectedCategoryId}
            onNavigate={handleNavigate}
          />
        );
      case 'citizen-complaints':
        return <MyComplaintsView currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'citizen-track':
        return (
          <TrackComplaintView
            currentUser={currentUser}
            initialComplaintId={selectedComplaintId}
            onNavigate={handleNavigate}
          />
        );

      // Admin Views
      case 'admin-overview':
        return <AdminOverview currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'admin-all-complaints':
        return (
          <AllComplaintsView
            currentUser={currentUser}
            initialSelectedId={selectedComplaintId}
            onNavigate={handleNavigate}
          />
        );
      case 'admin-review-queue':
        return <ReviewQueueView currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'admin-duplicates':
        return <DuplicateDetectionView currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'admin-assignments':
        return <WorkerAssignmentView currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'admin-field-ops':
        return <FieldOperationsView currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'admin-resolutions':
        return <ResolutionTrackingView currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'admin-analytics':
        return <AnalyticsView currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'admin-reports':
        return <ReportsExportView currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'admin-categories':
        return <CategoriesView currentUser={currentUser} onNavigate={handleNavigate} />;

      // Worker Views
      case 'worker-assignments':
      case 'worker-active':
        return <WorkerAssignmentsView currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'worker-completed':
        return <CompletedTasksView currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'worker-locations':
        return <WorkerLocationsView currentUser={currentUser} onNavigate={handleNavigate} />;

      // Common Views
      case 'profile':
        return <ProfileView currentUser={currentUser} onNavigate={handleNavigate} />;

      default:
        return (
          <CitizenHome
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        unreadCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Mobile Menu Toggle Bar (Visible on mobile screens) */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between no-print">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Navigation Menu</span>
        </button>

        <span className="text-xs font-mono font-bold text-slate-500 uppercase">
          {currentUser.role}
        </span>
      </div>

      {/* Main Body Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Sidebar (Desktop always visible, Mobile slide-down) */}
        <div
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } md:block no-print z-30`}
        >
          <Sidebar
            role={currentUser.role}
            currentView={currentView}
            onNavigate={handleNavigate}
            reviewQueueCount={reviewQueueCount}
            duplicateCount={duplicateCount}
            resolutionReviewCount={resolutionReviewCount}
            workerTaskCount={workerTaskCount}
            unreadNotifsCount={unreadNotifsCount}
          />
        </div>

        {/* Viewport Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderViewContent()}
        </main>
      </div>

      {/* Notifications Drawer Modal */}
      <NotificationsModal
        currentUser={currentUser}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Settings Modal */}
      <SettingsModal
        currentUser={currentUser}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
