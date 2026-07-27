// Test all available Gemini image generation endpoints
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const tests = [
  // Imagen 3 via Vertex-style endpoint
  {
    name: "Imagen 3 (imagen-3.0-generate-002) - predict endpoint",
    url: `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
    body: {
      instances: [{ prompt: "a cute cartoon dog on a colorful background" }],
      parameters: { sampleCount: 1, aspectRatio: "1:1" }
    }
  },
  // Gemini 2.0 Flash image gen
  {
    name: "gemini-2.0-flash-preview-image-generation",
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`,
    body: {
      contents: [{ role: "user", parts: [{ text: "Generate an image of a cute cartoon dog background for a school name slip" }] }],
      generationConfig: { responseModalities: ["IMAGE"] }
    }
  },
  // Gemini 2.0 flash exp
  {
    name: "gemini-2.0-flash-exp",
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
    body: {
      contents: [{ role: "user", parts: [{ text: "Generate an image of a cute cartoon dog background" }] }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
    }
  },
  // Imagen 3.0 fast
  {
    name: "imagen-3.0-fast-generate-001",
    url: `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-fast-generate-001:predict?key=${GEMINI_API_KEY}`,
    body: {
      instances: [{ prompt: "a cute cartoon dog background" }],
      parameters: { sampleCount: 1 }
    }
  },
];

async function runTest(test) {
  console.log(`\n--- ${test.name} ---`);
  console.log("URL:", test.url.replace(GEMINI_API_KEY, "KEY_HIDDEN"));
  try {
    const res = await fetch(test.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(test.body),
      signal: AbortSignal.timeout(15000),
    });
    console.log("Status:", res.status, res.statusText);
    const text = await res.text();
    // Don't print full base64, just show structure
    const preview = text.length > 500 ? text.slice(0, 500) + "...[truncated]" : text;
    console.log("Response:", preview);

    // Try parse and check for image data
    try {
      const json = JSON.parse(text);
      // Check generateContent format
      const parts = json?.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const p of parts) {
          if (p.inlineData?.mimeType) {
            console.log("✓ IMAGE FOUND! mimeType:", p.inlineData.mimeType, "dataLength:", p.inlineData.data?.length);
          }
        }
      }
      // Check predict format (Imagen)
      const predictions = json?.predictions;
      if (predictions) {
        for (const pred of predictions) {
          if (pred.bytesBase64Encoded) {
            console.log("✓ IMAGEN IMAGE FOUND! length:", pred.bytesBase64Encoded.length, "mimeType:", pred.mimeType);
          }
        }
      }
    } catch (_) {}
  } catch (err) {
    console.error("Error:", err.message || err);
  }
}

async function main() {
  for (const test of tests) {
    await runTest(test);
    await new Promise(r => setTimeout(r, 2000)); // be gentle with rate limits
  }
}

main();
