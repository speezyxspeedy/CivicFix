/**
 * CivicFix — Supabase Configuration Template
 * Rename this file to `config.js` or configure environment variables in Vite/Netlify/Vercel.
 *
 * IMPORTANT SECURITY NOTE:
 * NEVER place your Supabase `service_role` key here or in any frontend code!
 * Only provide your public Project URL and anonymous (anon) / publishable key.
 */

window.CIVICFIX_CONFIG = {
  // Your Supabase Project URL (e.g. https://xyzcompany.supabase.co)
  SUPABASE_URL: "https://your-project.supabase.co",

  // Your Supabase Anon / Publishable Key
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

  // Default Operational SLAs (in hours)
  DEFAULT_SLA_HOURS: {
    CRITICAL: 24,
    HIGH: 72,
    MEDIUM: 168, // 7 days
    LOW: 336     // 14 days
  },

  // Storage Buckets
  STORAGE_BUCKETS: {
    REPORTS: "complaint-reports",
    EVIDENCE: "worker-evidence"
  }
};
