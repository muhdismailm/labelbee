import { NextResponse } from 'next/server';

interface StudentDetails {
  studentName: string;
  grade: string;
  section: string;
  rollNo: string;
  subject: string;
  schoolName: string;
}

// Candidate Gemini image-generation models in priority order
const CANDIDATE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-image',
  'gemini-3-pro-image',
  'imagen-4.0-generate-001',
  'gemini-3.1-flash-image-preview',
];

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      studentPhotoBase64,
      backgroundBase64,
      studentDetails,
      stylePrompt,
    }: {
      studentPhotoBase64?: string;
      backgroundBase64?: string;
      studentDetails: StudentDetails;
      stylePrompt?: string;
    } = body;

    if (!backgroundBase64 || !studentDetails) {
      return NextResponse.json(
        { error: 'Background image and student details are required.' },
        { status: 400 }
      );
    }

    const { studentName, grade, section, rollNo, subject, schoolName } = studentDetails;
    const classLine = [grade, section].filter(Boolean).join(' - ');
    const rollLine = rollNo ? ` (Roll: ${rollNo})` : '';

    const compositionPrompt = `You are an expert graphic designer for educational stationery and school notebook name slips. Compose a single, high-quality, rectangular school student name slip / label sticker image.

LAYOUT SPECIFICATIONS (strictly follow):
1. BACKGROUND: Use the provided background template illustration (with its vibrant theme like Space Astronaut, Racing Supercar, Royal Princess Castle, Superhero Comic, etc.) across the full rectangular card.
2. LEFT SIDE PHOTO BADGE: Place the provided student photo inside a crisp circular frame on the upper left, enclosed with a stylish double accent ring border matching the theme color palette (e.g. bold outer ring and white inner ring).
3. RIGHT SIDE DETAILS CARD: Place a clean white rounded rectangular card box with a dashed or decorative border matching the theme color. Inside this box, render 4 cleanly aligned rows:
   - "Name    : ${studentName || ''}"
   - "Class   : ${classLine || ''}${rollLine}"
   - "Subject : ${subject || ''}"
   - "School  : ${schoolName || ''}"
   Each row has a clean horizontal underline beneath the text. The label titles (Name, Class, Subject, School) are bold and crisp in the theme accent color.
4. CORNER ART & CHARACTERS: Ensure cute themed cartoon characters and motifs (e.g. astronaut & rocket, supercar & checkered flags, princess & castle, superhero & action burst) wrap harmoniously around the photo circle and details card without obscuring the student face or text.
5. QUALITY: High resolution, sharp text, vibrant colors, premium school stationery print quality. No extra outer borders or margins outside the name slip card.

STYLE INSTRUCTIONS:
${stylePrompt ? stylePrompt : 'Make it vibrant, charming, child-friendly, and ultra-crisp. Text and underlines must be sharp and legible.'}`;

    // Build parts array
    const parts: object[] = [];

    if (backgroundBase64) {
      const bgMime = backgroundBase64.includes(';base64,')
        ? backgroundBase64.split(';base64,')[0].replace('data:', '')
        : 'image/jpeg';
      const bgData = backgroundBase64.includes(';base64,')
        ? backgroundBase64.split(';base64,')[1]
        : backgroundBase64;
      parts.push({ inline_data: { mime_type: bgMime, data: bgData } });
    }

    if (studentPhotoBase64) {
      const photoMime = studentPhotoBase64.includes(';base64,')
        ? studentPhotoBase64.split(';base64,')[0].replace('data:', '')
        : 'image/jpeg';
      const photoData = studentPhotoBase64.includes(';base64,')
        ? studentPhotoBase64.split(';base64,')[1]
        : studentPhotoBase64;
      parts.push({ inline_data: { mime_type: photoMime, data: photoData } });
    }

    parts.push({ text: compositionPrompt });

    // Try each Gemini image generation model
    for (const model of CANDIDATE_MODELS) {
      try {
        console.log(`[compose-slip] Trying model: ${model}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseModalities: ['IMAGE', 'TEXT'],
              temperature: 0.7,
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[compose-slip] ${model} failed ${response.status}: ${errText.slice(0, 300)}`);
          continue;
        }

        const data = await response.json();
        const responseParts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> =
          data?.candidates?.[0]?.content?.parts || [];

        for (const part of responseParts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            const composedSlipUrl = `data:${mime};base64,${part.inlineData.data}`;
            console.log(`[compose-slip] SUCCESS via ${model}`);
            return NextResponse.json({ composedSlipUrl });
          }
        }

        console.warn(`[compose-slip] ${model}: OK response but no image part`);
      } catch (err) {
        console.warn(`[compose-slip] Error with ${model}:`, err);
      }
    }

    return NextResponse.json(
      { error: 'Gemini image generation is currently unavailable. Your HTML overlay layout is still active.' },
      { status: 503 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[compose-slip] Unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Failed to compose name slip.' }, { status: 500 });
  }
}
