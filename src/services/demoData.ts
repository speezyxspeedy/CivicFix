/**
 * CivicFix Demo Workspace Seed Data
 * Explicitly labeled DEMO DATA for realistic civic scenarios:
 * 1. Road Damage / Potholes
 * 2. Garbage Collection
 * 3. Streetlight Outages
 * 4. Drainage Blockages
 * 5. Water Main Leakages
 */

import { Category, Complaint, Worker, UserProfile, ComplaintUpdate, NotificationItem } from '../types';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-citizen-1',
    full_name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@community.org',
    phone: '+91 98201 44521',
    role: 'CITIZEN',
    locality: 'Greenwood Heights, Sector 4',
    created_at: '2026-10-15T08:30:00Z',
  },
  {
    id: 'user-citizen-2',
    full_name: 'Rahul Sen',
    email: 'rahul.sen@college.edu',
    phone: '+91 97112 88402',
    role: 'CITIZEN',
    locality: 'Campus North Hostel, Block B',
    created_at: '2026-10-20T10:15:00Z',
  },
  {
    id: 'user-admin-1',
    full_name: 'Dr. Suresh Varma',
    email: 'operations.desk@civicfix.org',
    phone: '+91 99880 11223',
    role: 'ADMIN',
    locality: 'Civic Administration Complex',
    created_at: '2026-09-01T09:00:00Z',
  },
  {
    id: 'user-worker-1',
    full_name: 'Devang Patel',
    email: 'd.patel.ops@civicfix.org',
    phone: '+91 94055 33219',
    role: 'WORKER',
    locality: 'West Maintenance Depot',
    created_at: '2026-09-10T08:00:00Z',
  },
  {
    id: 'user-worker-2',
    full_name: 'Meera Nambiar',
    email: 'm.nambiar.ops@civicfix.org',
    phone: '+91 95521 77412',
    role: 'WORKER',
    locality: 'Central Civic Works Station',
    created_at: '2026-09-12T08:00:00Z',
  },
  {
    id: 'user-worker-3',
    full_name: 'Karanvir Singh',
    email: 'k.singh.ops@civicfix.org',
    phone: '+91 98762 55431',
    role: 'WORKER',
    locality: 'North Water & Drainage Facility',
    created_at: '2026-09-15T08:00:00Z',
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Road Damage / Potholes',
    description: 'Potholes, surface cracks, damaged asphalt, missing speed breakers',
    icon_name: 'AlertTriangle',
    is_active: true,
    sla_critical_hours: 24,
    sla_high_hours: 72,
    sla_medium_hours: 168,
    sla_low_hours: 336
  },
  {
    id: 'cat-2',
    name: 'Garbage Collection',
    description: 'Overflowing dumpsters, illegal trash dumping, uncleaned waste collection',
    icon_name: 'Trash2',
    is_active: true,
    sla_critical_hours: 12,
    sla_high_hours: 24,
    sla_medium_hours: 48,
    sla_low_hours: 96
  },
  {
    id: 'cat-3',
    name: 'Drainage Problems',
    description: 'Blocked storm drains, sewage overflows, rainwater stagnation',
    icon_name: 'Waves',
    is_active: true,
    sla_critical_hours: 24,
    sla_high_hours: 48,
    sla_medium_hours: 96,
    sla_low_hours: 168
  },
  {
    id: 'cat-4',
    name: 'Water Leakage',
    description: 'Cracked water pipelines, broken valve chambers, street water floods',
    icon_name: 'Droplets',
    is_active: true,
    sla_critical_hours: 12,
    sla_high_hours: 24,
    sla_medium_hours: 72,
    sla_low_hours: 120
  },
  {
    id: 'cat-5',
    name: 'Broken Streetlights',
    description: 'Unlit street fixtures, flickering lamps, exposed junction cables',
    icon_name: 'LightbulbOff',
    is_active: true,
    sla_critical_hours: 24,
    sla_high_hours: 48,
    sla_medium_hours: 96,
    sla_low_hours: 168
  },
  {
    id: 'cat-6',
    name: 'Public Infrastructure',
    description: 'Damaged pedestrian walkways, broken benches, open utility vaults',
    icon_name: 'Building2',
    is_active: true,
    sla_critical_hours: 48,
    sla_high_hours: 96,
    sla_medium_hours: 168,
    sla_low_hours: 336
  },
  {
    id: 'cat-7',
    name: 'Street Cleaning',
    description: 'Fallen branches, leaf accumulation, mud heaps on curbsides',
    icon_name: 'Sparkles',
    is_active: true,
    sla_critical_hours: 24,
    sla_high_hours: 48,
    sla_medium_hours: 72,
    sla_low_hours: 120
  },
  {
    id: 'cat-8',
    name: 'Traffic Signal Problems',
    description: 'Signals stuck on amber, pedestrian crossing lights unresponsive',
    icon_name: 'Siren',
    is_active: true,
    sla_critical_hours: 6,
    sla_high_hours: 12,
    sla_medium_hours: 24,
    sla_low_hours: 48
  },
  {
    id: 'cat-9',
    name: 'Public Safety Infrastructure',
    description: 'Missing storm cover lids, broken bridge railings, sinkhole hazards',
    icon_name: 'ShieldAlert',
    is_active: true,
    sla_critical_hours: 6,
    sla_high_hours: 12,
    sla_medium_hours: 24,
    sla_low_hours: 48
  },
  {
    id: 'cat-10',
    name: 'Other',
    description: 'General neighbourhood civil issues and community upkeep',
    icon_name: 'HelpCircle',
    is_active: true,
    sla_critical_hours: 48,
    sla_high_hours: 96,
    sla_medium_hours: 168,
    sla_low_hours: 336
  }
];

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'wrk-1',
    profile_id: 'user-worker-1',
    worker_code: 'WRK-ROADS-04',
    full_name: 'Devang Patel',
    specialization: 'Road Maintenance',
    assigned_area: 'Greenwood & Sector 4',
    phone: '+91 94055 33219',
    email: 'd.patel.ops@civicfix.org',
    availability: true,
    active_assignment_count: 2
  },
  {
    id: 'wrk-2',
    profile_id: 'user-worker-2',
    worker_code: 'WRK-ELEC-09',
    full_name: 'Meera Nambiar',
    specialization: 'Electrical & Streetlights',
    assigned_area: 'Campus North & East Avenue',
    phone: '+91 95521 77412',
    email: 'm.nambiar.ops@civicfix.org',
    availability: true,
    active_assignment_count: 1
  },
  {
    id: 'wrk-3',
    profile_id: 'user-worker-3',
    worker_code: 'WRK-WATER-02',
    full_name: 'Karanvir Singh',
    specialization: 'Drainage & Water Supply',
    assigned_area: 'Industrial Belt & Lakeview',
    phone: '+91 98762 55431',
    email: 'k.singh.ops@civicfix.org',
    availability: true,
    active_assignment_count: 1
  },
  {
    id: 'wrk-4',
    profile_id: 'user-worker-4',
    worker_code: 'WRK-SANI-11',
    full_name: 'Sunita Rao',
    specialization: 'Sanitation & Solid Waste',
    assigned_area: 'Central Market & Old Town',
    phone: '+91 93211 44091',
    email: 's.rao.ops@civicfix.org',
    availability: true,
    active_assignment_count: 0
  }
];

