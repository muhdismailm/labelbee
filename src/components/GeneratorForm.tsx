"use client";

import { SlipData } from "@/types";
import {
  User,
  Image as ImageIcon,
  Settings,
  Palette,
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
  AlertCircle,
  Pipette
} from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";

interface Props {
  data: SlipData;
  onChange: (updates: Partial<SlipData>) => void;
  userPlan?: 'free' | 'starter' | 'popular' | 'premium' | 'business';
  onUpgradePremium?: () => void;
  onUpgradeBusiness?: () => void;
}

const THEMES = [
  { id: '#ffffff', name: 'White' },
  { id: '#3b82f6', name: 'Blue' },
  { id: '#10b981', name: 'Emerald' },
  { id: '#f59e0b', name: 'Amber' },
  { id: '#f43f5e', name: 'Rose' },
  { id: '#14b8a6', name: 'Teal' },
  { id: '#1e293b', name: 'Slate' },
];

export default function GeneratorForm({
  data,
  onChange,
  userPlan = 'free',
  onUpgradePremium,
  onUpgradeBusiness
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateBgInputRef = useRef<HTMLInputElement>(null);

  const isPremiumUser = userPlan === 'premium' || userPlan === 'business';
  const handleUpgrade = onUpgradePremium || onUpgradeBusiness;

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Gemini AI Slip Composer State
  const [composing, setComposing] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [composeSuccess, setComposeSuccess] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({ photoUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle custom background image upload (Available to ALL users)
  const handleTemplateBgUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        const updates: Partial<SlipData> = { aiBackgroundUrl: base64Url };
        if (data.template === 'unicorn' || data.template === 'doodle') {
          updates.template = 'modern';
        }
        onChange(updates);
      }
    };
    reader.readAsDataURL(file);
    if (templateBgInputRef.current) templateBgInputRef.current.value = '';
  };

  // Call API route to generate background via AI (Premium Plan)
  const generateAiBackground = async (promptOverride?: string) => {
    const activePrompt = (promptOverride || aiPrompt).trim();
    if (!activePrompt) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: activePrompt }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to generate image.");

      const updates: Partial<SlipData> = {
        aiBackgroundUrl: result.imageUrl,
      };

      if (data.template === 'unicorn' || data.template === 'doodle') {
        updates.template = 'modern';
      }

      onChange(updates);
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
    setComposeError(null);
    setComposeSuccess(false);
  };

  const clearComposedSlip = () => {
    onChange({ composedSlipUrl: null });
    setComposeError(null);
    setComposeSuccess(false);
  };

  // Main Premium Plan AI Slip Composer
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
      if (!res.ok) throw new Error(result.error || "Gemini composition failed.");

      if (result.composedSlipUrl) {
        onChange({ composedSlipUrl: result.composedSlipUrl });
        setComposeSuccess(true);
      }
    } catch (err: unknown) {
      const error = err as Error;
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

        {/* Student Information */}
        <section className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-[#1a1f4b] font-bold text-sm">
              <User className="w-4 h-4 text-[#1a1f4b]" />
              <h3>Student Information</h3>
            </div>
            <span className="text-[10.5px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {(data.slipSize === '8' || data.slipSize === 'large') ? '8 Slips / Sheet' : '10 Slips / Sheet'}
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">1. Student Full Name</label>
              <input
                type="text" name="studentName" value={data.studentName} onChange={handleInputChange}
                placeholder="e.g. John Doe"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/40 focus:border-[#1a1f4b] outline-none transition-all text-slate-800 text-sm font-medium"
              />
            </div>

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
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${data.subjectMode === 'blank'
                      ? 'bg-[#1a1f4b] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <PenTool className="w-3 h-3" />
                    <span>Blank (Handwritten)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const count = (data.slipSize === '8' || data.slipSize === 'large') ? 8 : 10;
                      const initial = Array.from({ length: count }, (_, i) => data.subjects?.[i] || "");
                      onChange({ subjectMode: 'custom', subjects: initial });
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${data.subjectMode === 'custom'
                      ? 'bg-[#1a1f4b] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Typed Per-Slip</span>
                  </button>
                </div>
              </div>

              {data.subjectMode === 'blank' ? (
                <div>
                  <input
                    type="text"
                    name="subject"
                    value={data.subject}
                    onChange={handleInputChange}
                    placeholder="Optional fixed default subject (or leave empty for blank line)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:ring-1 focus:ring-[#F5C42E] outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-600">
                      Customize subjects for each slip on the sheet:
                    </p>
                    <span className="text-[10px] font-extrabold text-[#1a1f4b] bg-amber-100/80 px-2 py-0.5 rounded-md">
                      {(data.slipSize === '8' || data.slipSize === 'large') ? '8 Individual Slips' : '10 Individual Slips'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: (data.slipSize === '8' || data.slipSize === 'large') ? 8 : 10 }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
                        <span className="text-[10.5px] font-black text-[#1a1f4b] w-4 shrink-0">#{idx + 1}</span>
                        <input
                          type="text"
                          value={data.subjects?.[idx] ?? ""}
                          onChange={(e) => {
                            const total = (data.slipSize === '8' || data.slipSize === 'large') ? 8 : 10;
                            const next = Array.from({ length: total }, (_, i) => data.subjects?.[i] || "");
                            next[idx] = e.target.value;
                            onChange({ subjects: next });
                          }}
                          placeholder={['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer', 'Language', 'General Knowledge', 'Art & Craft', 'EVS'][idx] || `Subject ${idx + 1}`}
                          className="w-full text-xs font-medium text-slate-800 placeholder-slate-300 outline-none bg-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">3. Class</label>
                <input
                  type="text" name="grade" value={data.grade} onChange={handleInputChange}
                  placeholder="e.g. 5th Standard"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/40 focus:border-[#1a1f4b] outline-none transition-all text-slate-800 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">4. Section</label>
                <input
                  type="text" name="section" value={data.section} onChange={handleInputChange}
                  placeholder="e.g. A"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/40 focus:border-[#1a1f4b] outline-none transition-all text-slate-800 text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">5. Roll No</label>
                <input
                  type="text" name="rollNo" value={data.rollNo} onChange={handleInputChange}
                  placeholder="e.g. 24"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/40 focus:border-[#1a1f4b] outline-none transition-all text-slate-800 text-sm font-medium"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">6. School Name</label>
                <input
                  type="text" name="schoolName" value={data.schoolName} onChange={handleInputChange}
                  placeholder="e.g. Green Valley School"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/40 focus:border-[#1a1f4b] outline-none transition-all text-slate-800 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Photo Upload & Positioning */}
        <section className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-[#1a1f4b] font-bold text-sm">
              <ImageIcon className="w-4 h-4 text-[#1a1f4b]" />
              <h3>Student Photo & Frame</h3>
            </div>
            {data.photoUrl && (
              <button
                type="button"
                onClick={() => onChange({ photoUrl: null })}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
              >
                Remove Photo
              </button>
            )}
          </div>

          {data.photoUrl ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                <div
                  className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-200 shrink-0 relative cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to replace photo"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.photoUrl}
                    alt="Uploaded"
                    className="w-full h-full object-cover transition-transform"
                    style={{
                      transform: `scale(${data.photoZoom / 100}) rotate(${data.photoTilt}deg) translate(${data.photoX}px, ${data.photoY}px)`,
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">Photo uploaded</p>
                  <p className="text-[11px] text-slate-400 mb-2">Adjust zoom, tilt and frame below</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-extrabold text-[#1a1f4b] hover:text-[#F5C42E] transition-colors cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                  >
                    Change Image
                  </button>
                </div>
              </div>

              {/* Adjusters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200/60">
                <div className="sm:col-span-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5 text-indigo-600" /> Photo Frame Size</span>
                    <span className="font-bold text-[#1a1f4b]">{data.photoFrameSize}px</span>
                  </div>
                  <input
                    type="range"
                    value={data.photoFrameSize}
                    min={40}
                    max={100}
                    onChange={(e) => onChange({ photoFrameSize: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5 text-indigo-600" /> Zoom</span>
                    <span className="font-bold text-[#1a1f4b]">{data.photoZoom}%</span>
                  </div>
                  <input
                    type="range"
                    value={data.photoZoom}
                    min={100}
                    max={300}
                    onChange={(e) => onChange({ photoZoom: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><RotateCw className="w-3.5 h-3.5 text-indigo-600" /> Tilt</span>
                    <span className="font-bold text-[#1a1f4b]">{data.photoTilt}°</span>
                  </div>
                  <input
                    type="range"
                    value={data.photoTilt}
                    min={-45}
                    max={45}
                    onChange={(e) => onChange({ photoTilt: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 rounded-xl p-6 text-center cursor-pointer transition-all"
            >
              <ImageIcon className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">Click to upload student photo</p>
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
        </section>

        {/* Layout & Theme */}
        <section className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-[#1a1f4b] font-bold text-sm">
            <Settings className="w-4 h-4 text-[#1a1f4b]" />
            <h3>Layout & Theme</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Preset Design Themes</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'unicorn', name: 'Rainbow Unicorn', badge: 'Popular' },
                { id: 'classic', name: 'Classic Certificate', badge: 'Playful' },
                { id: 'space', name: 'Space Explorer', badge: null },
                { id: 'doodle', name: 'Rainbow Doodles', badge: null },
                { id: 'playful', name: 'Comic & Superhero', badge: null },
                { id: 'modern', name: 'Modern Geometric', badge: null },

              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChange({ template: t.id as SlipData['template'] })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${data.template === t.id
                    ? 'border-[#1a1f4b] bg-amber-50/60 ring-2 ring-[#F5C42E]/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                >
                  <span className="text-xs font-black text-[#1a1f4b]">{t.name}</span>
                  {t.badge && (
                    <span className="text-[9px] font-extrabold bg-[#1a1f4b] text-white px-1.5 py-0.5 rounded">
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                <span>Accent Color</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                {data.colorTheme}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onChange({ colorTheme: theme.id })}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer relative shadow-2xs border border-slate-300/80 ${data.colorTheme?.toLowerCase() === theme.id.toLowerCase()
                    ? 'scale-115 ring-2 ring-offset-2 ring-[#1a1f4b]'
                    : 'hover:scale-105'
                    }`}
                  style={{ backgroundColor: theme.id }}
                  title={theme.name}
                />
              ))}

              {/* Custom Variable Color Picker */}
              <label
                title="Custom color picker"
                className={`relative w-7 h-7 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-105 shadow-2xs border border-slate-300 overflow-hidden ${!THEMES.some((t) => t.id.toLowerCase() === data.colorTheme?.toLowerCase())
                  ? 'scale-115 ring-2 ring-offset-2 ring-[#1a1f4b]'
                  : ''
                  }`}
                style={{
                  background: !THEMES.some((t) => t.id.toLowerCase() === data.colorTheme?.toLowerCase())
                    ? data.colorTheme
                    : 'conic-gradient(from 180deg, #f43f5e, #f59e0b, #10b981, #06b6d4, #3b82f6, #8b5cf6, #f43f5e)',
                }}
              >
                <input
                  type="color"
                  value={data.colorTheme?.startsWith('#') && data.colorTheme.length === 7 ? data.colorTheme : '#ffffff'}
                  onChange={(e) => onChange({ colorTheme: e.target.value })}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer pointer-events-auto"
                />
                <Pipette
                  className={`w-3.5 h-3.5 pointer-events-none drop-shadow-sm ${!THEMES.some((t) => t.id.toLowerCase() === data.colorTheme?.toLowerCase())
                    ? 'text-white'
                    : 'text-slate-800'
                    }`}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              A4 Sheet Layout (Slips Per Sheet)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChange({ slipSize: '8' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${data.slipSize === '8' || data.slipSize === 'large'
                  ? 'border-[#1a1f4b] bg-amber-50/60 ring-2 ring-[#F5C42E]/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-black text-[#1a1f4b]">8 Slips / A4</span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium">Large Size • 4 × 2 Grid</p>
              </button>

              <button
                type="button"
                onClick={() => onChange({ slipSize: '10' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${data.slipSize === '10' || data.slipSize === 'medium' || data.slipSize === 'small'
                  ? 'border-[#1a1f4b] bg-amber-50/60 ring-2 ring-[#F5C42E]/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-black text-[#1a1f4b]">10 Slips / A4</span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium">Standard • 5 × 2 Grid</p>
              </button>
            </div>
          </div>
        </section>

        {/* CUSTOM BACKGROUND UPLOAD */}
        <section className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#1a1f4b] font-black text-sm">
              <Upload className="w-4 h-4 text-indigo-600" />
              <h3>Upload Custom Background</h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              All Plans
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Upload your school artwork, brand banner, or favorite illustration to use as the background across all name slips on the sheet.
          </p>

          <div
            onClick={() => templateBgInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30 rounded-xl p-4 text-center cursor-pointer transition-all group"
          >
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-[#1a1f4b]">Click to upload background template</p>
            <p className="text-[10.5px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
          </div>

          <input
            type="file"
            ref={templateBgInputRef}
            onChange={handleTemplateBgUpload}
            accept="image/*"
            className="hidden"
          />

          {data.aiBackgroundUrl && (
            <div className="space-y-3 pt-1">
              <div className="relative w-full h-20 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.aiBackgroundUrl} alt="Active Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between p-2">
                  <span className="text-[11px] text-white font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active Background
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

              {/* Appropriate Template Layouts for Background Upload */}
              <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-[11.5px] font-extrabold text-[#1a1f4b] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Select Background Template Layout</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'playful', name: 'Comic & Superhero', desc: 'Dynamic comic burst badges & bold cards', icon: '💥' },
                    { id: 'modern', name: 'Modern Geometric', desc: 'Sleek angled header & sports/racing card', icon: '📐' },
                    { id: 'classic', name: 'Classic Certificate', desc: 'Formal double border & academic crest', icon: '📜' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onChange({ template: t.id as SlipData['template'] })}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${data.template === t.id
                        ? 'border-[#1a1f4b] bg-white ring-2 ring-[#F5C42E]/50 shadow-xs'
                        : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{t.icon}</span>
                        <div>
                          <div className="text-xs font-black text-[#1a1f4b]">{t.name}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{t.desc}</div>
                        </div>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${data.template === t.id ? 'border-[#1a1f4b] bg-[#1a1f4b]' : 'border-slate-300'
                        }`}>
                        {data.template === t.id && <div className="w-1.5 h-1.5 rounded-full bg-[#F5C42E]"></div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* PREMIUM PLAN EXCLUSIVE */}
        <section className={`space-y-4 p-5 rounded-2xl border transition-all ${isPremiumUser
          ? 'bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white border-indigo-200/90 shadow-[0_2px_14px_rgba(99,102,241,0.08)]'
          : 'bg-gradient-to-br from-amber-50/40 via-yellow-50/20 to-white border-amber-200/70 shadow-sm'
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#1a1f4b] font-black text-sm">
              <Crown className="w-4 h-4 text-amber-500" />
              <h3>Premium AI Suite</h3>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${isPremiumUser
              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}>
              {isPremiumUser ? <CheckCircle2 className="w-3 h-3 text-indigo-600" /> : <Lock className="w-3 h-3 text-amber-700" />}
              <span>Premium Plan</span>
            </span>
          </div>

          {!isPremiumUser ? (
            <div className="bg-white/90 border border-amber-200/90 rounded-xl p-4 flex flex-col gap-3.5 shadow-xs">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#1a1f4b]">Unlock Full AI Generation & Composition</h4>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Upgrade to the <strong className="text-amber-800">Premium Plan (₹100 for 100 sheets)</strong> to unlock our complete AI creative suite:
                </p>
                <ul className="text-[11px] text-slate-600 space-y-1.5 pl-1">
                  <li className="flex items-center gap-1.5 font-semibold text-[#1a1f4b]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>AI Magic Background Generator (Prompt-based)</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-semibold text-[#1a1f4b]">
                    <Zap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Gemini AI Name Slip Composer (Generative synthesis)</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleUpgrade}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-extrabold text-xs shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Upgrade to Premium Plan</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Feature 1: AI Background Generator */}
              <div className="bg-white/90 p-4 rounded-xl border border-indigo-100 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#1a1f4b]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <h4>AI Magic Background Generator</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Type any theme to generate a custom background pattern sized for name slips:
                </p>

                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. cute pastel galaxy astronaut, watercolor sakura blossoms..."
                    className="w-full px-3.5 py-2.5 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-400 outline-none transition-all text-slate-800 text-xs bg-white font-medium"
                    disabled={aiLoading}
                  />

                  {aiError && (
                    <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-100">{aiError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => generateAiBackground()}
                      disabled={aiLoading || !aiPrompt.trim()}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 text-white text-xs font-extrabold py-2.5 px-3.5 rounded-xl transition-all flex justify-center items-center gap-1.5 shadow-sm cursor-pointer disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating Background...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#F5C42E]" /> Generate AI Background
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
              </div>

              {/* Feature 2: Gemini AI Name Slip Composer */}
              {data.aiBackgroundUrl && (
                <div className="bg-white/90 p-4 rounded-xl border border-indigo-100 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="text-xs font-black text-[#1a1f4b]">Gemini AI Name Slip Composer</span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Optionally blend background, photo, and student typography into a unified generative image:
                  </p>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                      Style / Mood Instructions (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={data.stylePrompt}
                      onChange={(e) => onChange({ stylePrompt: e.target.value })}
                      placeholder="e.g. Make it dark and cosmic with glowing text. Ultra-vibrant colors..."
                      className="w-full px-3 py-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300/50 focus:border-indigo-400 outline-none transition-all text-slate-800 text-[11px] bg-white font-medium resize-none"
                      disabled={composing}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={composing}
                    onClick={composeWithGemini}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {composing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Composing with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>{data.composedSlipUrl ? 'Re-compose Slip with AI' : 'Compose Name Slip with AI'}</span>
                      </>
                    )}
                  </button>

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
                    </div>
                  )}

                  {composeError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-rose-700 block">Composition failed</span>
                        <span className="text-rose-600 font-medium">{composeError}</span>
                        <p className="text-rose-500 mt-0.5">Your HTML overlay layout is still active in the preview.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Spacer for bottom */}
        <div className="h-6"></div>
      </div>
    </>
  );
}
