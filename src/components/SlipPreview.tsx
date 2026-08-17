"use client";

import { SlipData } from "@/types";
import { useState, useEffect, useRef } from "react";

interface Props {
  data: SlipData;
}

export default function SlipPreview({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [zoomMode, setZoomMode] = useState<'fit' | '100'>('100');

  const calculateFitScale = () => {
    if (typeof window !== 'undefined') {
      const containerWidth = containerRef.current
        ? containerRef.current.getBoundingClientRect().width
        : window.innerWidth;
      const windowHeight = window.innerHeight;
      const availableHeight = Math.max(350, windowHeight - 160);
      
      const widthScale = (containerWidth - 20) / 794;
      const heightScale = availableHeight / 1123;
      
      // Calculate scale so the entire A4 PDF is visible on screen without overflow
      const fitScale = Math.max(0.3, Math.min(widthScale, heightScale, 1));
      return Number(fitScale.toFixed(2));
    }
    return 0.75;
  };

  useEffect(() => {
    const handleResize = () => {
      if (zoomMode === 'fit') {
        setScale(calculateFitScale());
      } else if (zoomMode === '100') {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [zoomMode, data.slipSize]);

  // Determine layout based on slip size (8 Slips vs 10 Slips per A4 sheet)
  const is8Slips = data.slipSize === '8' || data.slipSize === 'large';
  const copiesCount = is8Slips ? 8 : 10;
  const slips = Array.from({ length: copiesCount }, (_, i) => i);

  // Dynamic styles based on theme
  const themeColor = data.colorTheme;
  const isLight = themeColor === '#f8fafc' || themeColor === '#ffffff';
  const textColor = isLight ? '#1e293b' : '#ffffff';

  // Helper to render backgrounds (AI or custom uploaded image)
  const renderBackground = () => {
    if (data.aiBackgroundUrl) {
      return (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${data.aiBackgroundUrl})` }}
        />
      );
    }
    return null;
  };

  // Helper to render the live-adjusted photo element
  const renderPhoto = () => {
    if (!data.photoUrl) {
      return <div className="w-full h-full bg-slate-50 flex items-center justify-center text-[7px] text-slate-400 font-medium">Photo</div>;
    }

    return (
      <div className="w-full h-full relative overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.photoUrl}
          alt="Student"
          className="w-full h-full object-cover"
          style={{
            transform: `scale(${data.photoZoom / 100}) rotate(${data.photoTilt}deg) translate(${data.photoX}px, ${data.photoY}px)`,
            transformOrigin: 'center center'
          }}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Action & Zoom Controls Bar */}
      <div className="w-full max-w-[840px] flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-between items-start sm:items-center mb-4 sm:mb-5 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
            <h3 className="font-black text-xs sm:text-sm text-[#1a1f4b]">Full A4 PDF Sheet Preview</h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
            {is8Slips ? '8 Slips / Sheet (Large • 4 × 2 Grid)' : '10 Slips / Sheet (Standard • 5 × 2 Grid)'}
          </p>
        </div>

        {/* Interactive Fit & 100% Controls */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setZoomMode('fit');
              setScale(calculateFitScale());
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              zoomMode === 'fit'
                ? 'bg-[#1a1f4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Fit complete A4 page to screen"
          >
            Fit Page
          </button>

          <button
            type="button"
            onClick={() => {
              setZoomMode('100');
              setScale(1);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              zoomMode === '100'
                ? 'bg-[#1a1f4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="View 100% actual print size"
          >
            100%
          </button>
        </div>
      </div>

      {/* Outer responsive wrapper that scales the A4 print container with horizontal scroll support */}
      <div 
        ref={containerRef} 
        className="w-full overflow-x-auto flex justify-center items-start transition-all duration-300 pb-12 px-1"
        style={{ minHeight: `${1123 * scale}px` }}
      >
        {/* A4 Paper Container with realistic PDF page shadow */}
        <div
          id="print-container"
          className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/10 rounded-xs transition-all origin-top duration-300"
          style={{
            width: '210mm',
            height: '297mm', // Standard A4 Size
            paddingTop: is8Slips ? '10mm' : '7.5mm',
            paddingBottom: is8Slips ? '10mm' : '7.5mm',
            paddingLeft: '7.5mm',
            paddingRight: '7.5mm',
            gap: is8Slips ? '5mm' : '3.5mm',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gridTemplateRows: is8Slips ? 'repeat(4, minmax(0, 1fr))' : 'repeat(5, minmax(0, 1fr))',
            boxSizing: 'border-box',
            overflow: 'hidden',
            transform: `scale(${scale})`,
          }}
        >
        {slips.map((index) => {
          const slipSubject = data.subjectMode === 'custom' 
            ? (data.subjects?.[index] || "") 
            : (data.subject || "");

          return (
          <div
            key={index}
            className="break-inside-avoid relative w-full h-full"
            style={{ 
              boxSizing: 'border-box',
              minWidth: 0,
              minHeight: 0
            }}
          >
            {/* ===== COMPOSED IMAGE (Gemini AI output — highest priority) ===== */}
            {data.composedSlipUrl ? (
              <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-sm border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.composedSlipUrl}
                  alt={`Composed Name Slip — ${data.studentName || 'Student'}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <>
            {/* ==================== 1. PREMIUM UNICORN TEMPLATE ==================== */}
            {data.template === 'unicorn' && (
              <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 relative bg-gradient-to-br from-pink-100/60 via-purple-50/40 to-blue-100/60 p-2 flex gap-3 shadow-md z-10">
                <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping opacity-75"></div>

                {/* Left Side: Circular Rainbow Photo Frame */}
                <div
                  className="relative shrink-0 flex items-center justify-center z-20 transition-all"
                  style={{ width: `${data.photoFrameSize + 20}px`, height: '100%' }}
                >
                  <div
                    className="rounded-full p-[4.5px] bg-gradient-to-tr from-rose-400 via-yellow-300 via-emerald-400 via-blue-400 to-indigo-400 shadow-md flex items-center justify-center transition-all"
                    style={{ width: `${data.photoFrameSize + 14}px`, height: `${data.photoFrameSize + 14}px` }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden border border-slate-100 relative">
                      {renderPhoto()}
                    </div>
                  </div>

                  {/* Cute Cartoon Unicorn SVG */}
                  <div
                    className="absolute z-30 drop-shadow-md transition-all"
                    style={{
                      width: `${(data.photoFrameSize + 14) * 0.65}px`,
                      height: `${(data.photoFrameSize + 14) * 0.65}px`,
                      bottom: '-4px',
                      left: '-4px'
                    }}
                  >
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M20 70 C 20 40, 45 40, 55 50 C 65 60, 60 80, 50 85 C 40 90, 20 85, 20 70 Z" fill="#ffffff" stroke="#ffb2d9" strokeWidth="2.5" />
                      <path d="M45 50 C 45 35, 55 25, 65 25 C 75 25, 85 30, 80 45 C 75 55, 55 60, 45 50 Z" fill="#ffffff" stroke="#ffb2d9" strokeWidth="2.5" />
                      <path d="M72 38 C 72 32, 85 32, 80 43 C 78 47, 72 43, 72 38 Z" fill="#ffe3ee" />
                      <circle cx="76" cy="38" r="1.5" fill="#4a5568" />
                      <ellipse cx="64" cy="35" rx="3" ry="4" fill="#4a5568" />
                      <circle cx="63" cy="33" r="1" fill="#ffffff" />
                      <path d="M66 32 C 67 30, 69 31, 70 33" stroke="#4a5568" strokeWidth="1.2" strokeLinecap="round" />
                      <path d="M68 25 L 78 8 L 73 22 Z" fill="#facc15" stroke="#eab308" strokeWidth="1" />
                      <path d="M42 45 C 38 35, 45 28, 48 20 C 52 28, 50 38, 48 45 Z" fill="#38bdf8" />
                      <path d="M48 35 C 45 25, 52 18, 55 10 C 59 18, 56 28, 54 35 Z" fill="#fb7185" />
                      <path d="M54 42 C 50 32, 57 25, 60 18 C 64 25, 62 32, 60 42 Z" fill="#facc15" />
                      <circle cx="67" cy="42" r="3" fill="#ffaec9" opacity="0.7" />
                    </svg>
                  </div>
                </div>

                {/* Right Side details and handwriting lines */}
                <div className="flex-1 border border-pink-200 bg-white rounded-xl p-2 relative flex flex-col justify-between shadow-inner">
                  <div className="absolute top-1 right-2 text-[10px] text-pink-400 font-bold opacity-75">⭐</div>
                  <div className="absolute top-6 right-1 text-[8px] text-indigo-400 font-bold opacity-70">🎵</div>

                  <div className="flex-1 flex flex-col justify-evenly font-sans relative pr-3">
                    {/* 1. Student Name */}
                    <div className="relative h-6 flex items-end">
                      <div className="absolute bottom-0.5 left-0 right-0 border-b border-pink-300 border-dashed w-full z-0"></div>
                      <div className="relative z-10 flex w-full text-[8.5px] font-black leading-none" style={{ color: themeColor }}>
                        <span>Name:</span>
                        <span className="text-[10.5px] text-slate-950 ml-2 font-black leading-none truncate w-[130px]">{data.studentName || ''}</span>
                      </div>
                    </div>

                    {/* 2. Subject */}
                    <div className="relative h-6 flex items-end">
                      <div className="absolute bottom-0.5 left-0 right-0 border-b border-pink-300 border-dashed w-full z-0"></div>
                      <div className="relative z-10 flex w-full text-[8.5px] font-black leading-none" style={{ color: themeColor }}>
                        <span>Subject:</span>
                        <span className="text-[10px] text-slate-950 ml-2 font-black leading-none truncate">{slipSubject}</span>
                      </div>
                    </div>

                    {/* 3. Class & Division */}
                    <div className="relative h-6 flex items-end">
                      <div className="absolute bottom-0.5 left-0 right-0 border-b border-pink-300 border-dashed w-full z-0"></div>
                      <div className="relative z-10 flex w-full text-[8.5px] font-black leading-none" style={{ color: themeColor }}>
                        <span>Class:</span>
                        <span className="text-[10px] text-slate-950 ml-1.5 font-bold leading-none">{data.grade || ''}</span>
                        <span className="ml-auto">Division:</span>
                        <span className="text-[10px] text-slate-950 ml-1.5 pr-2 font-bold leading-none">{data.section || ''}</span>
                      </div>
                    </div>

                    {/* 4. Roll No */}
                    <div className="relative h-6 flex items-end">
                      <div className="absolute bottom-0.5 left-0 right-0 border-b border-pink-300 border-dashed w-full z-0"></div>
                      <div className="relative z-10 flex w-full text-[8.5px] font-black leading-none" style={{ color: themeColor }}>
                        <span>Roll No:</span>
                        <span className="text-[10px] text-slate-950 ml-2 font-bold leading-none">{data.rollNo || ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. School Name Bottom Footer */}
                  <div className="text-center pt-0.5 border-t border-pink-100/60 mt-0.5 shrink-0 min-h-[16px]">
                    <span className="text-[10px] font-black uppercase tracking-wider truncate block leading-tight" style={{ color: themeColor }}>
                      {data.schoolName || ''}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== 2. MODERN TEMPLATE ==================== */}
            {data.template === 'modern' && (
              <div className="w-full h-full rounded-xl overflow-hidden flex border border-slate-200/80 relative shadow-sm z-10">
                {renderBackground()}
                <div className="w-2.5 h-full shrink-0 z-10" style={{ backgroundColor: themeColor }} />

                <div className="flex-1 p-2 sm:p-2.5 flex flex-col h-full relative z-10 justify-between">
                  <div className="flex gap-2.5 flex-1 items-center">
                    {/* Left: Photo Frame */}
                    <div
                      className="rounded-lg overflow-hidden border-2 shrink-0 flex items-center justify-center relative bg-white/80 shadow-sm transition-all"
                      style={{
                        width: `${data.photoFrameSize}px`,
                        height: `${data.photoFrameSize * 1.15}px`,
                        borderColor: themeColor,
                      }}
                    >
                      {renderPhoto()}
                    </div>

                    {/* Right: Details (Transparent background, no white box!) */}
                    <div className="flex-1 flex flex-col justify-center space-y-1.5 min-w-0">
                      {/* 1. Name */}
                      <div className="relative pb-0.5 border-b border-slate-300/80">
                        <p className="text-[6.5px] font-black uppercase tracking-wider leading-none mb-0.5" style={{ color: themeColor }}>Name</p>
                        <p className="font-black text-[11px] leading-none text-slate-950 truncate">{data.studentName || ''}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        {/* 2. Subject */}
                        <div className="col-span-2 relative pb-0.5 border-b border-slate-300/80">
                          <p className="text-[6.5px] font-black uppercase tracking-wider leading-none mb-0.5" style={{ color: themeColor }}>Subject</p>
                          <p className="font-black text-[9.5px] leading-none truncate text-slate-950">{slipSubject || ''}</p>
                        </div>
                        {/* 3. Class/Div */}
                        <div className="relative pb-0.5 border-b border-slate-300/80">
                          <p className="text-[6.5px] font-black uppercase tracking-wider leading-none mb-0.5" style={{ color: themeColor }}>Class / Div</p>
                          <p className="font-black text-[9px] text-slate-950 leading-none truncate">{data.grade || ''}{data.section ? ` - ${data.section}` : ''}</p>
                        </div>
                        {/* 4. Roll No */}
                        <div className="relative pb-0.5 border-b border-slate-300/80">
                          <p className="text-[6.5px] font-black uppercase tracking-wider leading-none mb-0.5" style={{ color: themeColor }}>Roll No</p>
                          <p className="font-black text-[9px] text-slate-950 leading-none">{data.rollNo || ''}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. School Footer */}
                  <div className="mt-1 border-t border-slate-300/80 pt-1 flex justify-between items-center shrink-0 min-h-[16px]">
                    <h4 className="font-extrabold text-[10px] leading-tight truncate uppercase tracking-wide" style={{ color: themeColor }}>
                      {data.schoolName || ''}
                    </h4>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== 3. CLASSIC TEMPLATE ==================== */}
            {data.template === 'classic' && (
              <div className="w-full h-full border-2 relative flex flex-col z-10 justify-between overflow-hidden rounded-lg shadow-sm" style={{ borderColor: themeColor }}>
                {renderBackground()}

                <div className="flex-1 flex p-2 gap-2.5 z-10 items-center">
                  {/* Left: Details (Transparent background, no white block!) */}
                  <div className="flex-1 flex flex-col justify-evenly h-full py-0.5 font-sans">
                    {/* 1. Name */}
                    <div className="flex items-end border-b border-slate-300/80 border-dashed pb-0.5 h-5">
                      <span className="text-[8px] font-black w-14 shrink-0" style={{ color: themeColor }}>Name:</span>
                      <span className="text-[10.5px] font-black text-slate-950 ml-1 truncate leading-none flex-1">{data.studentName || ''}</span>
                    </div>
                    {/* 2. Subject */}
                    <div className="flex items-end border-b border-slate-300/80 border-dashed pb-0.5 h-5">
                      <span className="text-[8px] font-black w-14 shrink-0" style={{ color: themeColor }}>Subject:</span>
                      <span className="text-[10px] font-black text-slate-950 ml-1 leading-none truncate flex-1">{slipSubject || ''}</span>
                    </div>
                    {/* 3. Class/Div */}
                    <div className="flex items-end border-b border-slate-300/80 border-dashed pb-0.5 h-5">
                      <span className="text-[8px] font-black w-14 shrink-0" style={{ color: themeColor }}>Class/Div:</span>
                      <span className="text-[9.5px] font-black text-slate-950 ml-1 leading-none flex-1">{data.grade || ''}{data.section ? ` - ${data.section}` : ''}</span>
                    </div>
                    {/* 4. Roll No */}
                    <div className="flex items-end border-b border-slate-300/80 border-dashed pb-0.5 h-5">
                      <span className="text-[8px] font-black w-14 shrink-0" style={{ color: themeColor }}>Roll No:</span>
                      <span className="text-[9.5px] font-black text-slate-950 ml-1 leading-none flex-1">{data.rollNo || ''}</span>
                    </div>
                  </div>

                  {/* Right: Photo Frame */}
                  <div
                    className="border-2 rounded-lg shrink-0 flex items-center justify-center p-0.5 bg-white/80 shadow-sm overflow-hidden transition-all"
                    style={{
                      width: `${data.photoFrameSize}px`,
                      height: `${data.photoFrameSize * 1.2}px`,
                      borderColor: themeColor,
                    }}
                  >
                    {renderPhoto()}
                  </div>
                </div>

                {/* Bottom: School Name */}
                <div className="w-full py-1 text-center flex flex-col items-center justify-center z-10 shrink-0 min-h-[18px]" style={{ backgroundColor: themeColor, color: textColor }}>
                  <h4 className="font-bold text-[10px] uppercase tracking-wide leading-tight truncate px-2 w-full">{data.schoolName || ''}</h4>
                </div>
              </div>
            )}

            {/* ==================== 4. PLAYFUL TEMPLATE ==================== */}
            {data.template === 'playful' && (
              <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200/80 relative shadow-sm z-10 flex flex-col justify-between">
                {renderBackground()}

                <div className="p-2 pt-2.5 flex gap-2.5 flex-grow relative z-10 items-center">
                  {/* Left: Circular Photo Frame with double border */}
                  <div
                    className="rounded-full border-[3px] bg-white/80 overflow-hidden shrink-0 shadow-md z-20 flex items-center justify-center transition-all p-0.5"
                    style={{
                      width: `${data.photoFrameSize + 8}px`,
                      height: `${data.photoFrameSize + 8}px`,
                      borderColor: themeColor
                    }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden">
                      {renderPhoto()}
                    </div>
                  </div>

                  {/* Right: Details (Transparent, NO opaque white box!) */}
                  <div className="flex-1 min-w-0 z-20 space-y-1.5">
                    {/* 1. Name */}
                    <div className="border-b border-slate-300/80 pb-0.5">
                      <p className="text-[6.5px] font-extrabold uppercase leading-none mb-0.5" style={{ color: themeColor }}>Name</p>
                      <p className="font-black text-[11px] text-slate-950 leading-none truncate">{data.studentName || ''}</p>
                    </div>

                    {/* 2. Sub, 3. Std/Div, 4. Roll with clean underline rows */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <div className="col-span-2 border-b border-slate-300/80 pb-0.5">
                        <span className="text-[6.5px] font-extrabold uppercase block leading-none mb-0.5" style={{ color: themeColor }}>Subject</span>
                        <span className="text-[9.5px] font-black text-slate-950 truncate block leading-none">{slipSubject || ''}</span>
                      </div>
                      <div className="border-b border-slate-300/80 pb-0.5">
                        <span className="text-[6.5px] font-extrabold uppercase block leading-none mb-0.5" style={{ color: themeColor }}>Class / Div</span>
                        <span className="text-[9px] font-black text-slate-950 truncate block leading-none">{data.grade || ''}{data.section ? ` - ${data.section}` : ''}</span>
                      </div>
                      <div className="border-b border-slate-300/80 pb-0.5">
                        <span className="text-[6.5px] font-extrabold uppercase block leading-none mb-0.5" style={{ color: themeColor }}>Roll No</span>
                        <span className="text-[9px] font-black text-slate-950 block leading-none">{data.rollNo || ''}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. School Banner */}
                <div className="h-5.5 relative z-10 flex items-center px-3 mt-1 shrink-0" style={{ backgroundColor: themeColor }}>
                  <h4 className="font-black text-[10px] text-white tracking-wide truncate">
                    {data.schoolName || ''}
                  </h4>
                </div>
              </div>
            )}

            {/* ===== DOODLE TEMPLATE ===== */}
            {data.template === 'doodle' && (
              <div className="w-full h-full relative overflow-hidden z-10 bg-yellow-50 rounded-xl shadow-sm border-[3px] border-dashed font-fredoka" style={{ borderColor: themeColor }}>
                {/* Doodles & Rainbows */}
                <svg className="absolute -top-3 -left-3 w-16 h-16 opacity-80 z-0" viewBox="0 0 60 60">
                  <path d="M10,40 Q30,10 50,40" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
                  <path d="M10,45 Q30,15 50,45" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                  <path d="M10,50 Q30,20 50,50" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
                  <path d="M10,55 Q30,25 50,55" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="15" cy="45" r="8" fill="white" />
                  <circle cx="25" cy="40" r="10" fill="white" />
                  <circle cx="35" cy="40" r="9" fill="white" />
                  <circle cx="45" cy="45" r="7" fill="white" />
                </svg>

                <div className="absolute top-2 right-4 text-2xl animate-pulse drop-shadow-md">⭐</div>
                <div className="absolute bottom-2 left-2 text-xl opacity-80">✏️</div>
                <div className="absolute bottom-5 right-2 text-xl opacity-80">🎨</div>
                <div className="absolute top-1/2 left-1 text-sm opacity-60">✨</div>
                
                {/* Center Content Box */}
                <div className="absolute inset-0 m-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border-2 flex flex-col p-1.5 justify-between z-10" style={{ borderColor: `${themeColor}60` }}>
                  <div className="flex flex-1 gap-2 items-center px-1">
                    <div className="shrink-0 rounded-2xl overflow-hidden border-4 border-white shadow-sm rotate-[-2deg] bg-blue-50" style={{width:`${data.photoFrameSize}px`,height:`${data.photoFrameSize}px`}}>
                      {renderPhoto()}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-evenly h-full py-0.5 space-y-1">
                      {/* 1. Name */}
                      <div className="flex flex-col">
                        <span className="text-[6px] font-black text-slate-500 uppercase leading-none mb-0.5">My Name is:</span>
                        <span className="text-[11px] font-black text-indigo-900 leading-none truncate block">{data.studentName || ''}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-1 gap-y-1 mt-0.5">
                        {/* 2. Subject */}
                        <div className="col-span-2">
                          <span className="text-[5.5px] font-black text-slate-500 uppercase block mb-0.5">Subject</span>
                          {slipSubject ? (
                            <span className="text-[9px] font-black text-rose-700 bg-rose-50 px-1 py-0.5 rounded block truncate leading-none">{slipSubject}</span>
                          ) : (
                            <div className="h-2.5 border-b border-rose-300 border-dashed w-full"></div>
                          )}
                        </div>
                        {/* 3. Class & Div */}
                        <div>
                          <span className="text-[5.5px] font-black text-slate-500 uppercase block mb-0.5">Class & Div</span>
                          <span className="text-[8.5px] font-black text-amber-800 bg-amber-50 px-1 py-0.5 rounded block truncate leading-none">{data.grade || ''} {data.section ? `- ${data.section}` : ''}</span>
                        </div>
                        {/* 4. Roll No */}
                        <div>
                          <span className="text-[5.5px] font-black text-slate-500 uppercase block mb-0.5">Roll No</span>
                          <span className="text-[8.5px] font-black text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded block truncate leading-none">{data.rollNo || ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. School */}
                  <div className="text-center mt-1 pt-1 border-t-2 border-dotted border-amber-300 shrink-0 min-h-[16px]">
                    <span className="font-black text-[9px] uppercase tracking-widest leading-none block truncate px-2" style={{ color: themeColor }}>{data.schoolName || ''}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ===== SPACE EXPLORER TEMPLATE ===== */}
            {data.template === 'space' && (
              <div className="w-full h-full relative overflow-hidden z-10 bg-gradient-to-br from-[#0b0f2a] via-[#1a1c4b] to-[#2e1065] rounded-xl shadow-md border border-indigo-500/40 p-2 flex gap-2.5 items-center font-sans">
                {/* Cosmic decorative elements */}
                <div className="absolute top-1 right-2 text-xs animate-pulse opacity-90">🪐</div>
                <div className="absolute bottom-1 right-8 text-[10px] opacity-75">🚀</div>
                <div className="absolute top-4 left-1/2 text-[8px] text-cyan-300 opacity-60">✨</div>
                <div className="absolute bottom-4 left-3 text-[9px] text-yellow-300 opacity-70">⭐</div>
                
                {/* Photo Frame with glowing cosmic ring */}
                <div
                  className="relative shrink-0 flex items-center justify-center z-20 transition-all"
                  style={{ width: `${data.photoFrameSize + 10}px`, height: '100%' }}
                >
                  <div
                    className="rounded-full p-[3px] bg-gradient-to-tr from-cyan-400 via-indigo-400 to-fuchsia-500 shadow-lg shadow-cyan-500/20 flex items-center justify-center transition-all"
                    style={{ width: `${data.photoFrameSize + 8}px`, height: `${data.photoFrameSize + 8}px` }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden border border-indigo-200/40 relative bg-slate-900">
                      {renderPhoto()}
                    </div>
                  </div>
                </div>

                {/* Content Box */}
                <div className="flex-1 bg-white/95 backdrop-blur-md rounded-lg p-2 relative flex flex-col justify-between h-full shadow-md border border-indigo-200/60 z-10">
                  <div className="flex-1 flex flex-col justify-evenly font-sans">
                    {/* Name */}
                    <div className="border-b border-indigo-200/80 pb-0.5">
                      <span className="text-[6.5px] font-black uppercase text-indigo-600 block leading-none mb-0.5">Astronaut Name</span>
                      <span className="text-[11px] font-black text-slate-950 leading-none truncate block">{data.studentName || ''}</span>
                    </div>

                    {/* Subject, Class, Roll */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-0.5">
                      <div className="col-span-2 border-b border-indigo-200/80 pb-0.5">
                        <span className="text-[6.5px] font-black uppercase text-indigo-600 block leading-none mb-0.5">Subject</span>
                        <span className="text-[9.5px] font-black text-slate-950 truncate block leading-none">{slipSubject || ''}</span>
                      </div>
                      <div className="border-b border-indigo-200/80 pb-0.5">
                        <span className="text-[6.5px] font-black uppercase text-indigo-600 block leading-none mb-0.5">Class / Div</span>
                        <span className="text-[9px] font-black text-slate-950 truncate block leading-none">{data.grade || ''}{data.section ? ` - ${data.section}` : ''}</span>
                      </div>
                      <div className="border-b border-indigo-200/80 pb-0.5">
                        <span className="text-[6.5px] font-black uppercase text-indigo-600 block leading-none mb-0.5">Roll No</span>
                        <span className="text-[9px] font-black text-slate-950 block leading-none">{data.rollNo || ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* School Footer */}
                  <div className="text-center pt-1 border-t border-indigo-100 mt-1 shrink-0 min-h-[15px]">
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-indigo-900 truncate block leading-tight">
                      {data.schoolName || ''}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Fallback to Modern template if not matched */}
            {!['unicorn', 'modern', 'classic', 'playful', 'doodle', 'space'].includes(data.template) && (
              <div className="w-full h-full rounded-xl overflow-hidden flex border border-slate-200/80 relative shadow-sm z-10">
                {renderBackground()}
                <div className="w-2.5 h-full shrink-0 z-10" style={{ backgroundColor: themeColor }} />

                <div className="flex-1 p-2 sm:p-2.5 flex flex-col h-full relative z-10 justify-between">
                  <div className="flex gap-2.5 flex-1 items-center">
                    <div
                      className="rounded-lg overflow-hidden border-2 shrink-0 flex items-center justify-center relative bg-white/80 shadow-sm transition-all"
                      style={{
                        width: `${data.photoFrameSize}px`,
                        height: `${data.photoFrameSize * 1.15}px`,
                        borderColor: themeColor,
                      }}
                    >
                      {renderPhoto()}
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-1.5 min-w-0">
                      {/* 1. Name */}
                      <div className="relative pb-0.5 border-b border-slate-300/80">
                        <p className="text-[6.5px] font-black uppercase tracking-wider leading-none mb-0.5" style={{ color: themeColor }}>Name</p>
                        <p className="font-black text-[11px] leading-none text-slate-950 truncate">{data.studentName || ''}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        {/* 2. Subject */}
                        <div className="col-span-2 relative pb-0.5 border-b border-slate-300/80">
                          <p className="text-[6.5px] font-black uppercase tracking-wider leading-none mb-0.5" style={{ color: themeColor }}>Subject</p>
                          <p className="font-black text-[9.5px] leading-none truncate text-slate-950">{slipSubject || ''}</p>
                        </div>
                        {/* 3. Class/Div */}
                        <div className="relative pb-0.5 border-b border-slate-300/80">
                          <p className="text-[6.5px] font-black uppercase tracking-wider leading-none mb-0.5" style={{ color: themeColor }}>Class / Div</p>
                          <p className="font-black text-[9px] text-slate-950 leading-none truncate">{data.grade || ''}{data.section ? ` - ${data.section}` : ''}</p>
                        </div>
                        {/* 4. Roll No */}
                        <div className="relative pb-0.5 border-b border-slate-300/80">
                          <p className="text-[6.5px] font-black uppercase tracking-wider leading-none mb-0.5" style={{ color: themeColor }}>Roll No</p>
                          <p className="font-black text-[9px] text-slate-950 leading-none">{data.rollNo || ''}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. School Footer */}
                  <div className="mt-1 border-t border-slate-300/80 pt-1 flex justify-between items-center shrink-0 min-h-[16px]">
                    <h4 className="font-extrabold text-[10px] leading-tight truncate uppercase tracking-wide" style={{ color: themeColor }}>
                      {data.schoolName || ''}
                    </h4>
                  </div>
                </div>
              </div>
            )}
              </>
            )}
          </div>
          );
        })}
      </div>
    </div>
  </div>
  );
}
