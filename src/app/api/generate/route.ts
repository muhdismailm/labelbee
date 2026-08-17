import { NextResponse } from 'next/server';

const TIMEOUT_MS = 15_000;

// ─── Helper: fetch with timeout ───────────────────────────────────────────────
async function fetchWithTimeout(url: string, options: RequestInit = {}, ms = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── Provider 1: Gemini AI Image Generation ─────────────────────────────────
async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  const enhancedPrompt = `School notebook name slip sticker design for kids, ${prompt} theme, professional graphic stationery design, featuring cute cartoon character illustrations on corners and borders, a circular photo frame border on top-left, and a clean white rounded rectangular card box with horizontal lines on right, high resolution vector art, vibrant colors, child-friendly, clean and crisp.`;

  // Gemini image-generation models in priority order
  const geminiModels = [
    'gemini-3.1-flash-image',
    'gemini-2.5-flash-image',
  ];

  for (const model of geminiModels) {
    try {
      console.log(`[generate] Trying Gemini image generation model: "${model}"...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: enhancedPrompt }] }],
            generationConfig: {
              responseModalities: ['IMAGE', 'TEXT'],
              temperature: 0.7,
            },
          }),
        },
        15000
      );

      if (!res.ok) {
        const errText = await res.text();
        let parsedMessage = errText;
        try {
          const errJson = JSON.parse(errText);
          parsedMessage = errJson?.error?.message || errText;
        } catch {
          // ignore JSON parse error
        }
        console.warn(`[generate] ✗ Gemini model "${model}" failed with HTTP ${res.status}: ${parsedMessage}`);
        continue;
      }

      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];

      for (const part of parts) {
        // Handle inlineData (camelCase or snake_case)
        const inline = part.inlineData || part.inline_data;
        if (inline?.data) {
          const mime = inline.mimeType || inline.mime_type || 'image/png';
          console.log(`[generate] ✓ Gemini model "${model}" successfully generated image (${inline.data.length} chars, mime=${mime})`);
          return `data:${mime};base64,${inline.data}`;
        }
      }

      console.warn(`[generate] ✗ Gemini model "${model}" returned HTTP 200 but no image data part was found in response.`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[generate] ✗ Error calling Gemini model "${model}": ${errorMsg}`);
    }
  }

  throw new Error('All Gemini image-generation models failed.');
}

// ─── Provider 2: Pollinations AI (Secondary Fallback) ─────────────────────────
async function generateWithPollinations(prompt: string): Promise<string> {
  const enhancedPrompt = `School notebook name slip sticker design for kids, ${prompt} theme, professional graphic stationery design, featuring cartoon character illustrations on corners, a circular photo frame border on top-left, and a clean white rounded rectangular card box with 4 blank horizontal lines for Name, Class, Subject, School on right, high resolution vector art, vibrant colors, child-friendly, no pre-printed text inside lines, clean white background inside the details box.`;
  const encodedPrompt = encodeURIComponent(enhancedPrompt);

  const models = ['', 'flux', 'turbo', 'bflux'];
  const seeds = [Math.floor(Math.random() * 999999), 42, 123, 777];

  for (const model of models) {
    for (const seed of seeds) {
      const modelParam = model ? `&model=${model}` : '';
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=500&seed=${seed}&nologo=true${modelParam}`;
      console.log(`[generate] Trying Pollinations AI (model="${model}", seed=${seed})...`);

      try {
        const res = await fetchWithTimeout(url, { method: 'GET' }, 8000);

        if (!res.ok) {
          throw new Error(`Pollinations HTTP ${res.status}`);
        }

        const contentType = res.headers.get('content-type') ?? 'image/jpeg';
        if (contentType.includes('json') || contentType.includes('text')) {
          throw new Error(`Pollinations returned non-image content-type: ${contentType}`);
        }

        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');

        if (base64.length < 500) {
          throw new Error('Pollinations returned too small image payload');
        }

        console.log(`[generate] ✓ Pollinations returned image (${base64.length} chars, type=${contentType})`);
        return `data:${contentType};base64,${base64}`;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[generate] ✗ Pollinations (model="${model}", seed=${seed}): ${msg}`);
      }
    }
  }

  throw new Error('Pollinations AI failed after all model retries');
}

