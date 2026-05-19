"use client";

import { SlipData } from "@/types";

interface Props {
  data: SlipData;
}

export default function SlipPreview({ data }: Props) {
  // Determine layout based on slip size
  let slipWidth = '85mm';
  let slipHeight = '50mm';
  let copiesCount = 10;

  if (data.slipSize === 'large') {
    slipWidth = '90mm';
    slipHeight = '60mm';
    copiesCount = 8;
  } else if (data.slipSize === 'small') {
    slipWidth = '60mm';
    slipHeight = '40mm';
    copiesCount = 21; // 3 columns * 7 rows
  }

  // Enforce A5/medium layout for Unicorn when in small layout to preserve design readability
  const isPremium = ['unicorn', 'doodle'].includes(data.template);
  const actualWidth = isPremium && data.slipSize === 'small' ? '85mm' : slipWidth;
  const actualHeight = isPremium && data.slipSize === 'small' ? '50mm' : slipHeight;
  const actualCopies = isPremium && data.slipSize === 'small' ? 10 : copiesCount;

  const slips = Array.from({ length: actualCopies }, (_, i) => i);

  // Dynamic styles based on theme
  const themeColor = data.colorTheme;
  const isLight = themeColor === '#f8fafc' || themeColor === '#ffffff';
  const textColor = isLight ? '#1e293b' : '#ffffff';

  // Helper to render backgrounds (standard patterns or AI image)
  const renderBackground = () => {
    if (data.aiBackgroundUrl) {
      return (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${data.aiBackgroundUrl})` }}
        />
      );
    }

    switch (data.pattern) {
      case 'dots':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill={themeColor} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        );
      case 'waves':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="waves" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 20 Q 10 10, 20 20 T 40 20" fill="none" stroke={themeColor} strokeWidth="2" />
                <path d="M0 40 Q 10 30, 20 40 T 40 40" fill="none" stroke={themeColor} strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#waves)" />
          </svg>
        );
      case 'grid':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="15" height="15" patternUnits="userSpaceOnUse">
                <path d="M 15 0 L 0 0 0 15" fill="none" stroke={themeColor} strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        );
      case 'confetti':
        return (
          <div className="absolute inset-0 w-full h-full opacity-20 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></div>
            <div className="absolute top-8 left-10 w-2 h-2 rotate-45 bg-amber-400"></div>
            <div className="absolute bottom-4 right-8 w-2 h-2 rounded-full bg-rose-400"></div>
            <div className="absolute top-4 right-4 w-3 h-1 rotate-12 bg-emerald-400"></div>
            <div className="absolute bottom-8 left-4 w-1.5 h-1.5 rounded-full bg-blue-400"></div>
          </div>
        );
      default:
        return null;
    }
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
      {/* Action Bar */}
      <div className="w-full max-w-[800px] flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-semibold text-slate-800">Auto-Layout A4 Preview</h3>
          <p className="text-sm text-slate-500 capitalize">{data.slipSize} Size • Perfectly fits {actualCopies} slips per page</p>
        </div>
        <div className="text-sm px-3 py-1 bg-indigo-50 text-indigo-600 font-medium rounded-full capitalize">
          {data.template} + {data.aiBackgroundUrl ? "AI Background" : data.pattern}
        </div>
      </div>

      {/* A4 Paper Container */}
      <div
        id="print-container"
        className="bg-white shadow-xl rounded-sm flex flex-wrap content-start justify-center"
        style={{
          width: '210mm',
          height: '297mm', // Standard A4 Size
          padding: '10mm',
          gap: '5mm', // Spacing between slips
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {slips.map((index) => (
          <div
            key={index}
            className="break-inside-avoid relative"
            style={{ width: actualWidth, height: actualHeight }}
          >
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

                  {/* School Name Top Header */}
                  <div className="text-center pb-0.5 border-b border-pink-100/60 mb-0.5 shrink-0">
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-wider truncate block leading-tight">
                      {data.schoolName || 'Sunrise International'}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-evenly font-sans relative pr-3">
                    {/* Student Name */}
                    <div className="relative h-6 flex items-end">
                      <div className="absolute bottom-0.5 left-0 right-0 border-b border-pink-300 border-dashed w-full z-0"></div>
                      <div className="relative z-10 flex w-full text-[8.5px] font-bold text-pink-500 leading-none">
                        <span>Student:</span>
                        <span className="text-[10.5px] text-slate-800 ml-2 font-black leading-none truncate w-[130px]">{data.studentName}</span>
                      </div>
                    </div>

                    {/* Class & Division */}
                    <div className="relative h-6 flex items-end">
                      <div className="absolute bottom-0.5 left-0 right-0 border-b border-pink-300 border-dashed w-full z-0"></div>
                      <div className="relative z-10 flex w-full text-[8.5px] font-bold text-pink-500 leading-none">
                        <span>Class:</span>
                        <span className="text-[10px] text-slate-800 ml-1.5 font-bold leading-none">{data.grade}</span>
                        <span className="ml-auto">Division:</span>
                        <span className="text-[10px] text-slate-800 ml-1.5 pr-2 font-bold leading-none">{data.section}</span>
                      </div>
                    </div>

                    {/* Roll No */}
                    <div className="relative h-6 flex items-end">
                      <div className="absolute bottom-0.5 left-0 right-0 border-b border-pink-300 border-dashed w-full z-0"></div>
                      <div className="relative z-10 flex w-full text-[8.5px] font-bold text-pink-500 leading-none">
                        <span>Roll No:</span>
                        <span className="text-[10px] text-slate-800 ml-2 font-bold leading-none">{data.rollNo}</span>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="relative h-6 flex items-end">
                      <div className="absolute bottom-0.5 left-0 right-0 border-b border-pink-300 border-dashed w-full z-0"></div>
                      <div className="relative z-10 flex w-full text-[8.5px] font-bold text-pink-500 leading-none">
                        <span>Subject:</span>
                        <span className="text-[10.5px] text-indigo-600 ml-2 font-black leading-none">{data.subject}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== 2. MODERN TEMPLATE ==================== */}
            {data.template === 'modern' && (
              <div className="w-full h-full rounded-lg overflow-hidden flex border border-slate-200 relative shadow-sm bg-white z-10">
                {renderBackground()}
                <div className="w-2 h-full shrink-0 z-10" style={{ backgroundColor: themeColor }} />

                <div className="flex-1 p-2.5 flex flex-col h-full relative z-10">
                  <div className="mb-1.5 border-b border-slate-100 pb-1 flex justify-between items-center">
                    <h4 className="font-bold text-[11px] leading-tight text-slate-800 truncate uppercase tracking-wide" style={{ color: themeColor }}>
                      {data.schoolName || 'School Name'}
                    </h4>
                  </div>

                  <div className="flex gap-2.5 flex-1 items-center">
                    <div
                      className="bg-slate-100 rounded overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center relative bg-white shadow-inner transition-all"
                      style={{
                        width: `${data.photoFrameSize}px`,
                        height: `${data.photoFrameSize * 1.15}px`
                      }}
                    >
                      {renderPhoto()}
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-1.5">
                      <div>
                        <p className="text-[6px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Student Name</p>
                        <p className="font-extrabold text-[11px] leading-none text-slate-800 truncate">{data.studentName || 'Student Name'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-x-1.5 gap-y-1">
                        <div className="col-span-2">
                          <p className="text-[6px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Subject</p>
                          <p className="font-bold text-[9.5px] leading-none" style={{ color: themeColor }}>{data.subject || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[6px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Class/Div</p>
                          <p className="font-semibold text-[8.5px] text-slate-700 leading-none truncate">{data.grade} - {data.section}</p>
                        </div>
                        <div>
                          <p className="text-[6px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Roll No.</p>
                          <p className="font-semibold text-[8.5px] text-slate-700 leading-none">{data.rollNo || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== 3. CLASSIC TEMPLATE ==================== */}
            {data.template === 'classic' && (
              <div className="w-full h-full border-2 bg-white relative flex flex-col z-10" style={{ borderColor: themeColor }}>
                {renderBackground()}
                <div className="w-full py-1 text-center flex flex-col items-center justify-center border-b-2 z-10" style={{ backgroundColor: themeColor, borderColor: themeColor, color: textColor }}>
                  <h4 className="font-bold text-[11px] uppercase tracking-wide leading-tight truncate px-1 w-full">{data.schoolName || 'School Name'}</h4>
                </div>

                <div className="flex-1 flex p-1.5 gap-2 z-10 bg-white/95 items-center">
                  <div className="flex-1 flex flex-col justify-evenly h-full py-0.5 font-sans">
                    <div className="flex items-end border-b border-slate-300 border-dashed pb-0.5">
                      <span className="text-[7.5px] font-bold text-slate-500 w-12 shrink-0">Student:</span>
                      <span className="text-[10px] font-extrabold text-slate-900 ml-1 truncate leading-none">{data.studentName}</span>
                    </div>
                    <div className="flex items-end border-b border-slate-300 border-dashed pb-0.5">
                      <span className="text-[7.5px] font-bold text-slate-500 w-12 shrink-0">Class/Div:</span>
                      <span className="text-[9px] font-bold text-slate-800 ml-1 leading-none">{data.grade} - {data.section}</span>
                    </div>
                    <div className="flex items-end border-b border-slate-300 border-dashed pb-0.5">
                      <span className="text-[7.5px] font-bold text-slate-500 w-12 shrink-0">Roll No.</span>
                      <span className="text-[9px] font-semibold text-slate-800 ml-1 leading-none">{data.rollNo}</span>
                    </div>
                    <div className="flex items-end border-b border-slate-300 border-dashed pb-0.5">
                      <span className="text-[7.5px] font-bold text-slate-500 w-12 shrink-0">Subject:</span>
                      <span className="text-[9px] font-extrabold ml-1 leading-none truncate" style={{ color: themeColor }}>{data.subject}</span>
                    </div>
                  </div>

                  <div
                    className="border border-slate-300 shrink-0 flex items-center justify-center p-0.5 bg-white shadow-sm overflow-hidden transition-all"
                    style={{
                      width: `${data.photoFrameSize}px`,
                      height: `${data.photoFrameSize * 1.25}px`
                    }}
                  >
                    {renderPhoto()}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== 4. PLAYFUL TEMPLATE ==================== */}
            {data.template === 'playful' && (
              <div className="w-full h-full bg-white rounded-xl overflow-hidden border border-slate-200 relative shadow-sm z-10">
                {renderBackground()}

                <div className="h-7 relative z-10 flex items-center px-3" style={{ backgroundColor: themeColor }}>
                  <h4 className="font-black text-[12px] text-white tracking-wide truncate" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.2)' }}>
                    {data.schoolName || 'School Name'}
                  </h4>
                </div>
                <svg className="w-full h-2 absolute top-7 left-0 z-10" preserveAspectRatio="none" viewBox="0 0 1440 74" fill={themeColor} xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,0 C240,74 480,74 720,37 C960,0 1200,0 1440,37 L1440,0 L0,0 Z"></path>
                </svg>

                <div className="p-2 pt-3 flex gap-2.5 h-[calc(100%-28px)] relative z-10 items-center">
                  <div
                    className="rounded-full border-2 bg-white overflow-hidden shrink-0 shadow-md z-20 flex items-center justify-center transition-all"
                    style={{
                      width: `${data.photoFrameSize}px`,
                      height: `${data.photoFrameSize}px`,
                      borderColor: themeColor
                    }}
                  >
                    {renderPhoto()}
                  </div>

                  <div className="flex-1 min-w-0 z-20">
                    <div className="bg-white/85 backdrop-blur-sm border border-slate-100 rounded-lg p-1.5 relative shadow-sm space-y-1">
                      <div>
                        <p className="text-[5.5px] font-bold text-slate-400 uppercase leading-none mb-0.5">Student</p>
                        <p className="font-black text-[10.5px] text-slate-800 leading-none truncate">{data.studentName}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 text-[7.5px] font-extrabold font-sans">
                        <span className="bg-indigo-50 px-1 py-0.5 rounded text-indigo-600 truncate max-w-[85px]">Sub: {data.subject}</span>
                        <span className="bg-rose-50 px-1 py-0.5 rounded text-rose-500">Std {data.grade}-{data.section}</span>
                        <span className="bg-emerald-50 px-1 py-0.5 rounded text-emerald-600">Roll {data.rollNo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== DOODLE TEMPLATE ===== */}
            {data.template === 'doodle' && (
              <div className="w-full h-full relative overflow-hidden z-10 bg-yellow-50 rounded-xl shadow-sm border-[3px] border-dashed border-rose-300" style={{ fontFamily: 'var(--font-geist-sans)' }}>
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
                <div className="absolute inset-0 m-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border-2 border-indigo-200 flex flex-col p-1.5 z-10">
                  <div className="text-center mb-1 pb-1 border-b-2 border-dotted border-amber-300 shrink-0">
                    <span className="text-rose-500 font-black text-[9px] uppercase tracking-widest leading-none block truncate px-2">{data.schoolName || 'My Awesome School'}</span>
                  </div>
                  
                  <div className="flex flex-1 gap-2 items-center px-1">
                    <div className="shrink-0 rounded-2xl overflow-hidden border-4 border-white shadow-sm rotate-[-2deg] bg-blue-50" style={{width:`${data.photoFrameSize}px`,height:`${data.photoFrameSize}px`}}>
                      {renderPhoto()}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-evenly h-full py-0.5 space-y-1">
                      <div className="flex flex-col">
                        <span className="text-[6px] font-bold text-slate-400 uppercase leading-none mb-0.5">My Name is:</span>
                        <span className="text-[11px] font-black text-indigo-600 leading-none truncate block">{data.studentName || 'Student Name'}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-1 gap-y-1 mt-0.5">
                        <div className="col-span-2">
                          <span className="text-[5.5px] font-bold text-slate-400 uppercase block mb-0.5">Subject</span>
                          <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 py-0.5 rounded block truncate leading-none">{data.subject || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[5.5px] font-bold text-slate-400 uppercase block mb-0.5">Class & Div</span>
                          <span className="text-[8.5px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded block truncate leading-none">{data.grade} - {data.section}</span>
                        </div>
                        <div>
                          <span className="text-[5.5px] font-bold text-slate-400 uppercase block mb-0.5">Roll No</span>
                          <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded block truncate leading-none">{data.rollNo || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
