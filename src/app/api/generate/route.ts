import { NextResponse } from 'next/server';

const TIMEOUT_MS = 45_000;

// ─── Helper: fetch with timeout ───────────────────────────────────────────────
async function fetchWithTimeout(url: string, options: RequestInit = {}, ms = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── Provider 1: Pollinations AI (free, no API key needed) ───────────────────
// Returns a direct image URL — fetch it and convert to base64 for consistency
async function generateWithPollinations(prompt: string): Promise<string> {
  const enhancedPrompt = `Background image for a school name slip: ${prompt}. Colorful, vibrant, child-friendly, decorative, no text, no letters, seamless pattern style.`;
  const encodedPrompt = encodeURIComponent(enhancedPrompt);

  // Try different seeds for variety
  const seeds = [Math.floor(Math.random() * 999999), 42, 123];

  for (const seed of seeds) {
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&seed=${seed}&nologo=true&enhance=true`;
    console.log(`[generate] Trying Pollinations AI (seed=${seed})...`);

    try {
      const res = await fetchWithTimeout(url, { method: 'GET' });

      console.log(`[generate] Pollinations status: ${res.status}`);

      if (!res.ok) {
        throw new Error(`Pollinations HTTP ${res.status}`);
      }

      const contentType = res.headers.get('content-type') ?? 'image/jpeg';
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      if (base64.length < 100) {
        throw new Error('Pollinations returned empty image');
      }

      console.log(`[generate] ✓ Pollinations returned image (${base64.length} chars, type=${contentType})`);
      return `data:${contentType};base64,${base64}`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[generate] ✗ Pollinations (seed=${seed}): ${msg}`);
      // continue to next seed
    }
  }

  throw new Error('Pollinations AI failed after all retries');
}

// ─── Provider 2: Pollinations SVG fallback via text model ────────────────────
// Uses Pollinations text API to generate an SVG background
async function generateWithPollinationsSVG(prompt: string): Promise<string> {
  const svgPrompt = `Create a detailed SVG background illustration for the theme: "${prompt}".

Rules:
- Output ONLY raw SVG code. No markdown, no backticks, no explanation.
- Start exactly with <svg and end exactly with </svg>
- Use viewBox="0 0 800 800" width="800" height="800"
- Draw actual themed shapes (for "dog": draw dog shapes; for "space": draw planets/stars; for "ocean": draw waves/fish)
- Use multiple gradients, rich colors, filled shapes
- Fill the entire 800x800 canvas
- No text, no letters, no numbers anywhere in the SVG
- Minimum 30 distinct SVG elements`;

  const url = `https://text.pollinations.ai/${encodeURIComponent(svgPrompt)}?model=openai&seed=42`;
  console.log(`[generate] Trying Pollinations SVG text generation...`);

  const res = await fetchWithTimeout(url, { method: 'GET' });

  if (!res.ok) {
    throw new Error(`Pollinations text HTTP ${res.status}`);
  }

  let text = await res.text();
  if (!text) throw new Error('Pollinations SVG: empty response');

  // Strip markdown fences if present
  const fenceMatch = text.match(/```(?:svg|xml)?\s*\n?([\s\S]*?)```/i);
  if (fenceMatch) text = fenceMatch[1];

  const svgMatch = text.match(/<svg[\s\S]*<\/svg>/i);
  if (!svgMatch) throw new Error('Pollinations SVG: no <svg>...</svg> found');

  const svg = svgMatch[0].trim();
  if (svg.length < 200) throw new Error(`Pollinations SVG: too short (${svg.length} chars)`);

  console.log(`[generate] ✓ Pollinations SVG generated (${svg.length} chars)`);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt: string = body?.prompt;

    console.log(`\n[generate] ════════════════════════════════════`);
    console.log(`[generate] Prompt: "${prompt}"`);
    console.log(`[generate] Using: Pollinations AI (free, no API key needed)`);

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const clean = prompt.trim();
    const errors: string[] = [];

    // 1. Try Pollinations image generation (primary)
    try {
      return NextResponse.json({ imageUrl: await generateWithPollinations(clean) });
    } catch (err) {
      errors.push(`Pollinations: ${err instanceof Error ? err.message : err}`);
    }

    // 2. Fallback: Pollinations text → SVG art
    try {
      return NextResponse.json({ imageUrl: await generateWithPollinationsSVG(clean) });
    } catch (err) {
      errors.push(`PollinationsSVG: ${err instanceof Error ? err.message : err}`);
    }

    console.error('[generate] All providers failed:', errors);
    return NextResponse.json(
      { error: 'Image generation failed. Please try again.', details: errors },
      { status: 502 },
    );
  } catch (error) {
    console.error('[generate] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    );
  }
}
