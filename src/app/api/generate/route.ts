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

// ─── Provider 1: Pollinations AI (Without enhance=true which causes 402/500) ───
async function generateWithPollinations(prompt: string): Promise<string> {
  const enhancedPrompt = `Background image for a school name slip: ${prompt}. Colorful, vibrant, child-friendly, decorative, no text, no letters, seamless pattern style.`;
  const encodedPrompt = encodeURIComponent(enhancedPrompt);

  const models = ['', 'flux', 'turbo', 'bflux'];
  const seeds = [Math.floor(Math.random() * 999999), 42, 123];

  for (const model of models) {
    for (const seed of seeds) {
      const modelParam = model ? `&model=${model}` : '';
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&seed=${seed}&nologo=true${modelParam}`;
      console.log(`[generate] Trying Pollinations AI (model="${model}", seed=${seed})...`);

      try {
        const res = await fetchWithTimeout(url, { method: 'GET' }, 8000);

        if (!res.ok) {
          throw new Error(`Pollinations HTTP ${res.status}`);
        }

        const contentType = res.headers.get('content-type') ?? 'image/jpeg';
        // Ensure we actually got an image and not a JSON error page
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

// ─── Provider 2: Bulletproof Procedural SVG Background Engine ─────────────────
function generateThemedSVGBackground(prompt: string): string {
  const p = prompt.toLowerCase();
  
  let bg1 = '#4f46e5', bg2 = '#7c3aed', bg3 = '#ec4899';
  let elements = '';
  let borderDash = '';

  if (p.includes('space') || p.includes('star') || p.includes('galaxy') || p.includes('planet') || p.includes('astro')) {
    bg1 = '#0f172a'; bg2 = '#1e1b4b'; bg3 = '#312e81';
    elements += `<circle cx="150" cy="180" r="70" fill="#f59e0b" opacity="0.85"/>`;
    elements += `<circle cx="650" cy="250" r="110" fill="#ec4899" opacity="0.6"/>`;
    elements += `<ellipse cx="650" cy="250" rx="150" ry="30" fill="none" stroke="#f472b6" stroke-width="6" transform="rotate(-20 650 250)" opacity="0.8"/>`;
    for (let i = 0; i < 50; i++) {
      const x = (i * 137) % 800;
      const y = (i * 269) % 800;
      const r = (i % 3) + 1.5;
      elements += `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="${0.4 + (i % 5) * 0.12}"/>`;
    }
    borderDash = 'stroke="#a855f7" stroke-width="4" stroke-dasharray="10 6"';
  } else if (p.includes('unicorn') || p.includes('rainbow') || p.includes('magic') || p.includes('pink') || p.includes('fairy')) {
    bg1 = '#fce7f3'; bg2 = '#f3e8ff'; bg3 = '#e0e7ff';
    elements += `<path d="M 50 500 A 350 350 0 0 1 750 500" stroke="#fb7185" stroke-width="20" fill="none" opacity="0.65"/>`;
    elements += `<path d="M 75 500 A 325 325 0 0 1 725 500" stroke="#fbbf24" stroke-width="20" fill="none" opacity="0.65"/>`;
    elements += `<path d="M 100 500 A 300 300 0 0 1 700 500" stroke="#34d399" stroke-width="20" fill="none" opacity="0.65"/>`;
    elements += `<path d="M 125 500 A 275 275 0 0 1 675 500" stroke="#60a5fa" stroke-width="20" fill="none" opacity="0.65"/>`;
    for (let i = 0; i < 25; i++) {
      const x = (i * 180 + 50) % 750;
      const y = (i * 220 + 80) % 750;
      elements += `<polygon points="${x},${y-12} ${x+3},${y-3} ${x+12},${y} ${x+3},${y+3} ${x},${y+12} ${x-3},${y+3} ${x-12},${y} ${x-3},${y-3}" fill="#fbbf24" opacity="0.75"/>`;
    }
    borderDash = 'stroke="#f472b6" stroke-width="4"';
  } else if (p.includes('dinosaur') || p.includes('jungle') || p.includes('forest') || p.includes('dino') || p.includes('nature') || p.includes('leaf')) {
    bg1 = '#065f46'; bg2 = '#047857'; bg3 = '#10b981';
    elements += `<path d="M 0 800 Q 200 500 400 800 T 800 800 Z" fill="#022c22" opacity="0.5"/>`;
    for (let i = 0; i < 30; i++) {
      const x = (i * 140) % 800;
      const y = (i * 210) % 800;
      elements += `<circle cx="${x}" cy="${y}" r="${15 + (i % 4) * 8}" fill="#a7f3d0" opacity="0.2"/>`;
    }
    borderDash = 'stroke="#34d399" stroke-width="4"';
  } else if (p.includes('ocean') || p.includes('sea') || p.includes('water') || p.includes('fish') || p.includes('underwater') || p.includes('mermaid')) {
    bg1 = '#0c4a6e'; bg2 = '#0284c7'; bg3 = '#38bdf8';
    for (let i = 0; i < 6; i++) {
      const y = 120 * i + 100;
      elements += `<path d="M 0 ${y} Q 200 ${y-30} 400 ${y} T 800 ${y}" fill="none" stroke="#e0f2fe" stroke-width="4" opacity="0.35"/>`;
    }
    for (let i = 0; i < 35; i++) {
      const x = (i * 155) % 800;
      const y = (i * 240) % 800;
      elements += `<circle cx="${x}" cy="${y}" r="${4 + (i % 5) * 3}" fill="#ffffff" opacity="0.4"/>`;
    }
    borderDash = 'stroke="#38bdf8" stroke-width="4"';
  } else if (p.includes('superhero') || p.includes('comic') || p.includes('action') || p.includes('hero')) {
    bg1 = '#991b1b'; bg2 = '#dc2626'; bg3 = '#f59e0b';
    for (let i = 0; i < 16; i++) {
      const angle = (i * 22.5) * (Math.PI / 180);
      const x2 = 400 + 600 * Math.cos(angle);
      const y2 = 400 + 600 * Math.sin(angle);
      elements += `<polygon points="400,400 ${x2},${y2} ${400 + 600 * Math.cos(angle + 0.2)},${400 + 600 * Math.sin(angle + 0.2)}" fill="#fef08a" opacity="0.25"/>`;
    }
    borderDash = 'stroke="#facc15" stroke-width="5"';
  } else {
    // Default Vibrant Modern Abstract Pattern
    bg1 = '#4338ca'; bg2 = '#6d28d9'; bg3 = '#be185d';
    for (let i = 0; i < 20; i++) {
      const x = (i * 120 + 40) % 800;
      const y = (i * 190 + 60) % 800;
      const r = 25 + (i * 11) % 65;
      elements += `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="0.12"/>`;
    }
    for (let i = 0; i < 15; i++) {
      const x = (i * 175) % 800;
      const y = (i * 235) % 800;
      elements += `<rect x="${x}" y="${y}" width="40" height="40" rx="10" transform="rotate(${i * 24} ${x} ${y})" fill="#a855f7" opacity="0.2"/>`;
    }
    borderDash = 'stroke="#c084fc" stroke-width="4"';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="50%" stop-color="${bg2}"/>
        <stop offset="100%" stop-color="${bg3}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="800" fill="url(#bgGrad)"/>
    ${elements}
    <rect x="20" y="20" width="760" height="760" rx="24" fill="none" ${borderDash} opacity="0.6"/>
  </svg>`.trim();

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

    // 1. Try Pollinations image generation
    try {
      const imageUrl = await generateWithPollinations(clean);
      return NextResponse.json({ imageUrl });
    } catch (err) {
      console.warn('[generate] Pollinations AI unavailable, using procedural SVG engine fallback:', err);
    }

    // 2. Fail-Safe SVG Background Engine (Guaranteed 100% Success)
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
