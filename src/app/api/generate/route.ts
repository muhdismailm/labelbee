import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Since the Gemini API key is on the Free Tier, Google restricts access to Imagen models.
    // To ensure you get beautiful AI generated backgrounds instantly and 100% free of charge,
    // we use Pollinations.ai (powered by Stable Diffusion XL) as a high-quality zero-cost API.
    const enhancedPrompt = `${prompt}, beautiful clean background pattern, aesthetic, vibrant colors, vector art style, high resolution, no text, no borders`;
    
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&nologo=true&private=true`;

    // Fetch the image and convert it to base64 to avoid CORS issues when generating the PDF
    const response = await fetch(pollinationsUrl);

    if (!response.ok) {
      console.error("Pollinations API Error");
      return NextResponse.json({ error: "Failed to generate image from AI." }, { status: 500 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    return NextResponse.json({ imageUrl: base64Image });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
