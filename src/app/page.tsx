"use client";

import { useState } from "react";
import { SlipData, defaultSlipData } from "@/types";
import GeneratorForm from "@/components/GeneratorForm";
import SlipPreview from "@/components/SlipPreview";
import { exportToPdf } from "@/utils/exportPdf";

export default function Home() {
  const [data, setData] = useState<SlipData>(defaultSlipData);

  const handleDataChange = (updates: Partial<SlipData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handlePrint = async () => {
    try {
      await exportToPdf("print-container", `${data.studentName.replace(/\s+/g, '-').toLowerCase()}-slips.pdf`);
    } catch (error) {
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="font-bold text-xl text-slate-800">SchoolSlip</span>
          </div>
          <nav className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect width="12" height="8" x="6" y="14"></rect></svg>
              Export PDF
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar - Form */}
        <aside className="w-full lg:w-[400px] xl:w-[450px] bg-white border-r border-slate-200 overflow-y-auto h-[calc(100vh-64px)]">
          <GeneratorForm data={data} onChange={handleDataChange} />
        </aside>

        {/* Right Area - Preview */}
        <section className="flex-grow bg-slate-50/50 overflow-y-auto h-[calc(100vh-64px)] relative p-6 lg:p-10">
          <SlipPreview data={data} />
        </section>
      </main>
    </div>
  );
}
