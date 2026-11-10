import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, Category } from '../../types';
import {
  Tags,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Save,
  HelpCircle
} from 'lucide-react';

interface CategoriesViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, complaintId?: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const categories = db.getCategories();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [criticalH, setCriticalH] = useState<number>(24);
  const [highH, setHighH] = useState<number>(72);
  const [mediumH, setMediumH] = useState<number>(168);
  const [lowH, setLowH] = useState<number>(336);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const startEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCriticalH(cat.sla_critical_hours);
    setHighH(cat.sla_high_hours);
    setMediumH(cat.sla_medium_hours);
    setLowH(cat.sla_low_hours);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    db.updateCategorySLA(editingCategory.id, {
      critical: criticalH,
      high: highH,
      medium: mediumH,
      low: lowH
    });

    setSavedSuccess(`Updated SLA targets for ${editingCategory.name}.`);
    setEditingCategory(null);
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
            <Tags className="w-3.5 h-3.5 text-emerald-600" />
            Service Level Agreements
          </div>
          <h1 className="text-xl font-bold text-slate-900">Incident Categories & SLA Targets</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure default resolution turnaround hours across Critical, High, Medium, and Low priorities.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Operational Target Notice:</strong> Configured SLA values represent internal turnaround goals for field teams, not official government statutory guarantees.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500">{cat.description}</p>

              {/* SLA Pills */}
              <div className="grid grid-cols-4 gap-2 pt-3">
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-center">
                  <span className="text-[10px] font-bold text-rose-700 block">Critical</span>
                  <span className="text-xs font-mono font-bold text-rose-900">{cat.sla_critical_hours}h</span>
                </div>
                <div className="p-2 rounded-lg bg-orange-50 border border-orange-100 text-center">
                  <span className="text-[10px] font-bold text-orange-700 block">High</span>
                  <span className="text-xs font-mono font-bold text-orange-900">{cat.sla_high_hours}h</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-center">
                  <span className="text-[10px] font-bold text-amber-700 block">Medium</span>
                  <span className="text-xs font-mono font-bold text-amber-900">{cat.sla_medium_hours}h</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-600 block">Low</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{cat.sla_low_hours}h</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => startEdit(cat)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Edit SLA Targets
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Customize SLA for {editingCategory.name}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Critical SLA Target (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={criticalH}
                  onChange={(e) => setCriticalH(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  High SLA Target (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={highH}
                  onChange={(e) => setHighH(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Medium SLA Target (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={mediumH}
                  onChange={(e) => setMediumH(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Low SLA Target (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={lowH}
                  onChange={(e) => setLowH(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