// Realistic high quality before/after images for demo
const IMG_POTHOLE_BEFORE = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
const IMG_POTHOLE_AFTER = 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80';

const IMG_GARBAGE_BEFORE = 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80';
const IMG_GARBAGE_AFTER = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80';

const IMG_LIGHT_BEFORE = 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80';
const IMG_LIGHT_AFTER = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80';

const IMG_WATER_BEFORE = 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80';
const IMG_WATER_AFTER = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80';

const IMG_DRAIN_BEFORE = 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=800&q=80';
const IMG_DRAIN_AFTER = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

export const INITIAL_COMPLAINTS: Complaint[] = [
  // 1. RESOLVED with verified Before & After evidence and citizen feedback
  {
    id: 'cmp-001',
    complaint_code: 'CF-2026-000101',
    citizen_id: 'user-citizen-1',
    citizen_name: 'Ananya Deshmukh',
    citizen_phone: '+91 98201 44521',
    category_id: 'cat-1',
    category_name: 'Road Damage / Potholes',
    title: 'Severe crater pothole causing motorcycle skidding near Gate 3',
    description: 'Deep 15cm pothole on the main westbound carriageway right at the entrance of Gate 3. Water accumulates and makes it invisible after dusk, already causing two falls.',
    locality: 'Greenwood Heights, Sector 4',
    street: 'Oak Ridge Boulevard',
    landmark: 'Opposite Lotus Medical Stores, 20m from Gate 3',
    city: 'Metro City',
    postal_code: '400076',
    latitude: 19.1172,
    longitude: 72.9054,
    priority: 'HIGH',
    status: 'RESOLVED',
    is_demo: true,
    submitted_at: '2026-11-04T09:15:00Z',
    updated_at: '2026-11-06T15:30:00Z',
    resolved_at: '2026-11-06T15:30:00Z',
    media: [
      {
        id: 'med-001-1',
        complaint_id: 'cmp-001',
        uploaded_by: 'user-citizen-1',
        media_type: 'BEFORE',
        storage_path: 'complaint-reports/cmp-001-before.jpg',
        preview_url: IMG_POTHOLE_BEFORE,
        description: 'Original citizen photograph showing deep pothole and fractured asphalt',
        created_at: '2026-11-04T09:15:00Z'
      },
      {
        id: 'med-001-2',
        complaint_id: 'cmp-001',
        uploaded_by: 'user-worker-1',
        media_type: 'AFTER',
        storage_path: 'worker-evidence/cmp-001-after.jpg',
        preview_url: IMG_POTHOLE_AFTER,
        description: 'Compacted hot-mix asphalt filling and perimeter bitumen sealing completed by Devang Patel',
        created_at: '2026-11-06T14:10:00Z'
      }
    ],
    assigned_worker: INITIAL_WORKERS[0],
    feedback: {
      id: 'fb-001',
      complaint_id: 'cmp-001',
      citizen_id: 'user-citizen-1',
      rating: 5,
      quality_assessment: 'Exceptional swift repair and clean road leveling',
      comment: 'Repaired within 48 hours! The road is now completely smooth and safe for two-wheelers. Thank you CivicFix team!',
      created_at: '2026-11-06T17:00:00Z'
    }
  },

  // 2. RESOLUTION SUBMITTED - Awaiting Administrator Verification
  {
    id: 'cmp-002',
    complaint_code: 'CF-2026-000102',
    citizen_id: 'user-citizen-2',
    citizen_name: 'Rahul Sen',
    citizen_phone: '+91 97112 88402',
    category_id: 'cat-2',
    category_name: 'Garbage Collection',
    title: 'Severe garbage accumulation and overflow spilling onto student pedestrian pathway',
    description: 'Community bins have not been emptied for 4 days. Waste has spilled over 15 meters along the footpath, blocking foot traffic and causing foul odour.',
    locality: 'Campus North Hostel, Block B',
    street: 'University Avenue West',
    landmark: 'Behind Dining Hall 2',
    city: 'Metro City',
    postal_code: '400076',
    latitude: 19.1235,
    longitude: 72.9120,
    priority: 'HIGH',
    status: 'RESOLUTION SUBMITTED',
    is_demo: true,
    submitted_at: '2026-11-07T11:20:00Z',
    updated_at: '2026-11-09T16:45:00Z',
    media: [
      {
        id: 'med-002-1',
        complaint_id: 'cmp-002',
        uploaded_by: 'user-citizen-2',
        media_type: 'BEFORE',
        storage_path: 'complaint-reports/cmp-002-before.jpg',
        preview_url: IMG_GARBAGE_BEFORE,
        description: 'Overflowing dumpster and trash heaps across the walkway',
        created_at: '2026-11-07T11:20:00Z'
      },
      {
        id: 'med-002-2',
        complaint_id: 'cmp-002',
        uploaded_by: 'user-worker-1',
        media_type: 'AFTER',
        storage_path: 'worker-evidence/cmp-002-after.jpg',
        preview_url: IMG_GARBAGE_AFTER,
        description: 'Complete waste removal, mechanized sweeping, and disinfectant bleaching sprayed',
        created_at: '2026-11-09T16:40:00Z'
      }
    ],
    assigned_worker: INITIAL_WORKERS[0],
    internal_admin_notes: 'Priority collection dispatched. Awaiting supervisor photo review.'
  },

  // 3. IN PROGRESS - Field worker on site
  {
    id: 'cmp-003',
    complaint_code: 'CF-2026-000103',
    citizen_id: 'user-citizen-1',
    citizen_name: 'Ananya Deshmukh',
    citizen_phone: '+91 98201 44521',
    category_id: 'cat-4',
    category_name: 'Water Leakage',
    title: 'High-pressure potable water main cracked; drinking water flooding street',
    description: 'Underground supply conduit ruptured near the transformer base. Potable water is shooting 2 feet in the air and flowing down the street.',
    locality: 'Greenwood Heights, Sector 4',
    street: 'Maple Crescent Road',
    landmark: 'Adjacent to Community Park Pavilion',
    city: 'Metro City',
    postal_code: '400076',
    latitude: 19.1158,
    longitude: 72.9082,
    priority: 'CRITICAL',
    status: 'IN PROGRESS',
    is_demo: true,
    submitted_at: '2026-11-09T08:00:00Z',
    updated_at: '2026-11-09T10:15:00Z',
    media: [
      {
        id: 'med-003-1',
        complaint_id: 'cmp-003',
        uploaded_by: 'user-citizen-1',
        media_type: 'BEFORE',
        storage_path: 'complaint-reports/cmp-003-before.jpg',
        preview_url: IMG_WATER_BEFORE,
        description: 'Gushing water flooding road gutter and sidewalk',
        created_at: '2026-11-09T08:00:00Z'
      }
    ],
    assigned_worker: INITIAL_WORKERS[2],
    internal_admin_notes: 'Main line isolation valve closed. Excavation and pipe sleeve clamp replacement underway.'
  },

  // 4. ASSIGNED - Field worker dispatched
  {
    id: 'cmp-004',
    complaint_code: 'CF-2026-000104',
    citizen_id: 'user-citizen-2',
    citizen_name: 'Rahul Sen',
    citizen_phone: '+91 97112 88402',
    category_id: 'cat-5',
    category_name: 'Broken Streetlights',
    title: 'Series of 4 unlit street lamps on library pathway creating total darkness',
    description: 'Poles #SL-104 through #SL-107 are completely dead for 3 nights. Night school students feel unsafe walking back after 8 PM.',
    locality: 'Campus North Hostel, Block B',
    street: 'Scholars Walk',
    landmark: 'Between Central Library and Science Block',
    city: 'Metro City',
    postal_code: '400076',
    latitude: 19.1248,
    longitude: 72.9145,
    priority: 'HIGH',
    status: 'ASSIGNED',
    is_demo: true,
    submitted_at: '2026-11-08T18:40:00Z',
    updated_at: '2026-11-09T09:00:00Z',
    media: [
      {
        id: 'med-004-1',
        complaint_id: 'cmp-004',
        uploaded_by: 'user-citizen-2',
        media_type: 'BEFORE',
        storage_path: 'complaint-reports/cmp-004-before.jpg',
        preview_url: IMG_LIGHT_BEFORE,
        description: 'Completely unlit road walkway in pitch black',
        created_at: '2026-11-08T18:40:00Z'
      }
    ],
    assigned_worker: INITIAL_WORKERS[1],
    internal_admin_notes: 'Dispatched to Meera Nambiar. Check circuit breaker cabinet CB-4.'
  },

  // 5. VERIFIED - Approved by administrator, awaiting worker assignment
  {
    id: 'cmp-005',
    complaint_code: 'CF-2026-000105',
    citizen_id: 'user-citizen-1',
    citizen_name: 'Ananya Deshmukh',
    citizen_phone: '+91 98201 44521',
    category_id: 'cat-3',
    category_name: 'Drainage Problems',
    title: 'Heavy silt accumulation choking stormwater drain before monsoon',
    description: 'Storm culvert under the cul-de-sac is choked with plastic bottles, construction gravel and mud. Water backing up during brief showers.',
    locality: 'Greenwood Heights, Sector 4',
    street: 'Pine Grove Lane',
    landmark: 'Corner of Plot 42',
    city: 'Metro City',
    postal_code: '400076',
    latitude: 19.1165,
    longitude: 72.9041,
    priority: 'MEDIUM',
    status: 'VERIFIED',
    is_demo: true,
    submitted_at: '2026-11-09T07:30:00Z',
    updated_at: '2026-11-09T11:00:00Z',
    media: [
      {
        id: 'med-005-1',
        complaint_id: 'cmp-005',
        uploaded_by: 'user-citizen-1',
        media_type: 'BEFORE',
        storage_path: 'complaint-reports/cmp-005-before.jpg',
        preview_url: IMG_DRAIN_BEFORE,
        description: 'Choked storm drain grating with backed-up debris',
        created_at: '2026-11-09T07:30:00Z'
      }
    ],
    internal_admin_notes: 'Verified on satellite survey. Requires de-silting suction truck.'
  },

  // 6. SUBMITTED - Newly submitted, in Administrator Review Queue
  {
    id: 'cmp-006',
    complaint_code: 'CF-2026-000106',
    citizen_id: 'user-citizen-2',
    citizen_name: 'Rahul Sen',
    citizen_phone: '+91 97112 88402',
    category_id: 'cat-1',
    category_name: 'Road Damage / Potholes',
    title: 'Speed breaker eroded with exposed rebar nails near campus primary school',
    description: 'Rubberized speed breaker was torn away by heavy trucks, leaving four 3-inch sharp steel bolts protruding from the concrete. Dangerous puncture hazard.',
    locality: 'Campus North Hostel, Block B',
    street: 'Ring Road East',
    landmark: 'In front of Early Learners School Gate',
    city: 'Metro City',
    postal_code: '400076',
    latitude: 19.1221,
    longitude: 72.9158,
    priority: 'MEDIUM',
    status: 'SUBMITTED',
    is_demo: true,
    submitted_at: '2026-11-10T06:10:00Z',
    updated_at: '2026-11-10T06:10:00Z',
    media: [
      {
        id: 'med-006-1',
        complaint_id: 'cmp-006',
        uploaded_by: 'user-citizen-2',
        media_type: 'BEFORE',
        storage_path: 'complaint-reports/cmp-006-before.jpg',
        preview_url: IMG_POTHOLE_BEFORE,
        description: 'Exposed metal bolts on broken speed cushion',
        created_at: '2026-11-10T06:10:00Z'
      }
    ]
  },

  // 7. REJECTED - Invalid or private property with clear explanation
  {
    id: 'cmp-007',
    complaint_code: 'CF-2026-000107',
    citizen_id: 'user-citizen-1',
    citizen_name: 'Ananya Deshmukh',
    citizen_phone: '+91 98201 44521',
    category_id: 'cat-6',
    category_name: 'Public Infrastructure',
    title: 'Crack on private boundary wall inside gated residential bungalow compound',
    description: 'Internal compound wall has plaster peeling off after rainy week.',
    locality: 'Greenwood Heights, Sector 4',
    street: 'Bungalow Row #12',
    landmark: 'Private driveway',
    city: 'Metro City',
    postal_code: '400076',
    latitude: 19.1189,
    longitude: 72.9077,
    priority: 'LOW',
    status: 'REJECTED',
    rejection_reason: 'Issue falls within private residential property boundary. Municipal and civic works teams only service public roads, right-of-ways, and common infrastructure.',
    is_demo: true,
    submitted_at: '2026-11-03T14:20:00Z',
    updated_at: '2026-11-04T10:00:00Z',
    media: []
  }
];

