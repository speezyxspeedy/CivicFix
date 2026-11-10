/**
 * CivicFix Data Management & Realtime Sync Engine
 * Handles full database operations, RLS constraints simulation,
 * SLA computations, duplicate detection, and live Supabase client synchronization.
 */

import {
  Complaint,
  Category,
  Worker,
  UserProfile,
  ComplaintUpdate,
  NotificationItem,
  DuplicateLink,
  ComplaintPriority,
  ComplaintStatus,
  SLAStatus,
  CitizenFeedback,
  ComplaintMedia
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_CATEGORIES,
  INITIAL_WORKERS,
  INITIAL_COMPLAINTS,
  INITIAL_UPDATES,
  INITIAL_NOTIFICATIONS
} from './demoData';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_PREFIX = 'civicfix_v1_';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

class CivicFixDatabase {
  private profiles: UserProfile[] = [];
  private categories: Category[] = [];
  private workers: Worker[] = [];
  private complaints: Complaint[] = [];
  private updates: ComplaintUpdate[] = [];
  private notifications: NotificationItem[] = [];
  private duplicateLinks: DuplicateLink[] = [];
  private currentUser: UserProfile = INITIAL_PROFILES[0]; // Default to Citizen
  private listeners: Set<() => void> = new Set();
  private supabaseClient: SupabaseClient | null = null;
  private supabaseConfig: SupabaseConfig = {
    url: '',
    anonKey: '',
    isConnected: false
  };

  constructor() {
    this.initData();
  }

