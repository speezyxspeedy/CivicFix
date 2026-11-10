import React, { useState, useRef } from 'react';
import { Sparkles, AlertCircle, Maximize2, ShieldCheck } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: string;
  title?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Original Citizen Report',
  afterLabel = 'Verified Field Resolution',
  aspectRatio = 'aspect-video',
  title
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {title && (
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-800 tracking-wide uppercase">
              {title}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Drag slider left or right to compare
          </span>
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative select-none overflow-hidden ${aspectRatio} bg-slate-100 cursor-ew-resize`}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* AFTER IMAGE (Bottom Layer) */}
        <img
          src={afterUrl}
          alt="After resolution"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* AFTER BADGE */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            {afterLabel}
          </span>
        </div>

        {/* BEFORE IMAGE (Clipped Top Layer) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeUrl}
            alt="Before repair"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              maxWidth: 'none'
            }}
          />

          {/* BEFORE BADGE */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md">
              <AlertCircle className="w-3.5 h-3.5" />
              {beforeLabel}
            </span>
          </div>
        </div>

        {/* DIVIDER HANDLE */}
        <div
          className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-lg flex items-center justify-center pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-600 shadow-xl flex items-center justify-center text-emerald-700">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M8 9l-3 3m0 0l3 3m-3-3h14m-3-3l3 3m0 0l-3 3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-rose-700">● Before Report</span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-emerald-700">● Verified After</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Split: {Math.round(sliderPosition)}%</span>
        </div>
      </div>
    </div>
  );
};
