import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface CalendarSlotProps {
  topPx: number;
  heightPx: number;
  isConflict?: boolean;
  type?: 'manual' | 'selected';
  // Buffers
  bufferTopPx?: number;
  bufferTopHeight?: number;
  bufferTopConflict?: boolean;
  bufferBottomPx?: number;
  bufferBottomHeight?: number;
  bufferBottomConflict?: boolean;
}

export function CalendarSlot({
  topPx,
  heightPx,
  isConflict = false,
  type = 'selected',
  bufferTopPx,
  bufferTopHeight,
  bufferTopConflict = false,
  bufferBottomPx,
  bufferBottomHeight,
  bufferBottomConflict = false
}: CalendarSlotProps) {
  const isManual = type === 'manual';

  const borderColor = isConflict ? 'border-red-500' : (isManual ? 'border-success' : 'border-primary');
  const ringColor = isConflict ? 'ring-red-500/20' : (isManual ? 'ring-success/20' : 'ring-primary/20');
  const bgColor = isConflict ? 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30' : (isManual ? 'bg-success/10 hover:bg-success/20' : 'bg-primary/10 hover:bg-primary/20');
  const textColor = isConflict ? 'text-red-600 dark:text-red-400' : (isManual ? 'text-success' : 'text-primary');
  const shadowClass = isConflict ? 'shadow-lg shadow-red-500/10' : 'shadow-md';

  const renderBuffer = (
    px: number | undefined, 
    height: number | undefined, 
    conflict: boolean, 
    isTop: boolean
  ) => {
    if (px === undefined || height === undefined) return null;
    
    const bufferBorder = conflict || isConflict ? 'border-red-500/30' : 'border-primary/30';
    const bufferBg = conflict || isConflict ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-200 dark:bg-slate-700/50';
    const bufferStripe = conflict || isConflict 
      ? 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(239,68,68,0.08) 5px, rgba(239,68,68,0.08) 10px)' 
      : 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)';
    
    const radiusClass = isTop ? 'rounded-t-lg border-t-2' : 'rounded-b-lg border-b-2';
    const minText = `${Math.round((height / 80) * 60)}m`;

    return (
      <div 
        className={`absolute left-1 right-1 ${bufferBg} ${radiusClass} border-x-2 border-dashed ${bufferBorder} z-20`} 
        style={{ top: `${px}px`, height: `${height}px`, backgroundImage: bufferStripe }}
      >
        <span className={`text-[8px] text-slate-400 absolute ${isTop ? 'bottom-0' : 'top-0'} left-1 font-bold`}>{minText}</span>
      </div>
    );
  };

  return (
    <>
      {renderBuffer(bufferTopPx, bufferTopHeight, bufferTopConflict, true)}
      <div 
        className={`absolute left-1 right-1 border-x-2 ${isManual ? 'border-y-2 rounded-lg' : ''} ${borderColor} ring-2 ${ringColor} flex flex-col items-center justify-center cursor-pointer ${bgColor} transition-all z-30 ${shadowClass}`} 
        style={{ top: `${topPx}px`, height: `${heightPx}px` }}
      >
        {isConflict ? (
          <AlertTriangle size={14} className="text-red-500" />
        ) : isManual ? (
          <span className="material-symbols-outlined text-success text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        ) : (
          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        )}
        <span className={`text-[9px] font-bold ${textColor} uppercase mt-1 text-center`}>
          {isManual ? 'Manual\nSelection' : 'Selected\nSlot'}
        </span>
      </div>
      {renderBuffer(bufferBottomPx, bufferBottomHeight, bufferBottomConflict, false)}
    </>
  );
}
