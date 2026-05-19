import Link from "next/link";
import { Sparkles, Building2, Users, ArrowRight, CheckCircle2, Paintbrush, Printer, Wand2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
              LB
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">LabelBee</span>
          </div>

          <div className="flex items-center gap-2">
            <a href="#features" className="hidden sm:flex text-slate-600 hover:text-slate-900 text-sm font-semibold px-4 py-2 transition-colors">
              Features
            </a>
            <Link href="/generator" className="hidden sm:flex text-slate-700 bg-slate-100 hover:bg-slate-200 text-sm font-semibold px-5 py-2.5 rounded-full transition-all">
              Login
            </Link>
            <Link href="/generator" className="bg-slate-900 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-md shadow-slate-200 flex items-center gap-2">
              Open Generator <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1200px] opacity-30 pointer-events-none z-0">
          <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-[15%] right-[20%] w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-[35%] w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4" /> Introducing AI Magic Backgrounds
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-4xl">
            Beautiful Name Slips, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500">Generated in Seconds.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
            The ultimate platform for <b>Schools</b> to generate bulk professional labels, and for <b>Parents</b> to create cute, personalized stickers for their kids.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/generator" className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group">
              Start Designing Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#audiences" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-lg font-bold px-8 py-4 rounded-xl transition-all shadow-sm flex items-center justify-center">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Dual Audience Section (B2B vs B2C) */}
      <section id="audiences" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Built for Everyone</h2>
            <p className="text-slate-500 mt-3 text-lg">Whether you are an institution or an individual, LabelBee scales to your needs.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

            {/* B2B Card */}
            <div id="schools" className="bg-slate-50 border border-slate-200 rounded-3xl p-8 relative overflow-hidden group hover:border-indigo-300 transition-colors">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Institution</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Streamline your administration by generating hundreds of standardized name slips at once. Maintain your school's brand identity effortlessly.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Bulk Auto-Layout generation for A4/Letter printing",
                  "Uniform branding with School Logos and custom color themes",
                  "Seamless commercial credit system for high-volume usage",
                  "Standardized, professional border designs (Classic & Modern)"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/generator" className="inline-flex font-bold text-blue-600 hover:text-blue-700 items-center gap-1 group-hover:gap-2 transition-all">
                Try School Templates <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* B2C Card */}
            <div id="parents" className="bg-slate-50 border border-slate-200 rounded-3xl p-8 relative overflow-hidden group hover:border-pink-300 transition-colors">
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Student </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Create adorable, personalized sticker labels for notebooks. Let your kids express themselves with AI-generated magical backgrounds.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Custom AI Image Generation (Type 'Unicorn in Space'!)",
                  "Vibrant Premium Themes like Rainbow Doodles & Space Explorer",
                  "Live photo uploading with drag-to-crop adjustments",
                  "Easy one-click download for home printing"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/generator" className="inline-flex font-bold text-pink-600 hover:text-pink-700 items-center gap-1 group-hover:gap-2 transition-all">
                Design Cute Slips <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section id="features" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Everything you need.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Powerful features packed into a remarkably simple interface.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-4">
                <Wand2 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">AI Magic Backgrounds</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Describe any scene you can imagine, and our integrated AI will generate a seamless, stunning background perfectly sized for your slips.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                <Printer className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Smart Auto-Layout</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                No more manual alignment. LabelBee automatically arranges up to 21 slips on a standard A4 canvas, perfectly spaced for cutting and peeling.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center mb-4">
                <Paintbrush className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Live Theming</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Instantly swap between premium templates, colors, and layout sizes. Watch the preview update in real-time as you tweak photo placements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-black text-slate-900 mb-6">Ready to start creating?</h2>
          <p className="text-slate-500 text-lg mb-10">Join schools and parents worldwide in creating the most beautiful notebook labels.</p>
          <Link href="/generator" className="inline-flex bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold px-10 py-5 rounded-2xl transition-all shadow-xl shadow-indigo-200 items-center justify-center gap-3 hover:-translate-y-1">
            Open LabelBee Generator <Sparkles className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              LB
            </div>
            <span className="font-bold text-slate-800">LabelBee</span>
          </div>
          <p className="text-sm font-semibold text-slate-400">
            © {new Date().getFullYear()} LabelBee. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
