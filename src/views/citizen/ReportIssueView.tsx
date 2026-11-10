import React, { useState } from 'react';
import { db } from '../../services/db';
import { UserProfile, Category } from '../../types';
import confetti from 'canvas-confetti';
import {
  Camera,
  MapPin,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  Navigation,
  ArrowRight,
  ShieldAlert,
  Loader2,
  HelpCircle,
  FileText
} from 'lucide-react';

interface ReportIssueViewProps {
  currentUser: UserProfile;
  initialCategoryId?: string;
  onNavigate: (view: string, complaintId?: string) => void;
}

interface UploadedPhoto {
  file?: File;
  previewUrl: string;
  name: string;
  size: number;
}

export const ReportIssueView: React.FC<ReportIssueViewProps> = ({
  currentUser,
  initialCategoryId,
  onNavigate
}) => {
  const categories = db.getCategories();

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(initialCategoryId || categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState(currentUser.locality?.split(',')[0] || '');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Metro City');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Photo Selection via File Input
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      // Validate file size: 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg(`File ${file.name} exceeds the 10MB limit.`);
        return;
      }
      // Validate mime type
      if (!file.type.startsWith('image/')) {
        setErrorMsg(`File ${file.name} is not an image.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [
            ...prev,
            {
              file,
              previewUrl: event.target!.result as string,
              name: file.name,
              size: file.size
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset file input
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Browser Geolocation API (Explicit user triggered action only)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setIsLocating(false);
        setLocationStatus(`GPS Locked: ${lat}, ${lng} (Accuracy: ~${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => {
        setIsLocating(false);
        let message = 'Location access was denied. You can still type the address manually.';
        if (err.code === err.POSITION_UNAVAILABLE) message = 'GPS location unavailable.';
        if (err.code === err.TIMEOUT) message = 'GPS location timed out.';
        setLocationStatus(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!title.trim() || title.length < 5) {
      setErrorMsg('Please enter a descriptive issue title (at least 5 characters).');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Please select an issue category.');
      return;
    }
    if (!description.trim() || description.length < 15) {
      setErrorMsg('Please provide a detailed description (at least 15 characters).');
      return;
    }
    if (!locality.trim()) {
      setErrorMsg('Please provide the area or locality name.');
      return;
    }

    setSubmitting(true);

    try {
      // Prepare media list
      const mediaList = photos.map((p) => ({
        preview_url: p.previewUrl,
        file_name: p.name,
        file_size_bytes: p.size,
        mime_type: p.file?.type || 'image/jpeg',
        description: 'Citizen report photo'
      }));

      // If no photos uploaded in demo, add a category sample placeholder
      if (mediaList.length === 0) {
        mediaList.push({
          preview_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
          file_name: 'citizen-report-photo.jpg',
          file_size_bytes: 450000,
          mime_type: 'image/jpeg',
          description: 'Citizen incident observation'
        });
      }

      const created = db.submitComplaint({
        title,
        description,
        category_id: categoryId,
        locality,
        street,
        landmark,
        city,
        postal_code: postalCode,
        latitude,
        longitude,
        mediaList
      });

      setSubmittedCode(created.complaint_code);
      setSubmittedId(created.id);
      setSubmitting(false);

      // Celebrate successful citizen report
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err?.message || 'Failed to submit report. Please check inputs.');
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedCode && submittedId) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Complaint Submitted Successfully!
          </h2>

          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Your civic report has been securely registered in the municipal database and routed to the administrator triage queue.
          </p>

          {/* Unique Complaint Code Box */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-sm mx-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Unique Complaint Reference ID
            </span>
            <div className="mt-1 font-mono text-2xl font-black text-emerald-700 tracking-wider">
              {submittedCode}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Initial Status: <span className="font-semibold text-amber-700">SUBMITTED</span>
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('citizen-track', submittedId)}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm inline-flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Track Progress & Timeline
            </button>

            <button
              onClick={() => {
                setSubmittedCode(null);
                setSubmittedId(null);
                setTitle('');
                setDescription('');
                setPhotos([]);
                setStreet('');
                setLandmark('');
                setLatitude(undefined);
                setLongitude(undefined);
                setLocationStatus(null);
              }}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Report a Civic Problem</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit genuine neighborhood infrastructure or sanitation defects for immediate field resolution.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
        {/* Category & Title */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Issue Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm font-medium text-slate-800 bg-white outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} (SLA: {cat.sla_critical_hours}h critical / {cat.sla_medium_hours / 24}d med)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Deep pothole right before gate 2 causing motorcycle skidding"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm text-slate-900 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide specific details: depth, size, hazard level, time it was noticed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm text-slate-900 outline-none resize-none"
              required
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Location & Geotag Details
            </h2>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              )}
              {isLocating ? 'Locating...' : 'Use My Current Location'}
            </button>
          </div>

          {locationStatus && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{locationStatus}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Area / Locality <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Greenwood Heights, Sector 4"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 text-sm text-slate-800 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Street / Road
              </label>
              <input
                type="text"
                placeholder="e.g. Oak Ridge Boulevard"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 text-sm text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Landmark / Nearby Feature
              </label>
              <input
                type="text"
                placeholder="e.g. Opposite Lotus Medical, Gate 3"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 text-sm text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 text-sm text-slate-800 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Photo Evidence Upload Section */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Photographic Evidence
              </h2>
              <p className="text-[11px] text-slate-500">
                Upload clear photographs of the defect to speed up verification
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} added
            </span>
          </div>

          {/* Upload Dropzone */}
          <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                <Camera className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Click or drag photographs to upload
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports JPG, PNG, WebP up to 10MB per file
              </p>
            </div>
          </div>

          {/* Uploaded Photos Preview Thumbnails */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {photos.map((p, idx) => (
                <div
                  key={idx}
                  className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video group bg-slate-100"
                >
                  <img
                    src={p.previewUrl}
                    alt={`Evidence ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-900/60 text-white font-medium truncate max-w-[85%]">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Citizen Declaration */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            By submitting, you confirm this is a genuine observation of public infrastructure or environmental concern. False reports slow down emergency municipal services.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('citizen-home')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm inline-flex items-center gap-2 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering Complaint...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Submit Complaint
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
