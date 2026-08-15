"use client";

import { SlipData } from "@/types";
import { User, Image as ImageIcon, Settings, Palette, Grid3X3, Layers, Sparkles, Loader2, BookOpen, Move, RotateCw, ZoomIn, Maximize2 } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";

interface Props {
  data: SlipData;
  onChange: (updates: Partial<SlipData>) => void;
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

export default function GeneratorForm({ data, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      // Save directly to photoUrl and reset alignment offsets
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

  // Call API route to generate background via Stable Diffusion / Pollinations
  const generateAiBackground = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to generate image.");
      }

      onChange({ aiBackgroundUrl: result.imageUrl });
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error(err);
      setAiError(err.message || "An error occurred generating AI background.");
    } finally {
      setAiLoading(false);
    }
  };

  const removeAiBackground = () => {
    onChange({ aiBackgroundUrl: null });
    setAiPrompt("");
  };

  return (
    <>
      <div className="p-6 space-y-7">
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5C42E]"></span>
            <h2 className="text-2xl font-black text-[#1a1f4b] tracking-tight">Design Settings</h2>
          </div>
          <p className="text-slate-500 text-xs font-medium mt-1">Customize student information, layout & background</p>
        </div>

        {/* AI Background Generator */}
        <section className="space-y-4 bg-gradient-to-br from-amber-50/80 via-yellow-50/30 to-white p-5 rounded-2xl border border-amber-200/80 shadow-[0_2px_12px_rgba(245,196,46,0.08)]">
          <div className="flex items-center gap-2 text-[#1a1f4b] font-extrabold text-sm mb-1">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <h3>AI Magic Background</h3>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-amber-900/80 font-medium">
              Create a custom name slip background using AI prompts!
            </p>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. cute pastel space, watercolor flowers..."
                className="w-full px-3.5 py-2.5 border border-amber-200/90 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/50 focus:border-[#1a1f4b] outline-none transition-all text-slate-800 text-xs bg-white font-medium"
                disabled={aiLoading}
              />

              {aiError && (
                <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-100">{aiError}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={generateAiBackground}
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
                    Clear AI
                  </button>
                )}
              </div>
            </div>

            {data.aiBackgroundUrl && (
              <div className="relative w-full h-16 rounded-xl overflow-hidden border border-amber-200 shadow-inner mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.aiBackgroundUrl} alt="AI Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <span className="text-[11px] text-white font-bold">Active Background ✓</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Student & School Info */}
        <section className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
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
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      data.subjectMode === 'blank'
                        ? 'bg-[#1a1f4b] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ✏️ Blank (Handwritten)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ subjectMode: 'custom' })}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      data.subjectMode === 'custom'
                        ? 'bg-[#1a1f4b] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⌨️ Type per Slip
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

          {/* Design Selection Dropdown (Only classic, modern, playful, unicorn) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#1a1f4b]" /> Select Design Template
            </label>
            <select
              name="template"
              value={data.template}
              onChange={(e) => {
                const val = e.target.value as SlipData['template'];
                if (['classic', 'modern', 'playful', 'unicorn', 'doodle'].includes(val)) {
                  onChange({ template: val });
                } else {
                  onChange({ template: 'unicorn' });
                }
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F5C42E]/40 focus:border-[#1a1f4b] outline-none transition-all text-[#1a1f4b] bg-white font-bold text-xs cursor-pointer shadow-sm"
            >
              <optgroup label="Standard Layouts">
                <option value="classic">📜 Classic Bordered</option>
                <option value="modern">💼 Modern Accent</option>
                <option value="playful">🎈 Playful Rounded</option>
              </optgroup>
              <optgroup label="Premium Themes">
                <option value="unicorn">🦄 Rainbow Unicorn</option>
                <option value="doodle">🎨 Rainbow Doodles</option>
              </optgroup>
            </select>
          </div>

          {!data.aiBackgroundUrl && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Grid3X3 className="w-3.5 h-3.5 text-[#1a1f4b]" /> Background Pattern
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['none', 'dots', 'waves', 'grid', 'confetti'] as const).map((pat) => (
                  <button
                    key={pat}
                    onClick={() => onChange({ pattern: pat })}
                    className={`py-1.5 px-3 rounded-full border text-xs font-bold capitalize transition-all cursor-pointer ${
                      data.pattern === pat
                        ? 'border-[#1a1f4b] bg-[#1a1f4b] text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#1a1f4b]" /> Color Theme
            </label>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
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

        {/* Spacer for bottom */}
        <div className="h-6"></div>
      </div>
    </>
  );
}
