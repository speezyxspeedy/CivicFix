import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, Complaint } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileCode,
  CheckCircle2,
  Calendar,
  Filter
} from 'lucide-react';

interface ReportsExportViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const ReportsExportView: React.FC<ReportsExportViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const allComplaints = db.getComplaints(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Generate and Download CSV
  const handleExportCSV = () => {
    const headers = [
      'Complaint Code',
      'Title',
      'Category',
      'Locality',
      'Street',
      'Priority',
      'Status',
      'Submitted At',
      'Resolved At',
      'Citizen Name',
      'Assigned Worker'
    ];

    const rows = allComplaints.map((c) => [
      `"${c.complaint_code}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.category_name || ''}"`,
      `"${c.locality.replace(/"/g, '""')}"`,
      `"${c.street || ''}"`,
      `"${c.priority}"`,
      `"${c.status}"`,
      `"${c.submitted_at}"`,
      `"${c.resolved_at || ''}"`,
      `"${c.citizen_name || ''}"`,
      `"${c.assigned_worker?.full_name || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CivicFix_Complaints_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('CSV Complaint Report exported successfully.');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Generate and Download JSON
  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(allComplaints, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CivicFix_Full_Database_Dump_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('JSON Data Dump exported successfully.');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Browser Print-to-PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs no-print">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Audit & Compliance Reports
          </div>
          <h1 className="text-xl font-bold text-slate-900">Export & Printable Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Download raw CSV records, database JSON dumps, or print executive summaries to PDF.
          </p>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Export Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        {/* CSV Export */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Spreadsheet CSV Report</h2>
            <p className="text-xs text-slate-500 mt-1">
              Export all complaint codes, categories, coordinates, and turnaround metrics into Microsoft Excel or Google Sheets.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>

        {/* JSON Dump */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Structured JSON Dump</h2>
            <p className="text-xs text-slate-500 mt-1">
              Full nested JSON with media storage paths, update audit timelines, and worker metadata for external systems.
            </p>
          </div>
          <button
            onClick={handleExportJSON}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </button>
        </div>

        {/* Printable PDF */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Printer className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Print / Save as PDF</h2>
            <p className="text-xs text-slate-500 mt-1">
              Generate a formatted executive summary and trigger browser Print-to-PDF with clean printable styling.
            </p>
          </div>
          <button
            onClick={handlePrintPDF}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print to PDF
          </button>
        </div>
      </div>

      {/* Printable Report Preview Table (Always rendered, optimized for print) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="text-lg font-black text-slate-900">CivicFix Operational Audit Summary</div>
            <div className="text-xs text-slate-500">
              Report Generated: {new Date().toLocaleDateString()} • System Status: Active
            </div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <strong>Total Logged Complaints:</strong> {allComplaints.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-2 border-r border-slate-200">Code</th>
                <th className="p-2 border-r border-slate-200">Issue Title</th>
                <th className="p-2 border-r border-slate-200">Category</th>
                <th className="p-2 border-r border-slate-200">Locality</th>
                <th className="p-2 border-r border-slate-200">Priority</th>
                <th className="p-2 border-r border-slate-200">Status</th>
                <th className="p-2">Assigned Worker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {allComplaints.map((c) => (
                <tr key={c.id}>
                  <td className="p-2 font-mono font-bold border-r border-slate-200">{c.complaint_code}</td>
                  <td className="p-2 font-semibold text-slate-800 border-r border-slate-200">{c.title}</td>
                  <td className="p-2 border-r border-slate-200">{c.category_name}</td>
                  <td className="p-2 border-r border-slate-200">{c.locality}</td>
                  <td className="p-2 border-r border-slate-200">{c.priority}</td>
                  <td className="p-2 border-r border-slate-200 font-bold">{c.status}</td>
                  <td className="p-2">{c.assigned_worker?.full_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
          CivicFix Platform Report • Designed for campus and municipal public operations.
        </div>
      </div>
    </div>
  );
};
