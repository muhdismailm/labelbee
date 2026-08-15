import { NextResponse } from 'next/server';

interface GeminiThemeResponse {
  colorTheme: string;
  template: 'classic' | 'modern' | 'playful' | 'unicorn' | 'doodle';
  themeDescription: string;
  themeAdvice?: string;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { error: 'Image data is required.' },
        { status: 400 }
      );
    }

    // Extract mime type and raw base64 data
    let mimeType = 'image/jpeg';
    let base64Data = imageBase64;

    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      const mimeMatch = parts[0].match(/:(.*?)$/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
      base64Data = parts[1];
    }

    const prompt = `You are an expert graphic designer for educational name slips and school notebook labels. Analyze this uploaded template background image (which may feature themes like Space Astronaut, Racing Supercar, Princess Castle, Superhero Comic, Cartoon Animals, etc.).
Determine:
1. "colorTheme": A complementary, high-contrast primary hex color (e.g. #1e3a8a, #dc2626, #db2777, #0284c7, #7c3aed, #059669, #d97706) from the image palette that will make student text labels (Name, Class, Subject, School), photo frame ring, and lines look bold, crisp, and vibrant against this background.
2. "template": Choose the single most fitting design template layout from only these 5 options:
   - "modern" (for racing, geometric, sports, abstract, or sleek corporate/school backgrounds)
   - "playful" (for superhero, comic, vibrant cartoon, animal, or action backgrounds)
   - "unicorn" (for princess, pastel, rainbow, magic, castle, fairytale, or soft backgrounds)
   - "classic" (for formal, certificate, navy border, or academic backgrounds)
   - "doodle" (for space, sketch, handwriting, notebook, cute craft, or starry backgrounds)
3. "themeDescription": A concise 2-4 word title characterizing this theme (e.g. "Cosmic Space Explorer", "High-Speed Supercar", "Royal Princess Castle", "Comic Action Hero").
4. "themeAdvice": A brief 1-sentence tip on how student details harmonize with this background.

Return strictly a JSON object with these keys and no markdown or backticks:
{"colorTheme": "#...", "template": "...", "themeDescription": "...", "themeAdvice": "..."}`;

    // Candidate Gemini models to try in order
    const candidateModels = [
      'gemini-2.0-flash',
      'gemini-2.0-flash-exp',
      'gemini-2.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
    ];

    let resultJson: GeminiThemeResponse | null = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.2,
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[Gemini Theme API] Model ${model} returned ${response.status}: ${errText}`);
          continue;
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (rawText) {
          // Clean possible markdown code fences
          const cleanedText = rawText.replace(/```json\n?|```/g, '').trim();
          const parsed = JSON.parse(cleanedText);

          // Validate and sanitize template
          const validTemplates = ['classic', 'modern', 'playful', 'unicorn', 'doodle'];
          const template = validTemplates.includes(parsed.template?.toLowerCase())
            ? (parsed.template.toLowerCase() as GeminiThemeResponse['template'])
            : 'modern';

          // Validate color hex
          const colorTheme = /^#[0-9A-Fa-f]{6}$/.test(parsed.colorTheme)
            ? parsed.colorTheme
            : '#4f46e5';

          resultJson = {
            colorTheme,
            template,
            themeDescription: parsed.themeDescription || 'Custom AI Harmonized Theme',
            themeAdvice: parsed.themeAdvice || 'Adjusted colors and layout for optimal contrast.',
          };
          break;
        }
      } catch (err) {
        console.warn(`[Gemini Theme API] Error with ${model}:`, err);
      }
    }

    if (!resultJson) {
      // Fallback heuristics if Gemini service is temporarily unreachable
      resultJson = {
        colorTheme: '#6366f1',
        template: 'modern',
        themeDescription: 'Custom Uploaded Template',
        themeAdvice: 'Applied modern accent layout for your background.',
      };
    }

    return NextResponse.json(resultJson);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Gemini Theme API] Unexpected error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to analyze theme.' },
      { status: 500 }
    );
  }
}