export const INITIAL_UPDATES: ComplaintUpdate[] = [
  {
    id: 'upd-001-1',
    complaint_id: 'cmp-001',
    updated_by: 'user-citizen-1',
    updater_name: 'Ananya Deshmukh',
    updater_role: 'CITIZEN',
    previous_status: undefined,
    new_status: 'SUBMITTED',
    update_note: 'Citizen submitted initial complaint with geo-tagged photograph.',
    is_public: true,
    created_at: '2026-11-04T09:15:00Z'
  },
  {
    id: 'upd-001-2',
    complaint_id: 'cmp-001',
    updated_by: 'user-admin-1',
    updater_name: 'Dr. Suresh Varma (Desk Admin)',
    updater_role: 'ADMIN',
    previous_status: 'SUBMITTED',
    new_status: 'VERIFIED',
    update_note: 'Verified by municipal desk. High priority assigned due to motorcycle traffic.',
    is_public: true,
    created_at: '2026-11-04T11:30:00Z'
  },
  {
    id: 'upd-001-3',
    complaint_id: 'cmp-001',
    updated_by: 'user-admin-1',
    updater_name: 'Dr. Suresh Varma (Desk Admin)',
    updater_role: 'ADMIN',
    previous_status: 'VERIFIED',
    new_status: 'ASSIGNED',
    update_note: 'Assigned to Devang Patel (Road Maintenance Specialist).',
    is_public: true,
    created_at: '2026-11-04T14:00:00Z'
  },
  {
    id: 'upd-001-4',
    complaint_id: 'cmp-001',
    updated_by: 'user-worker-1',
    updater_name: 'Devang Patel (Field Worker)',
    updater_role: 'WORKER',
    previous_status: 'ASSIGNED',
    new_status: 'IN PROGRESS',
    update_note: 'Worker arrived at site with cold-lay asphalt patching materials.',
    is_public: true,
    created_at: '2026-11-05T08:30:00Z'
  },
  {
    id: 'upd-001-5',
    complaint_id: 'cmp-001',
    updated_by: 'user-worker-1',
    updater_name: 'Devang Patel (Field Worker)',
    updater_role: 'WORKER',
    previous_status: 'IN PROGRESS',
    new_status: 'RESOLUTION SUBMITTED',
    update_note: 'Bitumen compacted, edges leveled and sealed. Photo proof uploaded.',
    is_public: true,
    created_at: '2026-11-06T14:15:00Z'
  },
  {
    id: 'upd-001-6',
    complaint_id: 'cmp-001',
    updated_by: 'user-admin-1',
    updater_name: 'Dr. Suresh Varma (Desk Admin)',
    updater_role: 'ADMIN',
    previous_status: 'RESOLUTION SUBMITTED',
    new_status: 'RESOLVED',
    update_note: 'Work verified and approved by Administrator. Issue marked as RESOLVED.',
    is_public: true,
    created_at: '2026-11-06T15:30:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    user_id: 'user-citizen-1',
    title: 'Complaint Resolved',
    message: 'Your report CF-2026-000101 (Pothole at Gate 3) has been resolved! Please share your feedback.',
    related_complaint_id: 'cmp-001',
    is_read: false,
    created_at: '2026-11-06T15:30:00Z'
  },
  {
    id: 'notif-2',
    user_id: 'user-admin-1',
    title: 'Resolution Evidence Submitted',
    message: 'Worker Devang Patel has submitted resolution evidence for CF-2026-000102 (Garbage Overflow).',
    related_complaint_id: 'cmp-002',
    is_read: false,
    created_at: '2026-11-09T16:45:00Z'
  },
  {
    id: 'notif-3',
    user_id: 'user-admin-1',
    title: 'Critical Report Logged',
    message: 'Potable water main ruptured at Greenwood Heights (CF-2026-000103).',
    related_complaint_id: 'cmp-003',
    is_read: true,
    created_at: '2026-11-09T08:00:00Z'
  },
  {
    id: 'notif-4',
    user_id: 'user-worker-1',
    title: 'New Assignment Dispatched',
    message: 'You have been assigned to complaint CF-2026-000102 in Campus North.',
    related_complaint_id: 'cmp-002',
    is_read: true,
    created_at: '2026-11-08T09:00:00Z'
  }
];
