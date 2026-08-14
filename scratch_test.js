// Test script for image generation endpoints
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

async function testPollinations() {
  console.log("\n--- Testing Pollinations AI (Primary) ---");
  const prompt = encodeURIComponent("Background image for a school name slip: cute cartoon dog. Colorful, vibrant");
  const url = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=800&seed=42&nologo=true`;
  console.log("URL:", url);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    console.log("Status:", res.status, "Type:", res.headers.get("content-type"));
    if (res.ok) {
      const buf = await res.arrayBuffer();
      console.log("✓ SUCCESS! Received image bytes:", buf.byteLength);
    } else {
      console.log("Response:", await res.text());
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function testGeminiModels() {
  if (!GEMINI_API_KEY) {
    console.log("\n--- Skipping Gemini API test (GEMINI_API_KEY not found) ---");
    return;
  }
  console.log("\n--- Testing Google Gemini API key ---");
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    console.log("List models status:", res.status);
    const data = await res.json();
    if (data.models) {
      console.log("✓ Key is valid! Available models count:", data.models.length);
    } else {
      console.log("Key response:", JSON.stringify(data));
    }
  } catch (err) {
    console.error("Gemini Error:", err.message);
  }
}

async function main() {
  await testPollinations();
  await testGeminiModels();
}

main();
