"use client";

import { SlipData } from "@/types";
import { School, User, Image as ImageIcon, Settings, Palette, Grid3X3, Layers, Sparkles, Loader2, BookOpen, Move, RotateCw, ZoomIn, Maximize2 } from "lucide-react";
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
    } catch (err: any) {
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
      <div className="p-6 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Design Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Customize your name slips</p>
        </div>

        {/* AI Background Generator */}
        <section className="space-y-4 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <h3>AI Magic Background</h3>
          </div>
          
          <div className="space-y-3">
            <p className="text-xs text-indigo-700 font-medium">
              Create a custom background using AI instantly!
            </p>
            
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. pastel rainbow clouds, cute space pattern..."
                className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 text-sm bg-white"
                disabled={aiLoading}
              />
              
              {aiError && (
                <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg border border-red-100">{aiError}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={generateAiBackground}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex justify-center items-center gap-1.5 shadow-sm"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Generate Background
                    </>
                  )}
                </button>

                {data.aiBackgroundUrl && (
                  <button
                    onClick={removeAiBackground}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                  >
                    Clear AI
                  </button>
                )}
              </div>
            </div>
            
            {data.aiBackgroundUrl && (
              <div className="relative w-full h-16 rounded-lg overflow-hidden border border-indigo-200 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.aiBackgroundUrl} alt="AI Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-1.5">
                  <span className="text-[10px] text-white font-semibold">Active Background ✓</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* School Info */}
        <section className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
            <School className="w-5 h-5" />
            <h3>School Information</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
              <input 
                type="text" name="schoolName" value={data.schoolName} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motto / Tagline <span className="text-slate-400 font-normal">(optional)</span></label>
              <input 
                type="text" name="schoolMotto" value={data.schoolMotto} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
              <input 
                type="text" name="academicYear" value={data.academicYear} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
              />
            </div>
          </div>
        </section>

        {/* Student Info */}
        <section className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
            <User className="w-5 h-5" />
            <h3>Student Information</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" name="studentName" value={data.studentName} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-500" /> Subject
              </label>
              <input 
                type="text" name="subject" value={data.subject} onChange={handleInputChange}
                placeholder="e.g. Mathematics, Science, English..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class / Std</label>
                <input 
                  type="text" name="grade" value={data.grade} onChange={handleInputChange}
                  placeholder="e.g. V or Grade 5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sec / Div</label>
                <input 
                  type="text" name="section" value={data.section} onChange={handleInputChange}
                  placeholder="e.g. A"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Roll No.</label>
                <input 
                  type="text" name="rollNo" value={data.rollNo} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                <select 
                  name="bloodGroup" value={data.bloodGroup} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 bg-white"
                >
                  <option value="">None</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Upload & Alignments directly on nameslip */}
        <section className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
            <ImageIcon className="w-5 h-5" />
            <h3>Student Photo</h3>
          </div>
          
          {data.photoUrl ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.photoUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                  <span className="text-sm text-slate-600 font-medium">Photo Uploaded</span>
                </div>
                <button 
                  onClick={removePhoto}
                  className="text-red-500 text-xs font-semibold hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all"
                >
                  Remove
                </button>
              </div>

              {/* LIVE SLIDERS FOR NAMESLIP ADJUSTMENT */}
              <div className="bg-indigo-50/30 border border-indigo-100/50 p-4 rounded-xl space-y-4 shadow-sm">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">Live Nameslip Image Adjustments</span>
                
                {/* 0. Photo Frame Size */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                    <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-indigo-500" /> Photo Frame Size</span>
                    <span className="font-bold text-slate-700">{data.photoFrameSize}px</span>
                  </div>
                  <input
                    type="range"
                    value={data.photoFrameSize}
                    min={45}
                    max={95}
                    step={1}
                    onChange={(e) => onChange({ photoFrameSize: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* 1. Zoom Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                    <span className="flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5 text-indigo-500" /> Image Zoom</span>
                    <span className="font-bold text-slate-700">{data.photoZoom}%</span>
                  </div>
                  <input
                    type="range"
                    value={data.photoZoom}
                    min={100}
                    max={300}
                    step={1}
                    onChange={(e) => onChange({ photoZoom: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* 2. Tilt Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                    <span className="flex items-center gap-1"><RotateCw className="w-3.5 h-3.5 text-indigo-500" /> Image Tilt / Rotate</span>
                    <span className="font-bold text-slate-700">{data.photoTilt}°</span>
                  </div>
                  <input
                    type="range"
                    value={data.photoTilt}
                    min={-180}
                    max={180}
                    step={1}
                    onChange={(e) => onChange({ photoTilt: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* 3. Horizontal Pan Offset (photoX) */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                    <span className="flex items-center gap-1"><Move className="w-3.5 h-3.5 text-indigo-500" /> Move Horizontal</span>
                    <span className="font-bold text-slate-700">{data.photoX}px</span>
                  </div>
                  <input
                    type="range"
                    value={data.photoX}
                    min={-60}
                    max={60}
                    step={1}
                    onChange={(e) => onChange({ photoX: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* 4. Vertical Pan Offset (photoY) */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                    <span className="flex items-center gap-1"><Move className="w-3.5 h-3.5 text-indigo-500" /> Move Vertical</span>
                    <span className="font-bold text-slate-700">{data.photoY}px</span>
                  </div>
                  <input
                    type="range"
                    value={data.photoY}
                    min={-60}
                    max={60}
                    step={1}
                    onChange={(e) => onChange({ photoY: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="w-10 h-10 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-700">Click to upload photo</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          )}
          <input 
            type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden"
          />
        </section>

        {/* Styling & Layout */}
        <section className="space-y-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold">
            <Settings className="w-5 h-5" />
            <h3>Layout & Theme</h3>
          </div>

          {/* Design Selection Dropdown (Only classic, modern, playful, unicorn) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
               <Layers className="w-4 h-4" /> Select Design Template
            </label>
            <select
              name="template"
              value={data.template}
              onChange={(e) => {
                const val = e.target.value as any;
                // Enforce fallback if value is unsupported
                if (['classic', 'modern', 'playful', 'unicorn'].includes(val)) {
                  onChange({ template: val });
                } else {
                  onChange({ template: 'unicorn' });
                }
              }}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 bg-white font-semibold text-sm cursor-pointer shadow-sm"
            >
              <optgroup label="Standard Layouts">
                <option value="classic">📜 Classic Bordered</option>
                <option value="modern">💼 Modern Accent</option>
                <option value="playful">🎈 Playful Rounded</option>
              </optgroup>
              <optgroup label="Premium Themes">
                <option value="unicorn">🦄 Rainbow Unicorn</option>
              </optgroup>
            </select>
          </div>

          {!data.aiBackgroundUrl && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                 <Grid3X3 className="w-4 h-4" /> Background Pattern
              </label>
              <div className="flex flex-wrap gap-2">
                {(['none', 'dots', 'waves', 'grid', 'confetti'] as const).map((pat) => (
                  <button
                    key={pat}
                    onChange={() => {}} 
                    onClick={() => onChange({ pattern: pat })}
                    className={`py-1.5 px-3 rounded-full border text-xs font-medium capitalize transition-all ${
                      data.pattern === pat 
                        ? 'border-indigo-500 bg-indigo-500 text-white shadow-sm' 
                        : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Color Theme
            </label>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onChange({ colorTheme: theme.id })}
                  className={`w-8 h-8 rounded-full shadow-sm border-2 transition-transform ${
                    data.colorTheme === theme.id ? 'border-slate-800 scale-110' : 'border-white hover:scale-110'
                  }`}
                  style={{ backgroundColor: theme.id }}
                  title={theme.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
              Slip Size 
              <span className="text-xs font-normal text-slate-500">Determines slips per page</span>
            </label>
            <select 
              name="slipSize" value={data.slipSize} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 bg-white"
            >
              <option value="large">Large (~4 per page)</option>
              <option value="medium">Medium (~8 per page)</option>
              <option value="small">Small (~14 per page)</option>
            </select>
          </div>
        </section>

        {/* Spacer for bottom */}
        <div className="h-8"></div>
      </div>
    </>
  );
}