  private initData() {
    try {
      const storedComplaints = localStorage.getItem(STORAGE_KEY_PREFIX + 'complaints');
      const storedCategories = localStorage.getItem(STORAGE_KEY_PREFIX + 'categories');
      const storedWorkers = localStorage.getItem(STORAGE_KEY_PREFIX + 'workers');
      const storedUpdates = localStorage.getItem(STORAGE_KEY_PREFIX + 'updates');
      const storedNotifs = localStorage.getItem(STORAGE_KEY_PREFIX + 'notifications');
      const storedUser = localStorage.getItem(STORAGE_KEY_PREFIX + 'current_user');
      const storedConfig = localStorage.getItem(STORAGE_KEY_PREFIX + 'sb_config');
      const storedDuplicates = localStorage.getItem(STORAGE_KEY_PREFIX + 'duplicate_links');

      this.categories = storedCategories ? JSON.parse(storedCategories) : INITIAL_CATEGORIES;
      this.workers = storedWorkers ? JSON.parse(storedWorkers) : INITIAL_WORKERS;
      this.complaints = storedComplaints ? JSON.parse(storedComplaints) : INITIAL_COMPLAINTS;
      this.updates = storedUpdates ? JSON.parse(storedUpdates) : INITIAL_UPDATES;
      this.notifications = storedNotifs ? JSON.parse(storedNotifs) : INITIAL_NOTIFICATIONS;
      this.profiles = INITIAL_PROFILES;
      this.duplicateLinks = storedDuplicates ? JSON.parse(storedDuplicates) : [];

      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      } else {
        this.currentUser = this.profiles[0]; // Citizen Ananya
      }

      if (storedConfig) {
        this.supabaseConfig = JSON.parse(storedConfig);
        if (this.supabaseConfig.url && this.supabaseConfig.anonKey) {
          try {
            this.supabaseClient = createClient(this.supabaseConfig.url, this.supabaseConfig.anonKey);
            this.supabaseConfig.isConnected = true;
          } catch (e) {
            console.error('Failed to init Supabase client', e);
            this.supabaseConfig.isConnected = false;
          }
        }
      }
    } catch (e) {
      console.warn('Could not read from local storage, using initial mock defaults', e);
      this.categories = INITIAL_CATEGORIES;
      this.workers = INITIAL_WORKERS;
      this.complaints = INITIAL_COMPLAINTS;
      this.updates = INITIAL_UPDATES;
      this.notifications = INITIAL_NOTIFICATIONS;
      this.profiles = INITIAL_PROFILES;
      this.currentUser = INITIAL_PROFILES[0];
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'complaints', JSON.stringify(this.complaints));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'categories', JSON.stringify(this.categories));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'workers', JSON.stringify(this.workers));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'updates', JSON.stringify(this.updates));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'notifications', JSON.stringify(this.notifications));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'current_user', JSON.stringify(this.currentUser));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'sb_config', JSON.stringify(this.supabaseConfig));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'duplicate_links', JSON.stringify(this.duplicateLinks));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Listener callback error', err);
      }
    });
  }

  // User & Authentication
  public getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  public setCurrentUser(user: UserProfile) {
    this.currentUser = user;
    this.persist();
  }

  public switchRole(role: 'CITIZEN' | 'ADMIN' | 'WORKER') {
    const found = this.profiles.find((p) => p.role === role);
    if (found) {
      this.currentUser = found;
      this.persist();
    }
  }

  public getProfiles(): UserProfile[] {
    return [...this.profiles];
  }

  // Supabase Configuration
  public getSupabaseConfig(): SupabaseConfig {
    return { ...this.supabaseConfig };
  }

  public configureSupabase(url: string, anonKey: string): boolean {
    if (!url.trim() || !anonKey.trim()) {
      this.supabaseConfig = { url: '', anonKey: '', isConnected: false };
      this.supabaseClient = null;
      this.persist();
      return true;
    }

    try {
      const client = createClient(url.trim(), anonKey.trim());
      this.supabaseClient = client;
      this.supabaseConfig = {
        url: url.trim(),
        anonKey: anonKey.trim(),
        isConnected: true
      };
      this.persist();
      return true;
    } catch (e) {
      console.error('Supabase connection failed:', e);
      return false;
    }
  }

  // Reset to initial demo state
  public resetToDemoData() {
    this.categories = INITIAL_CATEGORIES;
    this.workers = INITIAL_WORKERS;
    this.complaints = INITIAL_COMPLAINTS;
    this.updates = INITIAL_UPDATES;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.duplicateLinks = [];
    this.currentUser = INITIAL_PROFILES[0];
    this.persist();
  }

  // Categories
  public getCategories(): Category[] {
    return [...this.categories];
  }

  public updateCategorySLA(
    categoryId: string,
    sla: { critical: number; high: number; medium: number; low: number }
  ) {
    this.categories = this.categories.map((c) =>
      c.id === categoryId
        ? {
            ...c,
            sla_critical_hours: sla.critical,
            sla_high_hours: sla.high,
            sla_medium_hours: sla.medium,
            sla_low_hours: sla.low
          }
        : c
    );
    this.persist();
  }

  // Workers
  public getWorkers(): Worker[] {
    return [...this.workers];
  }

  public addWorker(worker: Omit<Worker, 'id' | 'worker_code' | 'active_assignment_count'>): Worker {
    const newId = 'wrk-' + Date.now();
    const newCode = 'WRK-' + worker.specialization.slice(0, 4).toUpperCase() + '-' + Math.floor(10 + Math.random() * 90);
    const newWorker: Worker = {
      ...worker,
      id: newId,
      worker_code: newCode,
      active_assignment_count: 0
    };
    this.workers.push(newWorker);
    this.persist();
    return newWorker;
  }

  public updateWorker(workerId: string, updates: Partial<Worker>) {
    this.workers = this.workers.map((w) => (w.id === workerId ? { ...w, ...updates } : w));
    this.persist();
  }

  // Complaints
  public getComplaints(filterRole?: boolean): Complaint[] {
    if (!filterRole) return [...this.complaints];

    // Enforce RLS simulation:
    // Citizens only see their own complaints
    if (this.currentUser.role === 'CITIZEN') {
      return this.complaints.filter((c) => c.citizen_id === this.currentUser.id);
    }

    // Workers only see their assigned complaints
    if (this.currentUser.role === 'WORKER') {
      const myWorker = this.workers.find((w) => w.profile_id === this.currentUser.id);
      if (!myWorker) return [];
      return this.complaints.filter((c) => c.assigned_worker?.id === myWorker.id);
    }

    // Admins see all complaints
    return [...this.complaints];
  }

  public getComplaintById(id: string): Complaint | undefined {
    return this.complaints.find((c) => c.id === id || c.complaint_code.toLowerCase() === id.toLowerCase());
  }

  // Generate Unique Complaint ID
  public generateUniqueCode(): string {
    const year = new Date().getFullYear();
    const existingCodes = this.complaints.map((c) => c.complaint_code);
    let sequence = 100 + this.complaints.length + 1;
    let code = `CF-${year}-${String(sequence).padStart(6, '0')}`;
    while (existingCodes.includes(code)) {
      sequence += 1;
      code = `CF-${year}-${String(sequence).padStart(6, '0')}`;
    }
    return code;
  }

  // Submit Complaint (Citizen)
  public submitComplaint(data: {
    title: string;
    description: string;
    category_id: string;
    locality: string;
    street?: string;
    landmark?: string;
    city: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    mediaList: Array<{
      preview_url: string;
      description?: string;
      file_name?: string;
      file_size_bytes?: number;
      mime_type?: string;
    }>;
  }): Complaint {
    const cat = this.categories.find((c) => c.id === data.category_id);
    const code = this.generateUniqueCode();
    const complaintId = 'cmp-' + Date.now();
    const now = new Date().toISOString();

    const media: ComplaintMedia[] = data.mediaList.map((m, idx) => ({
      id: `med-${complaintId}-${idx}`,
      complaint_id: complaintId,
      uploaded_by: this.currentUser.id,
      media_type: 'BEFORE',
      storage_path: `complaint-reports/${code}-photo-${idx + 1}.jpg`,
      preview_url: m.preview_url,
      file_name: m.file_name,
      file_size_bytes: m.file_size_bytes,
      mime_type: m.mime_type,
      description: m.description || 'Citizen submitted incident photograph',
      created_at: now
    }));

    const newComplaint: Complaint = {
      id: complaintId,
      complaint_code: code,
      citizen_id: this.currentUser.id,
      citizen_name: this.currentUser.full_name,
      citizen_phone: this.currentUser.phone,
      category_id: data.category_id,
      category_name: cat?.name || 'Other',
      title: data.title.trim(),
      description: data.description.trim(),
      locality: data.locality.trim(),
      street: data.street?.trim(),
      landmark: data.landmark?.trim(),
      city: data.city.trim() || 'Metro City',
      postal_code: data.postal_code?.trim(),
      latitude: data.latitude,
      longitude: data.longitude,
      priority: 'MEDIUM', // Default priority awaiting triage
      status: 'SUBMITTED',
      is_demo: false, // User created real report!
      submitted_at: now,
      updated_at: now,
      media
    };

    this.complaints.unshift(newComplaint);

    // Add audit update
    const update: ComplaintUpdate = {
      id: 'upd-' + Date.now(),
      complaint_id: complaintId,
      updated_by: this.currentUser.id,
      updater_name: this.currentUser.full_name,
      updater_role: 'CITIZEN',
      previous_status: undefined,
      new_status: 'SUBMITTED',
      update_note: 'Citizen submitted report with photographic evidence and location details.',
      is_public: true,
      created_at: now
    };
    this.updates.push(update);

    // Send notifications to Admins
    const admins = this.profiles.filter((p) => p.role === 'ADMIN');
    admins.forEach((admin) => {
      this.notifications.unshift({
        id: 'notif-' + Date.now() + Math.random(),
        user_id: admin.id,
        title: 'New Civic Issue Submitted',
        message: `New report ${code} (${newComplaint.title.slice(0, 45)}...) received in ${newComplaint.locality}.`,
        related_complaint_id: complaintId,
        is_read: false,
        created_at: now
      });
    });

    // Notify submitting citizen
    this.notifications.unshift({
      id: 'notif-cit-' + Date.now(),
      user_id: this.currentUser.id,
      title: 'Report Received & Queued',
      message: `Your complaint ${code} has been registered. You can track progress in real-time.`,
      related_complaint_id: complaintId,
      is_read: false,
      created_at: now
    });

    this.persist();
    return newComplaint;
  }

  // Admin Verification
  public verifyComplaint(complaintId: string, priority: ComplaintPriority, adminNotes?: string) {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) return;
    const oldStatus = complaint.status;
    const now = new Date().toISOString();

    complaint.status = 'VERIFIED';
    complaint.priority = priority;
    complaint.internal_admin_notes = adminNotes;
    complaint.updated_at = now;

    this.updates.push({
      id: 'upd-' + Date.now(),
      complaint_id: complaintId,
      updated_by: this.currentUser.id,
      updater_name: this.currentUser.full_name,
      updater_role: 'ADMIN',
      previous_status: oldStatus,
      new_status: 'VERIFIED',
      update_note: `Complaint verified with ${priority} priority. ${adminNotes ? 'Note: ' + adminNotes : ''}`,
      is_public: true,
      created_at: now
    });

    // Notify Citizen
    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      user_id: complaint.citizen_id,
      title: 'Complaint Verified',
      message: `Your issue ${complaint.complaint_code} was verified by the operations desk with ${priority} priority.`,
      related_complaint_id: complaintId,
      is_read: false,
      created_at: now
    });

    this.persist();
  }

  // Admin Rejection (Mandatory explanation)
  public rejectComplaint(complaintId: string, rejectionReason: string) {
    if (!rejectionReason.trim()) {
      throw new Error('Rejection reason is strictly mandatory.');
    }
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) return;
    const oldStatus = complaint.status;
    const now = new Date().toISOString();

    complaint.status = 'REJECTED';
    complaint.rejection_reason = rejectionReason.trim();
    complaint.updated_at = now;

    this.updates.push({
      id: 'upd-' + Date.now(),
      complaint_id: complaintId,
      updated_by: this.currentUser.id,
      updater_name: this.currentUser.full_name,
      updater_role: 'ADMIN',
      previous_status: oldStatus,
      new_status: 'REJECTED',
      update_note: `Report rejected. Reason: ${rejectionReason.trim()}`,
      is_public: true,
      created_at: now
    });

    // Notify Citizen
    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      user_id: complaint.citizen_id,
      title: 'Report Declined',
      message: `Your report ${complaint.complaint_code} was reviewed and declined. Reason: ${rejectionReason.trim()}`,
      related_complaint_id: complaintId,
      is_read: false,
      created_at: now
    });

    this.persist();
  }

  // Admin Worker Assignment
  public assignWorker(complaintId: string, workerId: string, instructions?: string) {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    const worker = this.workers.find((w) => w.id === workerId);
    if (!complaint || !worker) return;

    const oldStatus = complaint.status;
    const now = new Date().toISOString();

    complaint.status = 'ASSIGNED';
    complaint.assigned_worker = worker;
    complaint.active_assignment = {
      id: 'asg-' + Date.now(),
      complaint_id: complaintId,
      worker_id: worker.id,
      assigned_by: this.currentUser.id,
      assigned_at: now,
      status: 'PENDING',
      instructions: instructions?.trim()
    };
    complaint.updated_at = now;

    // Increment worker assignment count
    worker.active_assignment_count += 1;

    this.updates.push({
      id: 'upd-' + Date.now(),
      complaint_id: complaintId,
      updated_by: this.currentUser.id,
      updater_name: this.currentUser.full_name,
      updater_role: 'ADMIN',
      previous_status: oldStatus,
      new_status: 'ASSIGNED',
      update_note: `Assigned to ${worker.full_name} (${worker.specialization}). ${instructions ? 'Instructions: ' + instructions : ''}`,
      is_public: true,
      created_at: now
    });

    // Notify Worker
    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      user_id: worker.profile_id,
      title: 'New Task Dispatched',
      message: `You have been assigned to ${complaint.complaint_code}: "${complaint.title.slice(0, 40)}..." in ${complaint.locality}.`,
      related_complaint_id: complaintId,
      is_read: false,
      created_at: now
    });

    // Notify Citizen
    this.notifications.unshift({
      id: 'notif-c-' + Date.now(),
      user_id: complaint.citizen_id,
      title: 'Field Worker Assigned',
      message: `A dedicated operations specialist (${worker.specialization}) has been dispatched for ${complaint.complaint_code}.`,
      related_complaint_id: complaintId,
      is_read: false,
      created_at: now
    });

    this.persist();
  }

  // Worker Accepts Task and Starts Work
  public startWork(complaintId: string, workNote?: string) {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) return;
    const oldStatus = complaint.status;
    const now = new Date().toISOString();

    complaint.status = 'IN PROGRESS';
    if (complaint.active_assignment) {
      complaint.active_assignment.accepted_at = now;
      complaint.active_assignment.status = 'IN_PROGRESS';
    }
    complaint.updated_at = now;

    const noteText = workNote?.trim() || 'Worker arrived on site and commenced repairs.';
    this.updates.push({
      id: 'upd-' + Date.now(),
      complaint_id: complaintId,
      updated_by: this.currentUser.id,
      updater_name: this.currentUser.full_name,
      updater_role: 'WORKER',
      previous_status: oldStatus,
      new_status: 'IN PROGRESS',
      update_note: noteText,
      is_public: true,
      created_at: now
    });

    // Notify Citizen
    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      user_id: complaint.citizen_id,
      title: 'Repairs In Progress',
      message: `Field technician is actively working on ${complaint.complaint_code}: ${noteText}`,
      related_complaint_id: complaintId,
      is_read: false,
      created_at: now
    });

    this.persist();
  }

  // Worker Adds Work Progress Note / In-Progress Media
  public addProgressUpdate(complaintId: string, note: string, photoUrl?: string) {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) return;
    const now = new Date().toISOString();

    if (photoUrl) {
      if (!complaint.media) complaint.media = [];
      complaint.media.push({
        id: 'med-' + Date.now(),
        complaint_id: complaintId,
        uploaded_by: this.currentUser.id,
        media_type: 'DURING_WORK',
        storage_path: `worker-evidence/${complaint.complaint_code}-progress.jpg`,
        preview_url: photoUrl,
        description: 'Mid-progress repair photograph: ' + note,
        created_at: now
      });
    }

    this.updates.push({
      id: 'upd-' + Date.now(),
      complaint_id: complaintId,
      updated_by: this.currentUser.id,
      updater_name: this.currentUser.full_name,
      updater_role: 'WORKER',
      previous_status: complaint.status,
      new_status: complaint.status,
      update_note: note.trim(),
      is_public: true,
      created_at: now
    });

    this.persist();
  }

  // Worker Submits Resolution Evidence (Cannot directly mark as RESOLVED)
  public submitResolution(complaintId: string, notes: string, photos: string[]) {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) return;
    const oldStatus = complaint.status;
    const now = new Date().toISOString();

    complaint.status = 'RESOLUTION SUBMITTED';
    complaint.updated_at = now;

    if (complaint.active_assignment) {
      complaint.active_assignment.completed_at = now;
      complaint.active_assignment.status = 'COMPLETED';
    }

    if (!complaint.media) complaint.media = [];
    photos.forEach((photoUrl, idx) => {
      complaint.media!.push({
        id: 'med-res-' + Date.now() + '-' + idx,
        complaint_id: complaintId,
        uploaded_by: this.currentUser.id,
        media_type: 'AFTER',
        storage_path: `worker-evidence/${complaint.complaint_code}-after-${idx + 1}.jpg`,
        preview_url: photoUrl,
        description: `Verified post-resolution proof: ${notes.slice(0, 60)}...`,
        created_at: now
      });
    });

    this.updates.push({
      id: 'upd-' + Date.now(),
      complaint_id: complaintId,
      updated_by: this.currentUser.id,
      updater_name: this.currentUser.full_name,
      updater_role: 'WORKER',
      previous_status: oldStatus,
      new_status: 'RESOLUTION SUBMITTED',
      update_note: `Work completed by field crew. Resolution evidence submitted for administrative verification. Notes: ${notes.trim()}`,
      is_public: true,
      created_at: now
    });

    // Notify Admins
    const admins = this.profiles.filter((p) => p.role === 'ADMIN');
    admins.forEach((admin) => {
      this.notifications.unshift({
        id: 'notif-a-' + Date.now() + Math.random(),
        user_id: admin.id,
        title: 'Resolution Evidence Awaiting Review',
        message: `Field crew submitted resolution photographs for ${complaint.complaint_code}. Verification required.`,
        related_complaint_id: complaintId,
        is_read: false,
        created_at: now
      });
    });

    this.persist();
  }

  // Admin Reviews Resolution: Approve -> RESOLVED, Reject -> Return to IN PROGRESS
  public reviewResolution(
    complaintId: string,
    decision: 'APPROVED' | 'REJECTED',
    reviewNotes: string
  ) {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) return;
    const oldStatus = complaint.status;
    const now = new Date().toISOString();

    if (decision === 'APPROVED') {
      complaint.status = 'RESOLVED';
      complaint.resolved_at = now;
      complaint.updated_at = now;

      // Decrement worker workload
      if (complaint.assigned_worker) {
        const wrk = this.workers.find((w) => w.id === complaint.assigned_worker?.id);
        if (wrk) {
          wrk.active_assignment_count = Math.max(0, wrk.active_assignment_count - 1);
        }
      }

      this.updates.push({
        id: 'upd-' + Date.now(),
        complaint_id: complaintId,
        updated_by: this.currentUser.id,
        updater_name: this.currentUser.full_name,
        updater_role: 'ADMIN',
        previous_status: oldStatus,
        new_status: 'RESOLVED',
        update_note: `Resolution inspected and verified by Admin: ${reviewNotes.trim()}`,
        is_public: true,
        created_at: now
      });

      // Notify Citizen
      this.notifications.unshift({
        id: 'notif-c-' + Date.now(),
        user_id: complaint.citizen_id,
        title: 'Issue Resolved & Verified',
        message: `Your reported problem ${complaint.complaint_code} has been completely fixed and approved! Please rate the service.`,
        related_complaint_id: complaintId,
        is_read: false,
        created_at: now
      });
    } else {
      // Returned for rework
      complaint.status = 'IN PROGRESS';
      complaint.updated_at = now;
      if (complaint.active_assignment) {
        complaint.active_assignment.status = 'IN_PROGRESS';
      }

      this.updates.push({
        id: 'upd-' + Date.now(),
        complaint_id: complaintId,
        updated_by: this.currentUser.id,
        updater_name: this.currentUser.full_name,
        updater_role: 'ADMIN',
        previous_status: oldStatus,
        new_status: 'IN PROGRESS',
        update_note: `Resolution evidence rejected. Rework requested: ${reviewNotes.trim()}`,
        is_public: true,
        created_at: now
      });

      // Notify Worker
      if (complaint.assigned_worker) {
        this.notifications.unshift({
          id: 'notif-w-' + Date.now(),
          user_id: complaint.assigned_worker.profile_id,
          title: 'Resolution Revision Required',
          message: `Supervisor rejected resolution for ${complaint.complaint_code}: ${reviewNotes.trim()}`,
          related_complaint_id: complaintId,
          is_read: false,
          created_at: now
        });
      }
    }

    this.persist();
  }

  // Citizen Feedback
  public submitFeedback(complaintId: string, rating: number, comment?: string, quality?: string) {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) return;
    const now = new Date().toISOString();

    const feedback: CitizenFeedback = {
      id: 'fb-' + Date.now(),
      complaint_id: complaintId,
      citizen_id: this.currentUser.id,
      rating: Math.max(1, Math.min(5, rating)),
      quality_assessment: quality || 'Satisfactory',
      comment: comment?.trim(),
      created_at: now
    };

    complaint.feedback = feedback;
    this.persist();
    return feedback;
  }

  // Duplicate Detection Algorithm
  public scanForDuplicates(): Array<{
    primary: Complaint;
    candidate: Complaint;
    similarityScore: number;
    matchReasons: string[];
  }> {
    const results: Array<{
      primary: Complaint;
      candidate: Complaint;
      similarityScore: number;
      matchReasons: string[];
    }> = [];

    const activeList = this.complaints.filter((c) => c.status !== 'REJECTED');

    for (let i = 0; i < activeList.length; i++) {
      for (let j = i + 1; j < activeList.length; j++) {
        const c1 = activeList[i];
        const c2 = activeList[j];

        // Skip if already linked
        const alreadyLinked = this.duplicateLinks.some(
          (l) =>
            (l.primary_complaint_id === c1.id && l.related_complaint_id === c2.id) ||
            (l.primary_complaint_id === c2.id && l.related_complaint_id === c1.id)
        );
        if (alreadyLinked) continue;

        let score = 0;
        const reasons: string[] = [];

        // 1. Same category
        if (c1.category_id === c2.category_id) {
          score += 30;
          reasons.push(`Identical Category: ${c1.category_name}`);
        }

        // 2. Same Locality
        if (c1.locality.toLowerCase().trim() === c2.locality.toLowerCase().trim()) {
          score += 25;
          reasons.push(`Same Locality: "${c1.locality}"`);
        } else if (
          c1.locality.toLowerCase().includes(c2.locality.toLowerCase()) ||
          c2.locality.toLowerCase().includes(c1.locality.toLowerCase())
        ) {
          score += 15;
          reasons.push('Overlapping Locality Name');
        }

        // 3. Title & Description Keyword Overlap
        const words1 = new Set(
          (c1.title + ' ' + c1.description)
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter((w) => w.length > 3)
        );
        const words2 = new Set(
          (c2.title + ' ' + c2.description)
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter((w) => w.length > 3)
        );

        let commonWords = 0;
        words1.forEach((w) => {
          if (words2.has(w)) commonWords++;
        });

        const jaccard = commonWords / (words1.size + words2.size - commonWords || 1);
        if (jaccard > 0.25) {
          const titleScore = Math.min(30, Math.round(jaccard * 50));
          score += titleScore;
          reasons.push(`High textual similarity (${Math.round(jaccard * 100)}% vocabulary overlap)`);
        }

        // 4. GPS Distance Proximity
        if (c1.latitude && c1.longitude && c2.latitude && c2.longitude) {
          const distMeters = this.haversineDistance(
            c1.latitude,
            c1.longitude,
            c2.latitude,
            c2.longitude
          );
          if (distMeters <= 100) {
            score += 35;
            reasons.push(`Extremely close GPS proximity: ~${Math.round(distMeters)} meters apart`);
          } else if (distMeters <= 350) {
            score += 20;
            reasons.push(`Nearby GPS proximity: ~${Math.round(distMeters)} meters apart`);
          }
        }

        // Potential duplicate threshold: score >= 55
        if (score >= 50) {
          results.push({
            primary: c1,
            candidate: c2,
            similarityScore: Math.min(99, score),
            matchReasons: reasons
          });
        }
      }
    }

    return results.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  public linkAsDuplicate(
    primaryId: string,
    relatedId: string,
    decision: 'LINKED_AS_DUPLICATE' | 'DISMISSED' | 'RELATED_SUB_ISSUE',
    similarityScore: number,
    reasons: string[]
  ) {
    this.duplicateLinks.push({
      id: 'dup-' + Date.now(),
      primary_complaint_id: primaryId,
      related_complaint_id: relatedId,
      similarity_score: similarityScore,
      similarity_reason: reasons.join('; '),
      reviewed_by: this.currentUser.id,
      decision,
      created_at: new Date().toISOString()
    });

    if (decision === 'LINKED_AS_DUPLICATE') {
      const related = this.complaints.find((c) => c.id === relatedId);
      const primary = this.complaints.find((c) => c.id === primaryId);
      if (related && primary) {
        related.linked_primary_id = primaryId;
        primary.duplicate_count = (primary.duplicate_count || 0) + 1;
        this.updates.push({
          id: 'upd-' + Date.now(),
          complaint_id: relatedId,
          updated_by: this.currentUser.id,
          updater_name: this.currentUser.full_name,
          updater_role: 'ADMIN',
          previous_status: related.status,
          new_status: related.status,
          update_note: `Linked as duplicate/related observation of primary issue ${primary.complaint_code}. Citizen report preserved.`,
          is_public: true,
          created_at: new Date().toISOString()
        });
      }
    }

    this.persist();
  }

  // Haversine Distance helper
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // SLA Calculation
  public getSLAStatus(complaint: Complaint): SLAStatus {
    const category = this.categories.find((c) => c.id === complaint.category_id);
    let targetHours = 72; // Default 3 days

    if (category) {
      switch (complaint.priority) {
        case 'CRITICAL':
          targetHours = category.sla_critical_hours;
          break;
        case 'HIGH':
          targetHours = category.sla_high_hours;
          break;
        case 'MEDIUM':
          targetHours = category.sla_medium_hours;
          break;
        case 'LOW':
          targetHours = category.sla_low_hours;
          break;
      }
    }

    const submittedTime = new Date(complaint.submitted_at).getTime();
    const endTime = complaint.resolved_at ? new Date(complaint.resolved_at).getTime() : Date.now();
    const elapsedHours = Math.max(0, (endTime - submittedTime) / (1000 * 60 * 60));

    if (complaint.status === 'RESOLVED') {
      return {
        status: 'COMPLETED',
        targetHours,
        elapsedHours: Math.round(elapsedHours * 10) / 10,
        remainingHours: 0,
        overdueHours: Math.max(0, Math.round((elapsedHours - targetHours) * 10) / 10),
        percentageUsed: Math.min(100, Math.round((elapsedHours / targetHours) * 100))
      };
    }

    if (complaint.status === 'REJECTED') {
      return {
        status: 'COMPLETED',
        targetHours,
        elapsedHours: Math.round(elapsedHours * 10) / 10,
        remainingHours: 0,
        overdueHours: 0,
        percentageUsed: 0
      };
    }

    const remainingHours = targetHours - elapsedHours;
    const percentageUsed = Math.round((elapsedHours / targetHours) * 100);

    if (elapsedHours > targetHours) {
      return {
        status: 'OVERDUE',
        targetHours,
        elapsedHours: Math.round(elapsedHours * 10) / 10,
        remainingHours: 0,
        overdueHours: Math.round((elapsedHours - targetHours) * 10) / 10,
        percentageUsed: Math.max(100, percentageUsed)
      };
    }

    if (remainingHours <= targetHours * 0.25) {
      return {
        status: 'DUE SOON',
        targetHours,
        elapsedHours: Math.round(elapsedHours * 10) / 10,
        remainingHours: Math.round(remainingHours * 10) / 10,
        overdueHours: 0,
        percentageUsed
      };
    }

    return {
      status: 'ON TRACK',
      targetHours,
      elapsedHours: Math.round(elapsedHours * 10) / 10,
      remainingHours: Math.round(remainingHours * 10) / 10,
      overdueHours: 0,
      percentageUsed
    };
  }

  // Updates & Timeline
  public getComplaintUpdates(complaintId: string): ComplaintUpdate[] {
    const list = this.updates.filter((u) => u.complaint_id === complaintId);
    // Citizens only see public updates
    if (this.currentUser.role === 'CITIZEN') {
      return list.filter((u) => u.is_public);
    }
    return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // Notifications
  public getNotifications(): NotificationItem[] {
    return this.notifications.filter((n) => n.user_id === this.currentUser.id);
  }

  public getUnreadNotificationCount(): number {
    return this.notifications.filter((n) => n.user_id === this.currentUser.id && !n.is_read).length;
  }

  public markNotificationRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    this.persist();
  }

  public markAllNotificationsRead() {
    this.notifications = this.notifications.map((n) =>
      n.user_id === this.currentUser.id ? { ...n, is_read: true } : n
    );
    this.persist();
  }

  // Analytics Aggregation
  public getAnalytics() {
    const total = this.complaints.length;
    const submitted = this.complaints.filter((c) => c.status === 'SUBMITTED').length;
    const underReview = this.complaints.filter((c) => c.status === 'UNDER REVIEW').length;
    const verified = this.complaints.filter((c) => c.status === 'VERIFIED').length;
    const assigned = this.complaints.filter((c) => c.status === 'ASSIGNED').length;
    const inProgress = this.complaints.filter((c) => c.status === 'IN PROGRESS').length;
    const resolutionSubmitted = this.complaints.filter((c) => c.status === 'RESOLUTION SUBMITTED').length;
    const resolved = this.complaints.filter((c) => c.status === 'RESOLVED').length;
    const rejected = this.complaints.filter((c) => c.status === 'REJECTED').length;
    const pending = total - resolved - rejected;

    // Overdue active complaints
    const overdue = this.complaints.filter((c) => {
      if (c.status === 'RESOLVED' || c.status === 'REJECTED') return false;
      return this.getSLAStatus(c).status === 'OVERDUE';
    }).length;

    // SLA compliance rate
    const closedComplaints = this.complaints.filter((c) => c.status === 'RESOLVED');
    let onTimeCount = 0;
    closedComplaints.forEach((c) => {
      const sla = this.getSLAStatus(c);
      if (sla.overdueHours <= 0) onTimeCount++;
    });
    const slaComplianceRate = closedComplaints.length > 0
      ? Math.round((onTimeCount / closedComplaints.length) * 100)
      : 95;

    // Average resolution duration
    let totalResolutionHours = 0;
    closedComplaints.forEach((c) => {
      const sla = this.getSLAStatus(c);
      totalResolutionHours += sla.elapsedHours;
    });
    const avgResolutionHours = closedComplaints.length > 0
      ? Math.round((totalResolutionHours / closedComplaints.length) * 10) / 10
      : 0;

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    this.complaints.forEach((c) => {
      const name = c.category_name || 'Other';
      categoryCounts[name] = (categoryCounts[name] || 0) + 1;
    });

    // Locality distribution
    const localityCounts: Record<string, number> = {};
    this.complaints.forEach((c) => {
      const loc = c.locality.split(',')[0].trim();
      localityCounts[loc] = (localityCounts[loc] || 0) + 1;
    });

    // Citizen satisfaction
    const feedbacks = this.complaints.filter((c) => c.feedback).map((c) => c.feedback!.rating);
    const avgRating = feedbacks.length > 0
      ? Math.round((feedbacks.reduce((a, b) => a + b, 0) / feedbacks.length) * 10) / 10
      : 4.8;

    return {
      total,
      submitted,
      underReview,
      verified,
      assigned,
      inProgress,
      resolutionSubmitted,
      resolved,
      rejected,
      pending,
      overdue,
      slaComplianceRate,
      avgResolutionHours,
      categoryCounts,
      localityCounts,
      avgRating,
      feedbackCount: feedbacks.length
    };
  }
}

export const db = new CivicFixDatabase();
