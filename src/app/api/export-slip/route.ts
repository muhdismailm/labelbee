import { NextRequest, NextResponse } from "next/server";
import { SlipData } from "@/types";
import { buildSlipSheetHtml } from "@/utils/templateHtmlBuilder";
import puppeteer, { Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import fs from "fs";

/**
 * Finds a suitable Chrome / Chromium executable path depending on the host OS.
 * Supports Windows / macOS (local dev) and Linux Serverless (Vercel / AWS).
 */
async function getExecutablePath(): Promise<string> {
  // 1. Check custom environment variable
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  // 2. Windows local dev auto-detection
  if (process.platform === "win32") {
    const candidatePaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
      `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe`,
      `${process.env.PROGRAMFILES}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
    ];

    for (const p of candidatePaths) {
      if (p && fs.existsSync(p)) {
        return p;
      }
    }
  }

  // 3. macOS local dev auto-detection
  if (process.platform === "darwin") {
    const macCandidates = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    ];
    for (const p of macCandidates) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
  }

  // 4. Default to remote or local @sparticuz/chromium on Linux / Serverless / Production
  const isArm = process.arch === "arm64";
  const defaultArchTar = isArm ? "chromium-v147.0.0-pack.arm64.tar" : "chromium-v147.0.0-pack.x64.tar";
  const remoteChromiumUrl =
    process.env.CHROMIUM_REMOTE_URL ||
    `https://github.com/Sparticuz/chromium/releases/download/v147.0.0/${defaultArchTar}`;

  try {
    return await chromium.executablePath(remoteChromiumUrl);
  } catch (err) {
    console.warn("Remote chromium download fallback to local binary path:", err);
    return await chromium.executablePath();
  }
}

export async function POST(req: NextRequest) {
  let browser: Browser | null = null;

  try {
    const body = await req.json();
    const { slipData, format = "pdf" } = body as {
      slipData: SlipData;
      format?: "pdf" | "png";
      userId?: string;
    };

    if (!slipData) {
      return NextResponse.json({ error: "Missing slipData payload." }, { status: 400 });
    }

    // 1. Build the standalone self-contained HTML for the A4 sheet
    const html = buildSlipSheetHtml(slipData);

    // 2. Resolve executable path
    const executablePath = await getExecutablePath();

    // 3. Launch headless browser
    const isLocalDev = process.platform === "win32" || process.platform === "darwin";

    browser = await puppeteer.launch({
      args: isLocalDev ? ["--no-sandbox", "--disable-setuid-sandbox"] : chromium.args,
      defaultViewport: {
        width: 794,
        height: 1123,
        deviceScaleFactor: 2,
      },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    // 4. Load the compiled HTML
    await page.setContent(html, {
      waitUntil: "load",
    });

    const rawName = slipData.studentName?.trim();
    const sanitizedName = rawName ? rawName.replace(/\s+/g, "-").toLowerCase() : "nameslip";

    if (format === "png") {
      // Capture crisp A4 PNG screenshot
      const pngBuffer = await page.screenshot({
        type: "png",
        fullPage: true,
      });

      return new NextResponse(pngBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${sanitizedName}-slips.png"`,
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    // Capture standard A4 PDF (210mm x 297mm)
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
      preferCSSPageSize: true,
    });

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${sanitizedName}-slips.pdf"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[/api/export-slip] Server-side render error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to render name slip on server.",
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