// ─── Provider 2: High-Resolution Procedural Vector Name Slip Engine ───────────
function generateThemedSVGBackground(prompt: string): string {
  const p = prompt.toLowerCase();

  // 1. SPACE / ASTRONAUT THEME (Ref: Blue galaxy, rocket, astronaut, moon, planets, double blue ring)
  if (p.includes('space') || p.includes('star') || p.includes('galaxy') || p.includes('planet') || p.includes('astro') || p.includes('cosmic') || p.includes('rocket')) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 625" width="1000" height="625">
      <defs>
        <linearGradient id="spaceBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0b132b"/>
          <stop offset="40%" stop-color="#1c2541"/>
          <stop offset="80%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <radialGradient id="nebula" cx="70%" cy="30%" r="60%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35"/>
          <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <!-- Base Background -->
      <rect width="1000" height="625" rx="30" fill="url(#spaceBg)"/>
      <rect width="1000" height="625" rx="30" fill="url(#nebula)"/>
      
      <!-- Stars & Sparkles -->
      ${Array.from({ length: 60 }, (_, i) => {
        const x = (i * 173) % 960 + 20;
        const y = (i * 269) % 585 + 20;
        const r = (i % 3) * 0.9 + 1.2;
        const op = 0.35 + (i % 5) * 0.13;
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="${op}"/>`;
      }).join('')}
      <!-- Yellow 4-point stars -->
      <polygon points="440,50 443,62 455,65 443,68 440,80 437,68 425,65 437,62" fill="#fbbf24" opacity="0.85"/>
      <polygon points="950,160 952,168 960,170 952,172 950,180 948,172 940,170 948,168" fill="#fbbf24" opacity="0.75"/>
      <polygon points="355,420 357,426 363,428 357,430 355,436 353,430 347,428 353,426" fill="#60a5fa" opacity="0.8"/>

      <!-- Saturn Planet with Ring (Top-Left) -->
      <g transform="translate(60, 45)">
        <ellipse cx="25" cy="25" rx="28" ry="8" fill="none" stroke="#a78bfa" stroke-width="4" transform="rotate(-25 25 25)" opacity="0.8"/>
        <circle cx="25" cy="25" r="16" fill="#8b5cf6"/>
        <ellipse cx="25" cy="25" rx="28" ry="8" fill="none" stroke="#c4b5fd" stroke-width="2.5" transform="rotate(-25 25 25)" opacity="0.9" stroke-dasharray="14 4"/>
      </g>

      <!-- Blue Planet (Center-Right) -->
      <g transform="translate(940, 240)">
        <ellipse cx="0" cy="0" rx="35" ry="10" fill="none" stroke="#38bdf8" stroke-width="3" transform="rotate(-20 0 0)" opacity="0.85"/>
        <circle cx="0" cy="0" r="20" fill="#0284c7"/>
        <ellipse cx="-4" cy="-5" rx="14" ry="7" fill="#38bdf8" opacity="0.4"/>
      </g>

      <!-- Yellow Moon with Craters (Bottom-Right) -->
      <g transform="translate(890, 430)">
        <circle cx="50" cy="50" r="60" fill="#facc15" filter="url(#glow)"/>
        <circle cx="50" cy="50" r="60" fill="#eab308"/>
        <circle cx="30" cy="35" r="10" fill="#ca8a04" opacity="0.6"/>
        <circle cx="65" cy="30" r="7" fill="#ca8a04" opacity="0.5"/>
        <circle cx="50" cy="70" r="12" fill="#ca8a04" opacity="0.55"/>
        <circle cx="75" cy="65" r="8" fill="#ca8a04" opacity="0.6"/>
        <circle cx="25" cy="65" r="6" fill="#ca8a04" opacity="0.45"/>
      </g>

      <!-- Cute Astronaut on Rocket (Bottom-Left) -->
      <g transform="translate(20, 310) scale(1.15)">
        <!-- Rocket Flame -->
        <polygon points="12,165 24,195 36,165" fill="#f97316"/>
        <polygon points="18,165 24,185 30,165" fill="#facc15"/>
        <!-- Rocket Body -->
        <path d="M 24 75 Q 85 105 75 165 L 15 165 Q 5 105 24 75 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
        <path d="M 30 85 Q 75 110 65 155 L 25 155 Z" fill="#f87171"/>
        <circle cx="45" cy="125" r="14" fill="#38bdf8" stroke="#ffffff" stroke-width="3"/>
        <polygon points="5,150 15,165 -10 170" fill="#dc2626"/>
        <polygon points="85,150 75,165 100,170" fill="#dc2626"/>

        <!-- Astronaut -->
        <!-- Helmet -->
        <circle cx="85" cy="60" r="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <ellipse cx="88" cy="58" rx="18" ry="14" fill="#1e293b"/>
        <ellipse cx="85" cy="54" rx="14" ry="7" fill="#38bdf8" opacity="0.7"/>
        <circle cx="94" cy="52" r="3" fill="#ffffff"/>
        <!-- Body -->
        <path d="M 68 85 C 68 78, 102 78, 102 85 L 98 120 C 98 125, 72 125, 72 120 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <!-- Waving Hand -->
        <circle cx="118" cy="65" r="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <path d="M 98 85 Q 115 75 118 65" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
        <!-- Backpack -->
        <rect x="58" y="75" width="12" height="30" rx="4" fill="#94a3b8"/>
      </g>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  // 2. RACING CAR THEME (Ref: Red sports supercar, checkered flag, speedometer, speed streaks)
  if (p.includes('racing') || p.includes('car') || p.includes('supercar') || p.includes('speed') || p.includes('drift') || p.includes('track') || p.includes('auto') || p.includes('vehicle')) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 625" width="1000" height="625">
      <defs>
        <linearGradient id="raceBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
        <linearGradient id="carRed" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#b91c1c"/>
          <stop offset="50%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#dc2626"/>
        </linearGradient>
      </defs>
      <!-- Base background with speed lines -->
      <rect width="1000" height="625" rx="30" fill="url(#raceBg)"/>
      <path d="M 0 0 L 350 0 L 250 625 L 0 625 Z" fill="#f1f5f9" opacity="0.7"/>
      <!-- Dynamic Racing Red Streaks -->
      <polygon points="500,0 1000,0 1000,35 550,35" fill="#dc2626"/>
      <polygon points="680,20 1000,20 1000,45 710,45" fill="#1e293b"/>
      <polygon points="0,520 1000,400 1000,435 0,555" fill="#dc2626" opacity="0.85"/>
      <polygon points="0,550 1000,430 1000,500 0,625" fill="#0f172a"/>

      <!-- Checkered Flag Pattern (Top-Left) -->
      <g transform="translate(0, 0)">
        ${Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 6 }, (_, col) => {
            const isBlack = (row + col) % 2 === 0;
            const x = col * 20;
            const y = row * 20;
            return `<rect x="${x}" y="${y}" width="20" height="20" fill="${isBlack ? '#0f172a' : '#ffffff'}" opacity="0.85"/>`;
          }).join('')
        ).join('')}
      </g>

      <!-- Checkered Flag Pattern (Bottom-Right) -->
      <g transform="translate(750, 480) skewX(-15)">
        ${Array.from({ length: 3 }, (_, row) =>
          Array.from({ length: 12 }, (_, col) => {
            const isBlack = (row + col) % 2 === 0;
            const x = col * 20;
            const y = row * 20;
            return `<rect x="${x}" y="${y}" width="20" height="20" fill="${isBlack ? '#0f172a' : '#ffffff'}" opacity="0.85"/>`;
          }).join('')
        ).join('')}
      </g>

      <!-- Speedometer Gauge (Bottom-Right) -->
      <g transform="translate(915, 420)">
        <circle cx="0" cy="0" r="55" fill="#0f172a" stroke="#dc2626" stroke-width="4"/>
        <circle cx="0" cy="0" r="48" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 6"/>
        <path d="M -35 20 A 40 40 0 1 1 35 20" fill="none" stroke="#22c55e" stroke-width="4"/>
        <path d="M 20 -35 A 40 40 0 0 1 38 12" fill="none" stroke="#ef4444" stroke-width="4"/>
        <!-- Needle -->
        <line x1="0" y1="0" x2="25" y2="-25" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="6" fill="#dc2626"/>
      </g>

      <!-- Red Sports Supercar (Bottom-Center) -->
      <g transform="translate(380, 360)">
        <!-- Car Body Shadow -->
        <ellipse cx="190" cy="150" rx="190" ry="18" fill="#000000" opacity="0.5"/>
        <!-- Car Main Body -->
        <path d="M 20 120 C 50 110, 110 80, 170 80 C 250 80, 310 100, 360 115 C 375 120, 385 130, 375 140 C 350 148, 40 148, 15 140 C 5 130, 10 122, 20 120 Z" fill="url(#carRed)" stroke="#991b1b" stroke-width="2"/>
        <!-- Cabin / Windshield -->
        <path d="M 120 85 C 150 50, 230 50, 270 85 Z" fill="#0f172a"/>
        <path d="M 135 83 C 160 55, 220 55, 255 83 Z" fill="#38bdf8" opacity="0.75"/>
        <!-- Racing Stripes -->
        <rect x="185" y="55" width="12" height="90" fill="#0f172a"/>
        <rect x="202" y="55" width="12" height="90" fill="#0f172a"/>
        <!-- Headlights -->
        <polygon points="35,115 75,110 65,120" fill="#fef08a"/>
        <polygon points="345,115 305,110 315,120" fill="#fef08a"/>
        <!-- Wheels -->
        <circle cx="80" cy="138" r="24" fill="#0f172a" stroke="#475569" stroke-width="4"/>
        <circle cx="80" cy="138" r="12" fill="#94a3b8"/>
        <circle cx="300" cy="138" r="24" fill="#0f172a" stroke="#475569" stroke-width="4"/>
        <circle cx="300" cy="138" r="12" fill="#94a3b8"/>
      </g>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  // 3. PRINCESS / CASTLE THEME (Ref: Pink dreamy, castle, cartoon princess, golden crown, butterflies)
  if (p.includes('princess') || p.includes('castle') || p.includes('crown') || p.includes('barbie') || p.includes('fairy') || p.includes('pink') || p.includes('royal')) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 625" width="1000" height="625">
      <defs>
        <linearGradient id="pinkBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fdf2f8"/>
          <stop offset="50%" stop-color="#fce7f3"/>
          <stop offset="100%" stop-color="#fbcfe8"/>
        </linearGradient>
        <linearGradient id="castleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f472b6"/>
          <stop offset="100%" stop-color="#db2777"/>
        </linearGradient>
      </defs>
      <!-- Base Background -->
      <rect width="1000" height="625" rx="30" fill="url(#pinkBg)"/>
      
      <!-- Sparkles and Clouds -->
      ${Array.from({ length: 30 }, (_, i) => {
        const x = (i * 180 + 30) % 940;
        const y = (i * 130 + 20) % 400;
        return `<polygon points="${x},${y-8} ${x+2},${y-2} ${x+8},${y} ${x+2},${y+2} ${x},${y+8} ${x-2},${y+2} ${x-8},${y} ${x-2},${y-2}" fill="#f43f5e" opacity="${0.4 + (i % 4) * 0.15}"/>`;
      }).join('')}

      <!-- Bottom Pink Floral Hill -->
      <path d="M 0 550 Q 250 510 500 550 T 1000 550 L 1000 625 L 0 625 Z" fill="#f472b6" opacity="0.6"/>
      <path d="M 0 575 Q 350 540 700 575 T 1000 575 L 1000 625 L 0 625 Z" fill="#ec4899" opacity="0.7"/>

      <!-- Pink Fairytale Castle (Bottom-Left) -->
      <g transform="translate(15, 330) scale(0.9)">
        <!-- Castle Towers -->
        <rect x="20" y="110" width="45" height="150" fill="url(#castleGrad)"/>
        <polygon points="42,40 10,110 75,110" fill="#be185d"/>
        <rect x="80" y="140" width="70" height="120" fill="url(#castleGrad)"/>
        <polygon points="115,70 70,140 160,140" fill="#be185d"/>
        <rect x="165" y="110" width="45" height="150" fill="url(#castleGrad)"/>
        <polygon points="187,40 155,110 220,110" fill="#be185d"/>
        <!-- Main Gate -->
        <path d="M 95 260 C 95 200, 135 200, 135 260 Z" fill="#831843"/>
        <!-- Windows -->
        <path d="M 35 150 C 35 130, 50 130, 50 150 Z" fill="#fdf2f8"/>
        <path d="M 180 150 C 180 130, 195 130, 195 150 Z" fill="#fdf2f8"/>
      </g>

      <!-- Golden Crown (Top-Left Accent) -->
      <g transform="translate(90, 25)">
        <polygon points="0,35 12,10 28,24 44,10 56,35" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <circle cx="12" cy="10" r="3.5" fill="#ef4444"/>
        <circle cx="28" cy="24" r="3.5" fill="#3b82f6"/>
        <circle cx="44" cy="10" r="3.5" fill="#ef4444"/>
        <rect x="0" y="32" width="56" height="7" rx="2" fill="#f59e0b"/>
      </g>

      <!-- Butterfly (Top-Right) -->
      <g transform="translate(450, 45) scale(0.9)">
        <path d="M 20 20 C 10 -10, -20 0, 0 25 C -20 40, 0 55, 20 30" fill="#f43f5e" opacity="0.8"/>
        <path d="M 20 20 C 30 -10, 60 0, 40 25 C 60 40, 40 55, 20 30" fill="#f43f5e" opacity="0.8"/>
        <line x1="20" y1="10" x2="20" y2="40" stroke="#be185d" stroke-width="3"/>
      </g>

      <!-- Beautiful Cartoon Princess (Bottom-Right) -->
      <g transform="translate(760, 310) scale(0.95)">
        <!-- Ballgown Skirt -->
        <path d="M 120 120 C 60 200, 0 260, -20 330 L 260 330 C 240 260, 180 200, 120 120 Z" fill="#f472b6" stroke="#db2777" stroke-width="2"/>
        <path d="M 120 120 C 80 200, 30 260, 10 330 L 230 330 C 210 260, 160 200, 120 120 Z" fill="#ec4899"/>
        <!-- Sparkles on dress -->
        <polygon points="120,200 123,208 131,211 123,214 120,222 117,214 109,211 117,208" fill="#ffffff" opacity="0.8"/>
        <polygon points="60,260 62,266 68,268 62,270 60,276 58,270 52,268 58,266" fill="#ffffff" opacity="0.8"/>
        <!-- Torso & Bodice -->
        <path d="M 100 80 C 100 120, 140 120, 140 80 Z" fill="#db2777"/>
        <!-- Head & Hair -->
        <circle cx="120" cy="50" r="22" fill="#fed7aa"/>
        <!-- Brown flowing hair -->
        <path d="M 95 40 C 95 0, 145 0, 145 40 C 155 80, 150 120, 140 135 C 135 100, 105 100, 100 135 C 90 120, 85 80, 95 40 Z" fill="#78350f"/>
        <!-- Face features -->
        <ellipse cx="113" cy="48" rx="2.5" ry="3.5" fill="#451a03"/>
        <ellipse cx="127" cy="48" rx="2.5" ry="3.5" fill="#451a03"/>
        <path d="M 116 58 Q 120 62 124 58" stroke="#e11d48" stroke-width="1.5" fill="none"/>
        <!-- Tiara -->
        <polygon points="110,32 115,22 120,28 125,22 130,32" fill="#facc15"/>
      </g>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  // 4. SUPERHERO COMIC THEME (Ref: Blue halftone burst, night city, POW action burst, superhero boy in cape)
  if (p.includes('superhero') || p.includes('comic') || p.includes('action') || p.includes('hero') || p.includes('batman') || p.includes('spiderman') || p.includes('avenger')) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 625" width="1000" height="625">
      <defs>
        <linearGradient id="comicSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="60%" stop-color="#0369a1"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <!-- Base Sky -->
      <rect width="1000" height="625" rx="30" fill="url(#comicSky)"/>

      <!-- Comic Action Sunburst Rays -->
      ${Array.from({ length: 18 }, (_, i) => {
        const angle = (i * 20) * (Math.PI / 180);
        const x2 = 500 + 800 * Math.cos(angle);
        const y2 = 250 + 800 * Math.sin(angle);
        const x3 = 500 + 800 * Math.cos(angle + 0.16);
        const y3 = 250 + 800 * Math.sin(angle + 0.16);
        return `<polygon points="500,250 ${x2},${y2} ${x3},${y3}" fill="#38bdf8" opacity="0.3"/>`;
      }).join('')}

      <!-- City Skyline at Night (Bottom) -->
      <g transform="translate(0, 450)">
        <rect x="0" y="20" width="80" height="155" fill="#0f172a"/>
        <rect x="90" y="0" width="70" height="175" fill="#1e293b"/>
        <rect x="170" y="40" width="85" height="135" fill="#0f172a"/>
        <rect x="265" y="10" width="60" height="165" fill="#1e293b"/>
        <rect x="335" y="50" width="95" height="125" fill="#0f172a"/>
        <rect x="440" y="20" width="70" height="155" fill="#1e293b"/>
        <rect x="520" y="0" width="110" height="175" fill="#0f172a"/>
        <rect x="640" y="30" width="75" height="145" fill="#1e293b"/>
        <rect x="725" y="10" width="90" height="165" fill="#0f172a"/>
        <rect x="825" y="40" width="175" height="135" fill="#1e293b"/>
        <!-- Yellow Windows -->
        ${Array.from({ length: 40 }, (_, i) => {
          const x = (i * 45 + 15) % 950;
          const y = (i * 28 + 25) % 120 + 20;
          return `<rect x="${x}" y="${y}" width="8" height="12" fill="#facc15" opacity="${0.5 + (i % 3) * 0.25}"/>`;
        }).join('')}
      </g>

      <!-- Yellow Comic Action Stars -->
      <polygon points="635,30 642,48 660,52 645,64 650,82 635,70 620,82 625,64 610,52 628,48" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
      <polygon points="950,45 955,58 970,60 958,70 962,85 950,75 938,85 942,70 930,60 945,58" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
      <polygon points="340,430 345,442 357,444 347,452 350,464 340,456 330,464 333,452 323,444 335,442" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>

      <!-- "POW!" Action Star Burst Badge (Bottom-Left) -->
      <g transform="translate(15, 410) scale(1.1)">
        <!-- Red/Yellow Burst Points -->
        <polygon points="70,10 90,35 125,15 115,50 145,55 120,80 145,105 110,110 115,145 80,125 55,145 50,115 15,120 35,90 10,65 45,60 30,25 65,40" fill="#dc2626" stroke="#000000" stroke-width="3"/>
        <polygon points="68,18 84,38 114,22 106,51 130,55 110,76 130,97 101,101 106,130 76,114 55,130 51,106 22,110 38,86 18,65 46,61 34,32 63,44" fill="#facc15"/>
        <text x="75" y="88" font-family="Arial Black,Impact,sans-serif" font-weight="900" font-size="34" fill="#000000" text-anchor="middle" font-style="italic">POW!</text>
        <text x="73" y="86" font-family="Arial Black,Impact,sans-serif" font-weight="900" font-size="34" fill="#dc2626" text-anchor="middle" font-style="italic">POW!</text>
      </g>

      <!-- Masked Superhero Boy with Red Cape (Right) -->
      <g transform="translate(840, 270) scale(1.05)">
        <!-- Red Flowing Cape -->
        <path d="M 10 90 C -20 150, -40 240, -10 300 C 40 280, 80 270, 100 300 C 130 240, 110 150, 80 90 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
        <!-- Hero Body (Blue Suit) -->
        <rect x="25" y="100" width="50" height="90" rx="10" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="2"/>
        <!-- Emblem (Yellow Star in Circle) -->
        <circle cx="50" cy="135" r="14" fill="#dc2626" stroke="#facc15" stroke-width="2"/>
        <polygon points="50,126 53,133 60,133 54,138 56,145 50,141 44,145 46,138 40,133 47,133" fill="#facc15"/>
        <!-- Yellow Belt -->
        <rect x="20" y="180" width="60" height="12" rx="3" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
        <circle cx="50" cy="186" r="6" fill="#dc2626"/>
        <!-- Legs & Boots -->
        <rect x="25" y="192" width="20" height="70" fill="#1d4ed8"/>
        <rect x="55" y="192" width="20" height="70" fill="#1d4ed8"/>
        <path d="M 22 260 L 45 260 L 45 300 L 15 300 Z" fill="#dc2626"/>
        <path d="M 55 260 L 78 260 L 85 300 L 55 300 Z" fill="#dc2626"/>
        <!-- Arms with Red Gloves on Hips -->
        <path d="M 25 110 Q -5 140 25 175" stroke="#1d4ed8" stroke-width="12" stroke-linecap="round" fill="none"/>
        <circle cx="25" cy="175" r="8" fill="#dc2626"/>
        <path d="M 75 110 Q 105 140 75 175" stroke="#1d4ed8" stroke-width="12" stroke-linecap="round" fill="none"/>
        <circle cx="75" cy="175" r="8" fill="#dc2626"/>
        <!-- Head, Mask & Hair -->
        <circle cx="50" cy="65" r="24" fill="#fed7aa"/>
        <!-- Black Spiky Hair -->
        <path d="M 25 60 C 25 35, 75 35, 75 60 C 70 30, 45 30, 25 60 Z" fill="#0f172a"/>
        <polygon points="35,45 45,30 48,45" fill="#0f172a"/>
        <polygon points="50,45 60,30 63,45" fill="#0f172a"/>
        <!-- Red Domino Mask -->
        <path d="M 30 62 C 40 55, 60 55, 70 62 C 60 70, 40 70, 30 62 Z" fill="#dc2626"/>
        <ellipse cx="40" cy="62" rx="3.5" ry="4" fill="#ffffff"/>
        <circle cx="40" cy="62" r="2" fill="#0f172a"/>
        <ellipse cx="60" cy="62" rx="3.5" ry="4" fill="#ffffff"/>
        <circle cx="60" cy="62" r="2" fill="#0f172a"/>
        <!-- Smiling Mouth -->
        <path d="M 44 76 Q 50 82 56 76" stroke="#b91c1c" stroke-width="2" fill="none"/>
      </g>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  // 5. DINOSAUR / JUNGLE THEME
  if (p.includes('dinosaur') || p.includes('jungle') || p.includes('forest') || p.includes('dino') || p.includes('safari') || p.includes('nature')) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 625" width="1000" height="625">
      <defs>
        <linearGradient id="jungleBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#064e3b"/>
          <stop offset="50%" stop-color="#047857"/>
          <stop offset="100%" stop-color="#10b981"/>
        </linearGradient>
      </defs>
      <rect width="1000" height="625" rx="30" fill="url(#jungleBg)"/>
      <!-- Jungle Foliage -->
      <path d="M 0 625 Q 200 450 400 625 T 800 625 Z" fill="#022c22" opacity="0.4"/>
      <!-- Palm Leaves -->
      <path d="M 20 0 Q 150 50 180 180 Q 90 90 20 0 Z" fill="#34d399" opacity="0.7"/>
      <path d="M 1000 0 Q 850 50 820 180 Q 910 90 1000 0 Z" fill="#34d399" opacity="0.7"/>
      <!-- Cute T-Rex (Bottom-Right) -->
      <g transform="translate(820, 360) scale(0.9)">
        <path d="M 40 80 C 40 20, 120 20, 130 70 C 140 100, 110 160, 110 200 L 40 200 Z" fill="#22c55e"/>
        <circle cx="110" cy="50" r="6" fill="#ffffff"/>
        <circle cx="110" cy="50" r="3" fill="#0f172a"/>
        <path d="M 20 150 Q -30 180 -50 140" stroke="#22c55e" stroke-width="18" stroke-linecap="round" fill="none"/>
        <circle cx="70" cy="110" r="8" fill="#15803d" opacity="0.6"/>
        <circle cx="60" cy="150" r="10" fill="#15803d" opacity="0.6"/>
      </g>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  // 6. DEFAULT VIBRANT ABSTRACT THEME
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 625" width="1000" height="625">
    <defs>
      <linearGradient id="defBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#312e81"/>
        <stop offset="50%" stop-color="#4f46e5"/>
        <stop offset="100%" stop-color="#7c3aed"/>
      </linearGradient>
    </defs>
    <rect width="1000" height="625" rx="30" fill="url(#defBg)"/>
    ${Array.from({ length: 25 }, (_, i) => {
      const x = (i * 140 + 50) % 950;
      const y = (i * 110 + 40) % 550;
      return `<circle cx="${x}" cy="${y}" r="${15 + (i % 5) * 8}" fill="#ffffff" opacity="0.1"/>`;
    }).join('')}
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt: string = body?.prompt;

    console.log(`\n[generate] ════════════════════════════════════`);
    console.log(`[generate] Prompt: "${prompt}"`);

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const clean = prompt.trim();

    // 1. Primary: Try Gemini AI / Google Imagen Image Generation
    try {
      const imageUrl = await generateWithGemini(clean);
      return NextResponse.json({ imageUrl });
    } catch (err) {
      console.warn('[generate] Gemini AI image generation unavailable, trying Pollinations fallback:', err);
    }

    // 2. Secondary: Try Pollinations image generation
    try {
      const imageUrl = await generateWithPollinations(clean);
      return NextResponse.json({ imageUrl });
    } catch (err) {
      console.warn('[generate] Pollinations AI unavailable, using procedural SVG engine fallback:', err);
    }

    // 3. Tertiary: Fail-Safe SVG Background Engine (Guaranteed 100% Success)
    console.log('[generate] Serving high-quality procedural SVG pattern background...');
    const svgUrl = generateThemedSVGBackground(clean);
    return NextResponse.json({ imageUrl: svgUrl });

  } catch (error) {
    console.error('[generate] Unexpected error:', error);
    // Even in case of request body parsing error, fallback gracefully
    const fallbackSvg = generateThemedSVGBackground('abstract');
    return NextResponse.json({ imageUrl: fallbackSvg });
  }
}
