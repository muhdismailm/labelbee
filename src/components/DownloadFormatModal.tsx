"use client";

import React from "react";

interface DownloadFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormat: (format: "pdf" | "png") => void;
  isLoading: boolean;
  loadingFormat: "pdf" | "png" | null;
  credits: number;
}

export default function DownloadFormatModal({
  isOpen,
  onClose,
  onSelectFormat,
  isLoading,
  loadingFormat,
  credits,
}: DownloadFormatModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-h-[95vh] overflow-y-auto max-w-md w-full shadow-2xl relative flex flex-col gap-4 animate-scale-up">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 p-2 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer z-10"
          aria-label="Close dialog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Modal Header */}
        <div className="text-left pr-8">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold uppercase tracking-wider border border-amber-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            1 Credit Required
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-[#1a1f4b] tracking-tight mt-2">
            Download A4 Sheet
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Choose your preferred export format before download starts.
          </p>
        </div>

        {/* Format Options Grid */}
        <div className="flex flex-col gap-3 my-1">
          {/* Option 1: PDF */}
          <button
            type="button"
            onClick={() => onSelectFormat("pdf")}
            disabled={isLoading}
            className={`group relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3.5 ${
              loadingFormat === "pdf"
                ? "border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-200"
                : "border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 hover:shadow-md active:scale-[0.99] bg-white"
            } ${isLoading && loadingFormat !== "pdf" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                📄
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#1a1f4b]">
                    Download as PDF
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold tracking-wide">
                    PDF
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Print-ready A4 document
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-1">
                  <span>Exact A4 (210×297mm)</span>
                  <span>•</span>
                  <span>Standard Printing</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center">
              {loadingFormat === "pdf" ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                  <svg
                    className="animate-spin h-4 w-4 text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="hidden sm:inline">Generating...</span>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </div>
              )}
            </div>
          </button>

          {/* Option 2: PNG */}
          <button
            type="button"
            onClick={() => onSelectFormat("png")}
            disabled={isLoading}
            className={`group relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3.5 ${
              loadingFormat === "png"
                ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200"
                : "border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 hover:shadow-md active:scale-[0.99] bg-white"
            } ${isLoading && loadingFormat !== "png" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                🖼️
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#1a1f4b]">
                    Download as PNG
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wide">
                    PNG
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  High-resolution A4 image
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-1">
                  <span>Exact A4 Sheet</span>
                  <span>•</span>
                  <span>Photo & Sticker Paper</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center">
              {loadingFormat === "png" ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <svg
                    className="animate-spin h-4 w-4 text-emerald-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="hidden sm:inline">Generating...</span>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Footer & Cancel Action */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
            <span>Current Balance:</span>
            <span className="font-extrabold text-[#1a1f4b]">
              {credits} {credits === 1 ? "Credit" : "Credits"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
