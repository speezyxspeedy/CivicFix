import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, Complaint } from '../../types';
import { StatusBadge, PriorityBadge, SLABadge } from '../../components/StatusBadge';
import { ComplaintTimeline } from '../../components/ComplaintTimeline';
import { BeforeAfterSlider } from '../../components/BeforeAfterSlider';
import {
  Search,
  Filter,
  Eye,
  UserCheck,
  CheckCircle2,
  XCircle,
  HardHat,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Copy
} from 'lucide-react';

interface AllComplaintsViewProps {
  currentUser: UserProfile;
  initialSelectedId?: string;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const AllComplaintsView: React.FC<AllComplaintsViewProps> = ({
  currentUser,
  initialSelectedId,
  onNavigate
}) => {
  const allComplaints = db.getComplaints(false);
  const categories = db.getCategories();
  const workers = db.getWorkers();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [localityFilter, setLocalityFilter] = useState('ALL');

  // Selected complaint modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(() => {
    if (initialSelectedId) {
      return db.getComplaintById(initialSelectedId) || null;
    }
    return null;
  });

  // Unique localities
  const localities = Array.from(
    new Set(allComplaints.map((c) => c.locality.split(',')[0].trim()))
  );

  const filtered = allComplaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaint_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.citizen_name && c.citizen_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category_id === categoryFilter;
    const matchesLocality =
      localityFilter === 'ALL' || c.locality.toLowerCase().includes(localityFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesLocality;
  });

  const beforePhotos = selectedComplaint?.media?.filter((m) => m.media_type === 'BEFORE') || [];
  const afterPhotos = selectedComplaint?.media?.filter((m) => m.media_type === 'AFTER') || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">All Complaints Repository</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository of all civic incident submissions, status changes, and resolution history.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-600 font-mono">
          Showing {filtered.length} of {allComplaints.length} records
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, keyword, citizen name, locality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 text-xs outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER REVIEW">Under Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="RESOLUTION SUBMITTED">Resolution Submitted</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Priority dropdown */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Category dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Locality dropdown */}
            <select
              value={localityFilter}
              onChange={(e) => setLocalityFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none"
            >
              <option value="ALL">All Localities</option>
              {localities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Locality</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">SLA Target</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const sla = db.getSLAStatus(item);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedComplaint(item)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {item.complaint_code}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        By {item.citizen_name || 'Citizen'} • {new Date(item.submitted_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{item.category_name}</td>
                    <td className="py-3 px-4 text-slate-600">{item.locality}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} isDemo={item.is_demo} />
                    </td>
                    <td className="py-3 px-4">
                      <SLABadge sla={sla} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComplaint(item);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1 font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Inspection Modal Drawer */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-2xl h-full bg-white shadow-2xl border-l border-slate-200 p-6 overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                  {selectedComplaint.complaint_code}
                </span>
                <StatusBadge status={selectedComplaint.status} isDemo={selectedComplaint.is_demo} />
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick action bar depending on status */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-700 mr-1">Direct Workflow Action:</span>

              {selectedComplaint.status === 'SUBMITTED' && (
                <>
                  <button
                    onClick={() => {
                      setSelectedComplaint(null);
                      onNavigate('admin-review-queue');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold inline-flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Open Triage Desk
                  </button>
                </>
              )}

              {selectedComplaint.status === 'VERIFIED' && (
                <button
                  onClick={() => {
                    setSelectedComplaint(null);
                    onNavigate('admin-assignments');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold inline-flex items-center gap-1"
                >
                  <HardHat className="w-3.5 h-3.5" />
                  Assign Field Worker
                </button>
              )}

              {selectedComplaint.status === 'RESOLUTION SUBMITTED' && (
                <button
                  onClick={() => {
                    setSelectedComplaint(null);
                    onNavigate('admin-resolutions');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold inline-flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Review Completion Evidence
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedComplaint(null);
                  onNavigate('admin-duplicates');
                }}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold inline-flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                Check Duplicates
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">{selectedComplaint.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Category
                </span>
                <span className="font-semibold text-slate-800">{selectedComplaint.category_name}</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Priority
                </span>
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Reporting Citizen
                </span>
                <span className="font-semibold text-slate-800">{selectedComplaint.citizen_name}</span>
                <div className="text-[10px] text-slate-400">{selectedComplaint.citizen_phone}</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Crew
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedComplaint.assigned_worker?.full_name || 'None Assigned'}
                </span>
                {selectedComplaint.assigned_worker && (
                  <div className="text-[10px] text-indigo-600 font-medium">
                    {selectedComplaint.assigned_worker.specialization}
                  </div>
                )}
              </div>
            </div>

            {/* Before / After Slider if both exist */}
            {beforePhotos.length > 0 && afterPhotos.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Verification Evidence Comparison
                </h3>
                <BeforeAfterSlider
                  beforeUrl={beforePhotos[0].preview_url}
                  afterUrl={afterPhotos[0].preview_url}
                  aspectRatio="aspect-16/9"
                />
              </div>
            )}

            {/* Media Gallery */}
            {selectedComplaint.media && selectedComplaint.media.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Photographic Records ({selectedComplaint.media.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedComplaint.media.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="rounded-lg overflow-hidden border border-slate-200 aspect-video relative group bg-slate-100"
                    >
                      <img
                        src={m.preview_url}
                        alt="Photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/70 text-white">
                        {m.media_type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Full Audit Trail
              </h3>
              <ComplaintTimeline
                updates={db.getComplaintUpdates(selectedComplaint.id)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
