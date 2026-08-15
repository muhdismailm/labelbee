"use client";
import Link from "next/link";

/* ---- SVG Icons (inline, no extra dep) ---- */
function BeeIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="32" cy="36" rx="14" ry="18" fill="#F5C42E" />
      {/* Stripes */}
      <rect x="18" y="33" width="28" height="5" rx="2" fill="#1A1F4B" opacity="0.7" />
      <rect x="18" y="43" width="28" height="5" rx="2" fill="#1A1F4B" opacity="0.7" />
      {/* Head */}
      <circle cx="32" cy="18" r="10" fill="#F5C42E" />
      {/* Antennae */}
      <line x1="27" y1="10" x2="22" y2="4" stroke="#1A1F4B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="21" cy="3" r="2" fill="#1A1F4B" />
      <line x1="37" y1="10" x2="42" y2="4" stroke="#1A1F4B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="43" cy="3" r="2" fill="#1A1F4B" />
      {/* Eyes */}
      <circle cx="28" cy="19" r="2.5" fill="#1A1F4B" />
      <circle cx="36" cy="19" r="2.5" fill="#1A1F4B" />
      {/* Wings */}
      <ellipse cx="14" cy="28" rx="10" ry="7" fill="white" opacity="0.8" transform="rotate(-20 14 28)" />
      <ellipse cx="50" cy="28" rx="10" ry="7" fill="white" opacity="0.8" transform="rotate(20 50 28)" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DownloadIcon({ stroke = "#ef4444" }: { stroke?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F5C42E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F5C42E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F5C42E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F5C42E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function ArrowRight({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}


/* ---- Step connector dashes ---- */
function StepConnector() {
  return (
    <div className="hidden md:flex flex-1 items-center justify-center" style={{ paddingBottom: "36px" }}>
      <div style={{ borderTop: "2px dashed #d1d5db", flex: 1 }} />
    </div>
  );
}

/* ---- Name-slip hero card ---- */
function NameSlipCard() {
  return (
    <div
      className="animate-float-card"
      style={{
        background: "white",
        borderRadius: "18px",
        boxShadow: "0 20px 60px rgba(26,31,75,0.18)",
        padding: "0",
        width: "436px",
        maxWidth: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* A4 badge */}
      <div
        style={{
          position: "absolute",
          top: "-12px",
          right: "-12px",
          background: "#8b5cf6",
          color: "white",
          borderRadius: "50%",
          width: "72px",
          height: "72px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "11px",
          lineHeight: 1.3,
          zIndex: 10,
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(139,92,246,0.4)",
        }}
      >
        A4 Size<br />PDF
      </div>

      {/* Card background - Navy + yellow leaves */}
      <div
        style={{
          background: "linear-gradient(135deg, #f8f4e8 0%, #fff9e0 60%, #e8f0ff 100%)",
          padding: "24px 26px",
          display: "flex",
          alignItems: "center",
          gap: "22px",
          position: "relative",
        }}
      >
        {/* Decorative leaf blobs */}
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: "130px",
            height: "130px",
            background: "linear-gradient(135deg, #1a1f4b 0%, #2d3278 100%)",
            borderRadius: "50% 0 0 0",
            opacity: 0.08,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: "70px",
            width: "65px",
            height: "65px",
            background: "#F5C42E",
            borderRadius: "50%",
            opacity: 0.15,
          }}
        />

        {/* Photo circle */}
        <div
          style={{
            width: "92px",
            height: "92px",
            borderRadius: "50%",
            border: "4px solid white",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            overflow: "hidden",
            flexShrink: 0,
            background: "linear-gradient(135deg, #e8d5b7, #c4a882)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/student_portrait.jpg"
            alt="Student Photo"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, zIndex: 2 }}>
          <div style={{ fontWeight: 800, fontSize: "19px", color: "#1a1f4b", marginBottom: "10px" }}>
            Aarav Sharma
          </div>
          {[
            ["Class", "5th Standard"],
            ["Subject", "Mathematics"],
            ["School", "Green Valley School"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", gap: "8px", fontSize: "12.5px", marginBottom: "5px" }}>
              <span style={{ color: "#6b7280", fontWeight: 600, width: "56px" }}>{label}</span>
              <span style={{ color: "#374151", fontWeight: 500 }}>: {value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Upload card ---- */
function UploadCard() {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.09)",
        padding: "16px",
        width: "210px",
        flex: "1 1 200px",
      }}
    >
      <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#374151", marginBottom: "10px" }}>
        Upload Your Photo
      </div>
      <div
        style={{
          borderRadius: "10px",
          overflow: "hidden",
          height: "116px",
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #e5e7eb",
        }}
      >
        <img
          src="/student_portrait.jpg"
          alt="Uploaded portrait"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
        />
      </div>
    </div>
  );
}

/* ---- AI Backgrounds card ---- */
function BgCard() {
  const bgPositions = [
    { pos: "0% 0%", label: "Forest" },
    { pos: "100% 0%", label: "Ocean" },
    { pos: "0% 100%", label: "Blossom" },
    { pos: "100% 100%", label: "Night Sky" },
  ];
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.09)",
        padding: "16px",
        width: "210px",
        flex: "1 1 200px",
      }}
    >
      <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#374151", marginBottom: "10px" }}>
        AI Backgrounds
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        {bgPositions.map(({ pos, label }, i) => (
          <div
            key={i}
            title={label}
            style={{
              height: "55px",
              borderRadius: "8px",
              backgroundImage: "url(/ai_backgrounds_grid.jpg)",
              backgroundSize: "200% 200%",
              backgroundPosition: pos,
              border: "1px solid rgba(0,0,0,0.08)",
              transition: "transform 0.2s",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ================================================================ */
export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "'Inter', sans-serif" }}>

      {/* ========== NAVBAR ========== */}
      <nav
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #f0f0f0",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
            height: "68px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/logo.png"
              alt="LabelBee"
              style={{ height: "70px", width: "auto", objectFit: "contain" }}
            />
          </div>

          {/* Nav links */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: "32px" }}>
            {["Features", "How It Works", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="nav-link"
              >
                {item}
              </a>
            ))}
          </div>
          {/* CTA buttons */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <Link
              href="/generator"
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#1a1f4b",
                background: "#F5C42E",
                borderRadius: "50px",
                padding: "10px 24px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(245,196,46,0.4)",
                transition: "all 0.2s",
              }}
            >
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section
        style={{
          background: "linear-gradient(180deg, #fffdf5 0%, #ffffff 100%)",
          padding: "32px 24px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >


        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "36px",
            flexWrap: "wrap",
          }}
        >
          {/* ---- LEFT COLUMN ---- */}
          <div style={{ flex: "1 1 480px", minWidth: 0, paddingRight: "10px" }}>


            {/* Headline */}
            <h1
              className="animate-fade-up delay-100"
              style={{
                fontWeight: 900,
                fontSize: "clamp(38px, 4.8vw, 58px)",
                lineHeight: 1.12,
                color: "#1a1f4b",
                marginBottom: "6px",
              }}
            >
              Create Personalized<br />
              Name Slips
            </h1>
            <h1
              className="animate-fade-up delay-200"
              style={{
                fontWeight: 900,
                fontSize: "clamp(38px, 4.8vw, 58px)",
                lineHeight: 1.12,
                color: "#F5C42E",
                marginBottom: "16px",
                display: "block",
              }}
            >
              in Seconds
            </h1>

            {/* Sub-text */}
            <p
              className="animate-fade-up delay-300"
              style={{
                fontSize: "16.5px",
                color: "#4b5563",
                lineHeight: 1.7,
                maxWidth: "480px",
                marginBottom: "32px",
              }}
            >
              Upload your photo, choose an AI background, and generate stunning A4 size name slip sheets. Download your PDF instantly using{" "}
              <span style={{ color: "#F5C42E", fontWeight: 700 }}>LabelBee credits</span>.
            </p>

            {/* CTA buttons */}
            <div
              className="animate-fade-up delay-400"
              style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "20px" }}
            >
              <Link
                href="/generator"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#F5C42E",
                  color: "#1a1f4b",
                  fontWeight: 800,
                  fontSize: "16px",
                  padding: "14px 32px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(245,196,46,0.5)",
                  transition: "all 0.2s",
                }}
              >
                Get Started Now <ArrowRight size={17} />
              </Link>
            </div>


          </div>

          {/* ---- RIGHT COLUMN (UI mockup) ---- */}
          <div
            style={{
              flex: "1 1 450px",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              position: "relative",
              animation: "floatCard 3.5s ease-in-out infinite",
            }}
          >
            {/* Upload + AI Backgrounds side by side — top row */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                width: "100%",
                maxWidth: "436px",
                justifyContent: "center",
              }}
            >
              <UploadCard />
              <BgCard />
            </div>

            {/* Curved dashed arrow: hovering between BgCard and NameSlipCard with clear margins */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                overflow: "visible",
                pointerEvents: "none",
                zIndex: 5,
              }}
              viewBox="0 0 500 320"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Smooth curved line with generous gap from both cards */}
              <path
                className="arrow-march"
                d="M 450 102 C 494 102 494 224 458 224"
                stroke="#1a1f4b"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Animated arrowhead with wide margin from card */}
              <g className="arrow-tip">
                <polyline
                  points="468,217 458,224 468,231"
                  stroke="#1a1f4b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                >
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0 0; -3 0; 0 0"
                    keyTimes="0; 0.5; 1"
                    dur="0.9s"
                    repeatCount="indefinite"
                  />
                </polyline>
              </g>
            </svg>

            {/* Name Slip card — bottom (output) */}
            <div style={{ width: "100%", maxWidth: "436px", display: "flex", justifyContent: "center" }}>
              <NameSlipCard />
            </div>
          </div>
        </div>
      </section>



      {/* ========== HOW IT WORKS ========== */}
      <section
        id="how-it-works"
        style={{ background: "#ffffff", padding: "80px 24px 90px" }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>


          {/* Heading */}
          <h2
            style={{
              textAlign: "center",
              fontWeight: 900,
              fontSize: "clamp(28px, 4vw, 42px)",
              color: "#1a1f4b",
              marginBottom: "64px",
            }}
          >
            How <span style={{ color: "#F5C42E" }}>LabelBee</span> Works
          </h2>

          {/* Steps */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              {
                num: "1",
                icon: <UploadIcon />,
                bg: "#f0fdf4",
                border: "#86efac",
                title: "Upload Photo",
                sub: "Upload your photo and get started",
              },
              {
                num: "2",
                icon: <SparkleIcon />,
                bg: "#faf5ff",
                border: "#d8b4fe",
                title: "Choose AI Background",
                sub: "Select from beautiful AI-generated backgrounds",
              },
              {
                num: "3",
                icon: <EditIcon />,
                bg: "#eff6ff",
                border: "#93c5fd",
                title: "Customize",
                sub: "Add your details and personalize your slip",
              },
              {
                num: "4",
                icon: <DownloadIcon stroke="#ef4444" />,
                bg: "#fff1f2",
                border: "#fca5a5",
                title: "Download PDF",
                sub: "Generate A4 size sheet and download using credits",
              },
            ].map(({ num, icon, bg, border, title, sub }, i, arr) => (
              <div
                key={title}
                style={{ display: "contents" }}
              >
                {/* Step card */}
                <div
                  className="card-hover"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    width: "190px",
                    flexShrink: 0,
                    padding: "0 8px",
                  }}
                >
                  {/* Icon box with number badge */}
                  <div style={{ position: "relative", marginBottom: "16px" }}>
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "20px",
                        background: bg,
                        border: `2px solid ${border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {icon}
                    </div>
                    {/* Number badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-8px",
                        left: "-8px",
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        background: "#1a1f4b",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {num}
                    </div>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1f4b", marginBottom: "6px" }}>
                    {title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.5 }}>
                    {sub}
                  </div>
                </div>

                {/* Connector — only between steps */}
                {i < arr.length - 1 && <StepConnector />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section
        id="features"
        style={{
          background: "#fafafa",
          borderTop: "1px solid #f0f0f0",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>

            <h2
              style={{
                fontWeight: 900,
                fontSize: "clamp(26px, 4vw, 40px)",
                color: "#1a1f4b",
                marginBottom: "12px",
              }}
            >
              Everything you need in one place
            </h2>
            <p style={{ color: "#6b7280", fontSize: "15px", maxWidth: "500px", margin: "0 auto" }}>
              Powerful AI tools packed into a beautifully simple interface.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                emoji: "🪄",
                title: "AI Magic Backgrounds",
                desc: "Describe any scene — forests, space, underwater — and our AI generates a stunning background perfectly sized for your name slip.",
                accent: "#8b5cf6",
                bg: "#faf5ff",
              },
              {
                emoji: "🖨️",
                title: "Smart Auto-Layout",
                desc: "No more manual alignment. LabelBee auto-arranges up to 21 slips on an A4 canvas, perfectly spaced for cutting.",
                accent: "#22c55e",
                bg: "#f0fdf4",
              },
              {
                emoji: "🎨",
                title: "Live Theming",
                desc: "Swap themes, colors, and layout sizes instantly. Watch the preview update in real-time as you tweak everything.",
                accent: "#f59e0b",
                bg: "#fffbe6",
              },
            ].map(({ emoji, title, desc, accent, bg }) => (
              <div
                key={title}
                className="card-hover"
                style={{
                  background: "white",
                  border: "1.5px solid #f0f0f0",
                  borderRadius: "20px",
                  padding: "28px",
                  transition: "all 0.25s",
                }}
              >
                <div
                  style={{
                    width: "54px",
                    height: "54px",
                    borderRadius: "16px",
                    background: bg,
                    border: `1.5px solid ${accent}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    marginBottom: "18px",
                  }}
                >
                  {emoji}
                </div>
                <h3 style={{ fontWeight: 800, fontSize: "17px", color: "#1a1f4b", marginBottom: "10px" }}>
                  {title}
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section
        id="pricing"
        style={{
          background: "linear-gradient(180deg, #fffdf5 0%, #ffffff 100%)",
          borderTop: "1px solid #f0f0f0",
          padding: "64px 24px 72px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: "12px" }}>

            <h2
              style={{
                fontWeight: 900,
                fontSize: "clamp(26px, 3.8vw, 38px)",
                color: "#1a1f4b",
                marginBottom: "10px",
              }}
            >
              Buy credits,{" "}
              <span style={{ color: "#F5C42E" }}>use anytime</span>
            </h2>
            <p style={{ color: "#6b7280", fontSize: "14.5px", maxWidth: "480px", margin: "0 auto" }}>
              No subscriptions. No hidden fees. Purchase a credit pack and generate as many name slips as you need.
            </p>
          </div>

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
              gap: "24px",
              marginTop: "40px",
              alignItems: "stretch",
            }}
          >
            {[
              {
                name: "Starter Plan",
                emoji: "🌱",
                price: "₹15",
                priceNum: 15,
                credits: 5,
                unit: "₹3.0 / download",
                badge: null as string | null,
                accent: "#22c55e",
                accentBg: "#f0fdf4",
                borderColor: "#86efac",
                highlight: false,
                perks: [
                  "5 A4 PDF sheet downloads",
                  "All AI background themes",
                  "Auto-alignment & cut guides",
                  "Instant PDF download",
                  "Standard processing speed",
                ],
                cta: "Buy Starter",
              },
              {
                name: "Popular Plan",
                emoji: "🔥",
                price: "₹30",
                priceNum: 30,
                credits: 10,
                unit: "₹3.0 / download",
                badge: "Most Popular" as string | null,
                accent: "#6366f1",
                accentBg: "#eef2ff",
                borderColor: "#6366f1",
                highlight: true,
                perks: [
                  "10 A4 PDF sheet downloads",
                  "All AI backgrounds & themes",
                  "Auto-alignment & cut guides",
                  "Priority image generation",
                  "Live preview & adjustments",
                ],
                cta: "Buy Popular",
              },
              {
                name: "Business Plan",
                emoji: "⚡",
                price: "₹100",
                priceNum: 100,
                credits: 100,
                unit: "₹1.0 / download (Mega Deal)",
                badge: "Mega Deal · ₹1/sheet" as string | null,
                accent: "#f59e0b",
                accentBg: "#fffbe6",
                borderColor: "#fcd34d",
                highlight: false,
                perks: [
                  "100 A4 PDF sheet downloads",
                  "Mega value: ₹1.00 / sheet",
                  "Commercial & school use",
                  "High-priority processing",
                  "Bulk sheet export support",
                ],
                cta: "Buy Business",
              },
            ].map(({ name, price, credits, unit, badge, accent, accentBg, borderColor, highlight, perks, cta }) => (
              <div
                key={name}
                style={{
                  background: highlight ? "#312e81" : "white",
                  border: "2px solid " + (highlight ? "#6366f1" : borderColor),
                  borderRadius: "22px",
                  padding: "28px 24px",
                  position: "relative",
                  boxShadow: highlight
                    ? "0 20px 50px rgba(99,102,241,0.25), 0 4px 20px rgba(49,46,129,0.18)"
                    : "0 4px 20px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.25s",
                }}
              >
                {/* Badge */}
                {badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-13px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: highlight ? "#6366f1" : accent,
                      color: "white",
                      fontWeight: 800,
                      fontSize: "10.5px",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      borderRadius: "50px",
                      padding: "4px 16px",
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 12px " + accent + "55",
                    }}
                  >
                    {badge}
                  </div>
                )}

                {/* Top Details */}
                <div>
                  {/* Plan header */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontWeight: 800, fontSize: "19px", color: highlight ? "white" : "#1a1f4b", marginBottom: "3px" }}>
                      {name}
                    </div>
                    <div style={{ fontSize: "12px", color: highlight ? "#94a3b8" : "#9ca3af", fontWeight: 500 }}>
                      {credits} credits
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
                      <span
                        style={{
                          fontWeight: 900,
                          fontSize: "42px",
                          lineHeight: 1,
                          color: highlight ? "#a5b4fc" : accent,
                        }}
                      >
                        {price}
                      </span>
                      <span style={{ fontSize: "13px", color: highlight ? "#94a3b8" : "#9ca3af", marginBottom: "6px", fontWeight: 500 }}>
                        one-time
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: highlight ? "#cbd5e1" : "#6b7280", marginTop: "4px", fontWeight: 500 }}>
                      ≈ {unit}
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: "1px",
                      background: highlight ? "rgba(255,255,255,0.10)" : "#f0f0f0",
                      marginBottom: "20px",
                    }}
                  />

                  {/* Perks */}
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {perks.map((perk) => (
                      <li key={perk} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            background: highlight ? "rgba(99,102,241,0.20)" : accentBg,
                            border: "1px solid " + (highlight ? "#6366f166" : accent + "55"),
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={highlight ? "#a5b4fc" : accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span style={{ fontSize: "13px", color: highlight ? "#e2e8f0" : "#374151", fontWeight: 500 }}>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <a
                  href="/generator"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "12px 0",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "14px",
                    textDecoration: "none",
                    background: highlight ? "#6366f1" : "transparent",
                    color: highlight ? "white" : accent,
                    border: highlight ? "none" : "2px solid " + accent,
                    boxShadow: highlight ? "0 6px 18px rgba(99,102,241,0.40)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {cta} <ArrowRight size={15} />
                </a>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", marginTop: "32px", fontWeight: 500 }}>
            🔒 Secure payment · Credits never expire · Instant activation
          </p>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section
        style={{
          background: "linear-gradient(135deg, #1a1f4b 0%, #2d3278 100%)",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>

          <h2
            style={{
              fontWeight: 900,
              fontSize: "clamp(28px, 4vw, 42px)",
              color: "white",
              marginBottom: "16px",
            }}
          >
            Ready to create your name slip?
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "15px", marginBottom: "36px" }}>
            Join thousands of students and schools creating beautiful name slips with LabelBee.
          </p>
          <Link
            href="/generator"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#F5C42E",
              color: "#1a1f4b",
              fontWeight: 800,
              fontSize: "16px",
              padding: "15px 36px",
              borderRadius: "14px",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(245,196,46,0.35)",
              transition: "all 0.2s",
            }}
          >
            Get Started Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer
        style={{
          background: "#fafafa",
          borderTop: "1px solid #f0f0f0",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontWeight: 800, fontSize: "17px", color: "#1a1f4b" }}>
            Label<span style={{ color: "#F5C42E" }}>Bee</span>
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#9ca3af", fontWeight: 500 }}>
          © {new Date().getFullYear()} LabelBee. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
