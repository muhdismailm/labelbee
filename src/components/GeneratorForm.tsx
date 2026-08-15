"use client";

import { SlipData } from "@/types";
import { 
  User, 
  Image as ImageIcon, 
  Settings, 
  Palette, 
  Layers, 
  Sparkles, 
  Loader2, 
  BookOpen, 
  Move, 
  RotateCw, 
  ZoomIn, 
  Maximize2,
  Upload,
  Crown,
  Lock,
  CheckCircle2,
  Wand2,
  PenTool,
  FileText,
  Trash2,
  ImagePlus,
  Zap,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";

interface Props {
  data: SlipData;
  onChange: (updates: Partial<SlipData>) => void;
  userPlan?: 'free' | 'starter' | 'popular' | 'business';
  onUpgradeBusiness?: () => void;
}

const THEMES = [
  { id: '#6366f1', name: 'Indigo' },
  { id: '#3b82f6', name: 'Blue' },
  { id: '#10b981', name: 'Emerald' },
  { id: '#f59e0b', name: 'Amber' },
  { id: '#f43f5e', name: 'Rose' },
  { id: '#14b8a6', name: 'Teal' },
  { id: '#1e293b', name: 'Slate' },
  { id: '#991b1b', name: 'Maroon' },
];

export default function GeneratorForm({ 
  data, 
  onChange, 
  userPlan = 'free', 
  onUpgradeBusiness 
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateBgInputRef = useRef<HTMLInputElement>(null);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Gemini Vision Theme Analysis State
  const [analyzingTheme, setAnalyzingTheme] = useState(false);
  const [themeAnalysisSuccess, setThemeAnalysisSuccess] = useState<{
    description: string;
    advice?: string;
    colorTheme?: string;
  } | null>(null);
  const [themeAnalysisError, setThemeAnalysisError] = useState<string | null>(null);

  // AI Compose State (Business Plan)
  const [composing, setComposing] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [composeSuccess, setComposeSuccess] = useState(false);

  const isBusinessUser = userPlan === 'business';

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({
        photoUrl: url,
        photoZoom: 100,
        photoTilt: 0,
        photoX: 0,
        photoY: 0,
        photoFrameSize: 65
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = () => {
    onChange({
      photoUrl: null,
      photoZoom: 100,
      photoTilt: 0,
      photoX: 0,
      photoY: 0,
      photoFrameSize: 65
    });
  };

  // Analyze uploaded background with Gemini Vision API
  const analyzeBackgroundWithGemini = async (base64Image: string) => {
    setAnalyzingTheme(true);
    setThemeAnalysisError(null);
    setThemeAnalysisSuccess(null);

    try {
      const res = await fetch("/api/analyze-theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64: base64Image }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to analyze theme with Gemini AI.");
      }

      // Automatically harmonize color theme & template layout
      const updates: Partial<SlipData> = {};
      if (result.colorTheme) updates.colorTheme = result.colorTheme;
      if (result.template) updates.template = result.template;
      onChange(updates);

      setThemeAnalysisSuccess({
        description: result.themeDescription,
        advice: result.themeAdvice,
        colorTheme: result.colorTheme,
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Gemini theme analysis failed:", error);
      setThemeAnalysisError(error.message || "Failed to adapt theme.");
    } finally {
      setAnalyzingTheme(false);
    }
  };

  // Handle custom background template upload (Business Plan)
  const handleTemplateBgUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isBusinessUser) {
      if (onUpgradeBusiness) onUpgradeBusiness();
      if (templateBgInputRef.current) templateBgInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        onChange({ aiBackgroundUrl: base64Url });
        // Automatically run Gemini Vision analysis to harmonize theme & details
        await analyzeBackgroundWithGemini(base64Url);
      }
    };
    reader.readAsDataURL(file);
    if (templateBgInputRef.current) templateBgInputRef.current.value = '';
  };

  // Call API route to generate background via AI
  const generateAiBackground = async (promptOverride?: string) => {
    const activePrompt = (promptOverride || aiPrompt).trim();
    if (!activePrompt) return;

    setAiLoading(true);
    setAiError(null);

    // Heuristic instant color harmonization based on prompt
    const p = activePrompt.toLowerCase();
    let initialColor = data.colorTheme;
    if (p.includes('space') || p.includes('astro') || p.includes('galaxy') || p.includes('planet')) {
      initialColor = '#1e3a8a';
    } else if (p.includes('racing') || p.includes('car') || p.includes('speed') || p.includes('track')) {
      initialColor = '#dc2626';
    } else if (p.includes('princess') || p.includes('castle') || p.includes('crown') || p.includes('barbie') || p.includes('fairy')) {
      initialColor = '#db2777';
    } else if (p.includes('superhero') || p.includes('comic') || p.includes('action') || p.includes('hero')) {
      initialColor = '#0284c7';
    } else if (p.includes('dinosaur') || p.includes('dino') || p.includes('jungle')) {
      initialColor = '#059669';
    } else if (p.includes('unicorn') || p.includes('rainbow')) {
      initialColor = '#ec4899';
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: activePrompt }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to generate image.");
      }

      const updates: Partial<SlipData> = { 
        aiBackgroundUrl: result.imageUrl,
        colorTheme: initialColor,
      };

      // If user was on a standalone premium theme, switch to modern so the background is displayed
      if (data.template === 'unicorn' || data.template === 'doodle') {
        updates.template = 'modern';
      }

      onChange(updates);

      // Optionally run Gemini vision harmonization in background for fine-tuning
      if (result.imageUrl && !result.imageUrl.startsWith('data:image/svg+xml')) {
        analyzeBackgroundWithGemini(result.imageUrl).catch(() => {});
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      setAiError(error.message || "An error occurred generating AI background.");
    } finally {
      setAiLoading(false);
    }
  };

  const removeAiBackground = () => {
    onChange({ aiBackgroundUrl: null, composedSlipUrl: null });
    setAiPrompt("");
    setThemeAnalysisSuccess(null);
    setThemeAnalysisError(null);
    setComposeError(null);
    setComposeSuccess(false);
  };

  const clearComposedSlip = () => {
    onChange({ composedSlipUrl: null });
    setComposeError(null);
    setComposeSuccess(false);
  };

  // ─── Main Business Plan AI Composer ───────────────────────────────────────
  const composeWithGemini = async () => {
    if (!data.aiBackgroundUrl) return;

    setComposing(true);
    setComposeError(null);
    setComposeSuccess(false);

    try {
      const res = await fetch("/api/compose-slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backgroundBase64: data.aiBackgroundUrl,
          studentPhotoBase64: data.photoUrl || undefined,
          stylePrompt: data.stylePrompt || undefined,
          studentDetails: {
            studentName: data.studentName,
            grade: data.grade,
            section: data.section,
            rollNo: data.rollNo,
            subject: data.subject || (data.subjects?.[0] ?? ""),
            schoolName: data.schoolName,
          },
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gemini composition failed.");
      }

      if (result.composedSlipUrl) {
        onChange({ composedSlipUrl: result.composedSlipUrl });
        setComposeSuccess(true);
      } else {
        throw new Error("No image returned from Gemini.");
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[compose] Error:", error);
      setComposeError(error.message || "Failed to compose name slip.");
    } finally {
      setComposing(false);
    }
  };


  return (
    <>
      <div className="p-3.5 sm:p-6 space-y-5 sm:space-y-7">
        <div className="border-b border-slate-100 pb-4 sm:pb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5C42E]"></span>
            <h2 className="text-xl sm:text-2xl font-black text-[#1a1f4b] tracking-tight">Design Settings</h2>
          </div>
          <p className="text-slate-500 text-xs font-medium mt-1">Customize student information, layout & background</p>
        </div>

        {/* Student & School Info */}
        <section className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-[#1a1f4b] font-bold text-sm">
              <User className="w-4 h-4 text-[#1a1f4b]" />
              <h3>Student & School Information</h3>
            </div>
            <span className="text-[10.5px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {(data.slipSize === '8' || data.slipSize === 'large') ? '8 Slips / Sheet' : '10 Slips / Sheet'}
            </span>
          </div>

          <div className="space-y-3.5">
            {/* 1. Student Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">1. Student Full Name</label>
              <input
                type="text" name="studentName" value={data.studentName} onChange={handleInputChange}
                placeholder="e.g. John Doe"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/40 focus:border-[#1a1f4b] outline-none transition-all text-slate-800 text-sm font-medium"
              />
            </div>

            {/* 2. Subject Section with Dynamic Per-Slip or Blank Switch */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#1a1f4b] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>2. Subject Mode</span>
                </label>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => onChange({ subjectMode: 'blank' })}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      data.subjectMode === 'blank'
                        ? 'bg-[#1a1f4b] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PenTool className="w-3 h-3" />
                    <span>Blank (Handwritten)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ subjectMode: 'custom' })}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      data.subjectMode === 'custom'
                        ? 'bg-[#1a1f4b] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Type per Slip</span>
                  </button>
                </div>
              </div>

              {data.subjectMode === 'blank' ? (
                <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 text-center">
                  <p className="text-[11.5px] text-slate-500 font-medium">
                    Slips will have a <span className="font-bold text-[#1a1f4b]">blank handwriting line</span> for writing subjects by pen.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">
                      Fill individual subjects (leave empty for blank line):
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const coreSubjects = ["English", "Mathematics", "Science", "Social Science", "Hindi", "Computer", "General Knowledge", "Language", "Physics", "Chemistry"];
                          const count = (data.slipSize === '8' || data.slipSize === 'large') ? 8 : 10;
                          onChange({ subjects: coreSubjects.slice(0, count) });
                        }}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-100 transition-colors cursor-pointer"
                      >
                        Auto-fill Core
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange({ subjects: [] })}
                        className="text-[10px] font-bold text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Dynamic grid of subject inputs based on 8 or 10 slips */}
                  {(() => {
                    const count = (data.slipSize === '8' || data.slipSize === 'large') ? 8 : 10;
                    return (
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {Array.from({ length: count }, (_, i) => (
                          <div key={i} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 focus-within:border-[#1a1f4b] focus-within:ring-1 focus-within:ring-[#F5C42E]/40">
                            <span className="text-[10px] font-black text-amber-700 bg-amber-50 w-5 h-5 rounded flex items-center justify-center shrink-0">
                              #{i + 1}
                            </span>
                            <input
                              type="text"
                              value={data.subjects?.[i] || ""}
                              onChange={(e) => {
                                const newSubjects = [...(data.subjects || [])];
                                while (newSubjects.length < count) newSubjects.push("");
                                newSubjects[i] = e.target.value;
                                onChange({ subjects: newSubjects });
                              }}
                              placeholder={`Slip ${i + 1} Subject`}
                              className="w-full text-xs font-bold text-slate-800 outline-none bg-transparent"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 3. Class / Std, Sec / Div, Roll No. */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">3. Class, Division & Roll No.</label>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 mb-0.5">Class / Std</span>
                  <input
                    type="text" name="grade" value={data.grade} onChange={handleInputChange}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/40 focus:border-[#1a1f4b] outline-none transition-all text-slate-800 text-xs font-medium"
                  />
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 mb-0.5">Sec / Div</span>
                  <input
                    type="text" name="section" value={data.section} onChange={handleInputChange}
                    placeholder="e.g. A"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/40 focus:border-[#1a1f4b] outline-none transition-all text-slate-800 text-xs font-medium"
                  />
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 mb-0.5">Roll No.</span>
                  <input
                    type="text" name="rollNo" value={data.rollNo} onChange={handleInputChange}
                    placeholder="e.g. 12"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/40 focus:border-[#1a1f4b] outline-none transition-all text-slate-800 text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* 4. School / College Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">4. School / College Name</label>
              <input
                type="text" name="schoolName" value={data.schoolName} onChange={handleInputChange}
                placeholder="e.g. Sunrise International School"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/40 focus:border-[#1a1f4b] outline-none transition-all text-slate-800 text-sm font-medium"
              />
            </div>
          </div>
        </section>

        {/* Photo Upload & Alignments directly on nameslip */}
        <section className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-[#1a1f4b] font-bold text-sm mb-1">
            <ImageIcon className="w-4 h-4 text-[#1a1f4b]" />
            <h3>Student Photo</h3>
          </div>

          {data.photoUrl ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.photoUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <span className="text-xs font-bold text-[#1a1f4b] block">Photo Active</span>
                    <span className="text-[11px] text-slate-500 font-medium">Use sliders below to adjust</span>
                  </div>
                </div>
                <button
                  onClick={removePhoto}
                  className="text-rose-600 text-xs font-bold hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {/* LIVE SLIDERS FOR NAMESLIP ADJUSTMENT */}
              <div className="bg-amber-50/40 border border-amber-200/60 p-4 rounded-xl space-y-4 shadow-sm">
                <span className="text-xs font-extrabold text-[#1a1f4b] uppercase tracking-wider block mb-1">Live Image Framing</span>

                {/* 0. Photo Frame Size */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5 text-amber-600" /> Frame Size</span>
                    <span className="font-bold text-[#1a1f4b]">{data.photoFrameSize}px</span>
                  </div>
                  <input
                    type="range"
                    value={data.photoFrameSize}
                    min={45}
                    max={95}
                    step={1}
                    onChange={(e) => onChange({ photoFrameSize: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1a1f4b]"
                  />
                </div>

                {/* 1. Zoom Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5 text-amber-600" /> Image Zoom</span>
                    <span className="font-bold text-[#1a1f4b]">{data.photoZoom}%</span>
                  </div>
                  <input
                    type="range"
                    value={data.photoZoom}
                    min={100}
                    max={300}
                    step={1}
                    onChange={(e) => onChange({ photoZoom: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1a1f4b]"
                  />
                </div>

                {/* 2. Tilt Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><RotateCw className="w-3.5 h-3.5 text-amber-600" /> Image Tilt</span>
                    <span className="font-bold text-[#1a1f4b]">{data.photoTilt}°</span>
                  </div>
                  <input
                    type="range"
                    value={data.photoTilt}
                    min={-180}
                    max={180}
                    step={1}
                    onChange={(e) => onChange({ photoTilt: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1a1f4b]"
                  />
                </div>

                {/* 3. Horizontal Pan Offset (photoX) */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5 text-amber-600" /> Move Horizontal</span>
                    <span className="font-bold text-[#1a1f4b]">{data.photoX}px</span>
                  </div>
                  <input
                    type="range"
                    value={data.photoX}
                    min={-60}
                    max={60}
                    step={1}
                    onChange={(e) => onChange({ photoX: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1a1f4b]"
                  />
                </div>

                {/* 4. Vertical Pan Offset (photoY) */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5 text-amber-600" /> Move Vertical</span>
                    <span className="font-bold text-[#1a1f4b]">{data.photoY}px</span>
                  </div>
                  <input
                    type="range"
                    value={data.photoY}
                    min={-60}
                    max={60}
                    step={1}
                    onChange={(e) => onChange({ photoY: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1a1f4b]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all group"
            >
              <div className="w-11 h-11 bg-amber-100/80 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[#1a1f4b]">Click to upload student photo</p>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG up to 5MB</p>
            </div>
          )}
          <input
            type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden"
          />
        </section>

        {/* Styling & Layout */}
        <section className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-[#1a1f4b] font-bold text-sm">
            <Settings className="w-4 h-4 text-[#1a1f4b]" />
            <h3>Layout & Theme</h3>
          </div>

          {/* Design Selection Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#1a1f4b]" /> Select Design Template
              </label>
              <span className="text-[10px] font-semibold text-slate-400">Standard supports AI</span>
            </div>
            <select
              name="template"
              value={data.template}
              onChange={(e) => {
                const val = e.target.value as SlipData['template'];
                const validTemplates = ['classic', 'modern', 'playful', 'unicorn', 'doodle'];
                const nextTemplate = validTemplates.includes(val) ? val : 'unicorn';
                const updates: Partial<SlipData> = { 
                  template: nextTemplate,
                  composedSlipUrl: null,
                };
                // If switching to standalone premium themes, clear AI background so the theme artwork shows
                if (nextTemplate === 'unicorn' || nextTemplate === 'doodle') {
                  updates.aiBackgroundUrl = null;
                }
                onChange(updates);
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/40 focus:border-[#1a1f4b] outline-none transition-all text-[#1a1f4b] bg-white font-bold text-xs cursor-pointer shadow-sm"
            >
              <optgroup label="Standard Layouts (AI Compatible)">
                <option value="classic">Classic Bordered</option>
                <option value="modern">Modern Accent</option>
                <option value="playful">Playful Rounded</option>
              </optgroup>
              <optgroup label="Premium Standalone Themes">
                <option value="unicorn">Rainbow Unicorn</option>
                <option value="doodle">Rainbow Doodles</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#1a1f4b]" /> Color Theme
            </label>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onChange({ colorTheme: theme.id })}
                  className={`w-7 h-7 rounded-full shadow-sm border-2 transition-transform cursor-pointer ${
                    data.colorTheme === theme.id ? 'border-slate-900 scale-110 ring-2 ring-[#F5C42E]' : 'border-white hover:scale-110'
                  }`}
                  style={{ backgroundColor: theme.id }}
                  title={theme.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-[#1a1f4b]">
                <Layers className="w-3.5 h-3.5 text-[#1a1f4b]" /> Slips per A4 Page
              </span>
              <span className="text-[11px] font-semibold text-slate-400">Select layout size</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onChange({ slipSize: '8' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  data.slipSize === '8' || data.slipSize === 'large'
                    ? 'border-[#1a1f4b] bg-amber-50/60 ring-2 ring-[#F5C42E]/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-black text-[#1a1f4b]">8 Slips / A4</span>
                  {(data.slipSize === '8' || data.slipSize === 'large') && (
                    <span className="w-2 h-2 rounded-full bg-[#1a1f4b]"></span>
                  )}
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium">Large Size • 4 × 2 Grid</p>
                <span className="text-[9.5px] text-amber-800 font-bold mt-1 bg-amber-100/70 px-1.5 py-0.5 rounded w-fit">Extra Spacious</span>
              </button>

              <button
                type="button"
                onClick={() => onChange({ slipSize: '10' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  data.slipSize === '10' || data.slipSize === 'medium' || data.slipSize === 'small'
                    ? 'border-[#1a1f4b] bg-amber-50/60 ring-2 ring-[#F5C42E]/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-black text-[#1a1f4b]">10 Slips / A4</span>
                  {(data.slipSize === '10' || data.slipSize === 'medium' || data.slipSize === 'small') && (
                    <span className="w-2 h-2 rounded-full bg-[#1a1f4b]"></span>
                  )}
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium">Standard • 5 × 2 Grid</p>
                <span className="text-[9.5px] text-indigo-800 font-bold mt-1 bg-indigo-100/70 px-1.5 py-0.5 rounded w-fit">Most Popular</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BUSINESS EXCLUSIVE: Custom Template Upload & Gemini AI Harmonizer */}
        {/* ========================================================================= */}
        <section className={`space-y-4 p-5 rounded-2xl border transition-all ${
          isBusinessUser 
            ? 'bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white border-indigo-200/90 shadow-[0_2px_14px_rgba(99,102,241,0.08)]'
            : 'bg-gradient-to-br from-amber-50/40 via-slate-50/40 to-white border-amber-200/60 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#1a1f4b] font-black text-sm">
              <Crown className="w-4 h-4 text-amber-500" />
              <h3>Custom Template Background</h3>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isBusinessUser 
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                : 'bg-amber-100 text-amber-900 border border-amber-200'
            }`}>
              {isBusinessUser ? <CheckCircle2 className="w-3 h-3 text-indigo-600" /> : <Lock className="w-3 h-3 text-amber-700" />}
              <span>Business Plan</span>
            </span>
          </div>

          {!isBusinessUser ? (
            /* Locked State for Non-Business Plan Users */
            <div className="bg-white/90 border border-amber-200/90 rounded-xl p-4 flex flex-col gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1a1f4b]">Unlock Custom Template Uploads</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Upgrade to the Business Plan (₹100 for 100 sheets) to upload custom background templates with automated Gemini AI theme adaptation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onUpgradeBusiness}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-extrabold text-xs shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Upgrade to Business Plan</span>
              </button>
            </div>
          ) : (
            /* Unlocked State for Business Plan Users */
            <div className="space-y-3">
              <div
                onClick={() => templateBgInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white/80 hover:bg-indigo-50/30 rounded-xl p-4 text-center cursor-pointer transition-all group"
              >
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[#1a1f4b]">Click to upload background template</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">PNG, JPG, WEBP • Auto-harmonized with Gemini</p>
              </div>

              <input
                type="file"
                ref={templateBgInputRef}
                onChange={handleTemplateBgUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Gemini Harmonization Status / Trigger */}
              {data.aiBackgroundUrl && (
                <div className="space-y-3 pt-1">
                  {/* Background preview thumbnail */}
                  <div className="relative w-full h-20 rounded-xl overflow-hidden border border-indigo-200 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.aiBackgroundUrl} alt="Background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between p-2">
                      <span className="text-[11px] text-white font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Background Ready
                      </span>
                      <button
                        type="button"
                        onClick={removeAiBackground}
                        className="text-white/80 hover:text-rose-300 transition-colors cursor-pointer p-0.5"
                        title="Remove background"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-indigo-100 pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="text-xs font-extrabold text-[#1a1f4b]">✨ AI Name Slip Composer</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mb-2.5 leading-relaxed">
                      Gemini will blend your background, student photo, and details into a single high-quality name slip image.
                    </p>

                    {/* Style Prompt */}
                    <div className="mb-2.5">
                      <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                        Style / Mood Instructions (optional)
                      </label>
                      <textarea
                        rows={2}
                        value={data.stylePrompt}
                        onChange={(e) => onChange({ stylePrompt: e.target.value })}
                        placeholder="e.g. Make it dark and cosmic, with glowing text. Vibrant neon accents..."
                        className="w-full px-3 py-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-400 outline-none transition-all text-slate-800 text-[11px] bg-white font-medium resize-none"
                        disabled={composing}
                      />
                    </div>

                    {/* Compose button row */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={composing}
                        onClick={composeWithGemini}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                      >
                        {composing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Composing with Gemini...</span>
                          </>
                        ) : (
                          <>
                            <ImagePlus className="w-3.5 h-3.5" />
                            <span>{data.composedSlipUrl ? 'Re-compose Slip' : 'Compose Name Slip with AI'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => analyzeBackgroundWithGemini(data.aiBackgroundUrl!)}
                        disabled={analyzingTheme || composing}
                        title="Re-analyze theme colors"
                        className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {analyzingTheme ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Compose success state */}
                  {composeSuccess && data.composedSlipUrl && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Name Slip Composed!</span>
                        </div>
                        <button
                          type="button"
                          onClick={clearComposedSlip}
                          className="text-[10px] font-bold text-slate-500 hover:text-rose-500 bg-white border border-slate-200 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Use HTML Layout
                        </button>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={data.composedSlipUrl}
                        alt="Composed Name Slip"
                        className="w-full rounded-lg border border-emerald-200 shadow-sm"
                      />
                      <p className="text-[10.5px] text-emerald-700 font-medium">
                        Preview above tiles across all slips on the A4 sheet. Click Re-compose to regenerate.
                      </p>
                    </div>
                  )}

                  {/* Compose error */}
                  {composeError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-rose-700 block">Composition failed</span>
                        <span className="text-rose-600 font-medium">{composeError}</span>
                        <p className="text-rose-500 mt-0.5">Your HTML overlay layout is still showing in the preview.</p>
                      </div>
                    </div>
                  )}

                  {/* Theme harmonize status */}
                  {themeAnalysisSuccess && !composeSuccess && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 text-xs flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                      <span className="text-indigo-700 font-medium">{themeAnalysisSuccess.description} — theme harmonized</span>
                    </div>
                  )}
                  {themeAnalysisError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-700 font-semibold">
                      {themeAnalysisError}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>


        {/* AI Background Generator */}
        <section className="space-y-4 bg-gradient-to-br from-amber-50/80 via-yellow-50/30 to-white p-5 rounded-2xl border border-amber-200/80 shadow-[0_2px_12px_rgba(245,196,46,0.08)]">
          <div className="flex items-center gap-2 text-[#1a1f4b] font-extrabold text-sm mb-1">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <h3>AI Magic Background Generator</h3>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-amber-900/80 font-medium">
              Create a custom name slip background pattern using AI prompts!
            </p>

            {/* Note: Shown only when user is currently using a premium layout */}
            {(data.template === 'unicorn' || data.template === 'doodle') && (
              <div className="bg-amber-100/60 border border-amber-200/90 rounded-xl p-2.5 flex items-start gap-2 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-950 font-medium leading-snug">
                  <span className="font-extrabold text-[#1a1f4b]">Please note:</span> You are currently using a Premium theme ({data.template === 'unicorn' ? 'Rainbow Unicorn' : 'Rainbow Doodles'}). AI backgrounds apply to <strong>Standard Layouts</strong> (Classic, Modern, Playful) or Business Templates. Generating a background will adapt it to a standard layout.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. cute pastel space, watercolor flowers, anime ninja..."
                className="w-full px-3.5 py-2.5 border border-amber-200/90 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/50 focus:border-[#1a1f4b] outline-none transition-all text-slate-800 text-xs bg-white font-medium"
                disabled={aiLoading}
              />

              {aiError && (
                <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-100">{aiError}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => generateAiBackground()}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="flex-1 bg-[#1a1f4b] hover:bg-[#2d3278] disabled:bg-slate-300 text-white text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all flex justify-center items-center gap-1.5 shadow-sm cursor-pointer disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#F5C42E]" /> Generate Background
                    </>
                  )}
                </button>

                {data.aiBackgroundUrl && (
                  <button
                    onClick={removeAiBackground}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {data.aiBackgroundUrl && (
              <div className="relative w-full h-16 rounded-xl overflow-hidden border border-amber-200 shadow-inner mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.aiBackgroundUrl} alt="Active Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <span className="text-[11px] text-white font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active Background
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Spacer for bottom */}
        <div className="h-6"></div>
      </div>
    </>
  );
}
