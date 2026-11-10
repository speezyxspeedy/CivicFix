/**
 * CivicFix TypeScript Definitions
 * Reflects supabase-schema.sql
 */

export type UserRole = 'CITIZEN' | 'ADMIN' | 'WORKER';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER REVIEW'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN PROGRESS'
  | 'RESOLUTION SUBMITTED'
  | 'RESOLVED'
  | 'REOPENED'
  | 'REJECTED';

export type AssignmentStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REASSIGNED';

export type ResolutionDecision = 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUESTED';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  locality?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  is_active: boolean;
  sla_critical_hours: number;
  sla_high_hours: number;
  sla_medium_hours: number;
  sla_low_hours: number;
}

export interface ComplaintMedia {
  id: string;
  complaint_id: string;
  uploaded_by: string;
  media_type: 'BEFORE' | 'DURING_WORK' | 'AFTER' | 'FEEDBACK';
  storage_path: string;
  preview_url: string;
  file_name?: string;
  file_size_bytes?: number;
  mime_type?: string;
  description?: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  complaint_code: string; // e.g. CF-2026-000124
  citizen_id: string;
  citizen_name?: string;
  citizen_phone?: string;
  category_id: string;
  category_name?: string;
  title: string;
  description: string;
  locality: string;
  street?: string;
  landmark?: string;
  city: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  rejection_reason?: string;
  internal_admin_notes?: string;
  is_demo: boolean;
  submitted_at: string;
  updated_at: string;
  resolved_at?: string;
  media?: ComplaintMedia[];
  assigned_worker?: Worker;
  active_assignment?: Assignment;
  feedback?: CitizenFeedback;
  linked_primary_id?: string;
  duplicate_count?: number;
}

export interface Worker {
  id: string;
  profile_id: string;
  worker_code: string;
  full_name: string;
  specialization: string;
  assigned_area: string;
  phone: string;
  email: string;
  availability: boolean;
  active_assignment_count: number;
}

export interface Assignment {
  id: string;
  complaint_id: string;
  worker_id: string;
  assigned_by: string;
  assigned_at: string;
  accepted_at?: string;
  completed_at?: string;
  status: AssignmentStatus;
  instructions?: string;
}

export interface ComplaintUpdate {
  id: string;
  complaint_id: string;
  updated_by: string;
  updater_name: string;
  updater_role: UserRole;
  previous_status?: ComplaintStatus;
  new_status: ComplaintStatus;
  update_note: string;
  is_public: boolean;
  created_at: string;
}

export interface DuplicateLink {
  id: string;
  primary_complaint_id: string;
  related_complaint_id: string;
  similarity_score: number;
  similarity_reason: string;
  reviewed_by: string;
  decision: 'LINKED_AS_DUPLICATE' | 'DISMISSED' | 'RELATED_SUB_ISSUE';
  created_at: string;
}

export interface ResolutionReview {
  id: string;
  complaint_id: string;
  worker_id: string;
  reviewed_by: string;
  decision: ResolutionDecision;
  review_notes: string;
  reviewed_at: string;
}

export interface CitizenFeedback {
  id: string;
  complaint_id: string;
  citizen_id: string;
  rating: number; // 1-5
  quality_assessment?: string;
  comment?: string;
  photo_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  related_complaint_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface SLAStatus {
  status: 'ON TRACK' | 'DUE SOON' | 'OVERDUE' | 'COMPLETED';
  targetHours: number;
  elapsedHours: number;
  remainingHours: number;
  overdueHours: number;
  percentageUsed: number;
}
