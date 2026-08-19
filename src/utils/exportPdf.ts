import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ─── iOS Detection ────────────────────────────────────────────────────────────
// iOS Safari (and all iOS browsers which run on WebKit) have unique restrictions:
// - Hard canvas pixel budget (~16,777,216 px total = 4096×4096)
// - Blob URL download is unsupported — must use data URI in new tab
// - GPU compositing is async; needs a longer settle time before capture
const isIOS = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPad OS 13+ reports as "Macintosh" but has multi-touch
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
};

// ─── Canvas Blank-Page Validator ──────────────────────────────────────────────
// Reads a small sample of pixels from the canvas. Returns true if the canvas
// is non-blank (has at least one non-white pixel). A blank canvas means iOS
// silently failed to rasterize the content (memory limit exceeded, etc).
const isCanvasNonBlank = (canvas: HTMLCanvasElement): boolean => {
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    // Sample 20 points across the canvas
    const step = Math.floor(canvas.width / 5);
    for (let x = step; x < canvas.width - step; x += step) {
      for (let y = step; y < canvas.height - step; y += step) {
        const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
        // If any pixel is not pure white (255,255,255), content is present
        if (r < 250 || g < 250 || b < 250) return true;
      }
    }
    return false;
  } catch {
    // getImageData can throw if canvas is tainted (CORS) — treat as non-blank
    // to avoid false-positive blank detection
    return true;
  }
};

// ─── Asset Pre-loader ─────────────────────────────────────────────────────────
/**
 * Waits for all img elements and web fonts inside the target element to finish
 * loading. On iOS, GPU upload of bitmaps is async, so we add an extra delay.
 */
const ensureAssetsLoaded = async (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true);
        // 4s timeout — longer than before to account for slow iOS decoding
        setTimeout(() => resolve(true), 4000);
      });
    })
  );

  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font readiness errors
    }
  }
};

// ─── Clone Normalizer ─────────────────────────────────────────────────────────
/**
 * Prepares the cloned DOM node for pixel-perfect capture:
 * 1. Resets all CSS transforms so the A4 sheet is at its natural 794×1123px size.
 * 2. Strips the on-screen watermark overlay.
 * 3. Force-replaces img `src` with the same value to re-trigger WebKit decode
 *    inside the cloned document context (fixes missing photo on iOS).
 * 4. Converts `object-fit: cover` images to inline styles html2canvas understands.
 */
const normalizeCloneForCapture = (clonedDoc: Document, elementId: string): void => {
  const printNode = clonedDoc.getElementById(elementId);
  if (!printNode) return;

  // Reset the A4 container itself
  const resetStyles: Partial<CSSStyleDeclaration> = {
    transform: "none",
    transition: "none",
    position: "relative",
    top: "0",
    left: "0",
    margin: "0",
    boxShadow: "none",
    borderRadius: "0",
    width: "794px",
    height: "1123px",
    overflow: "visible",
  };
  Object.assign(printNode.style, resetStyles);

  // Also reset every ancestor up to <body> to clear any inherited transforms/clips
  let ancestor = printNode.parentElement;
  while (ancestor && ancestor !== clonedDoc.body) {
    ancestor.style.transform = "none";
    ancestor.style.overflow = "visible";
    ancestor.style.width = "794px";
    ancestor.style.height = "1123px";
    ancestor = ancestor.parentElement;
  }

  // Remove on-screen preview watermarks — they must not appear in the PDF
  printNode
    .querySelectorAll(".preview-watermark, .preview-watermark-overlay")
    .forEach((el) => el.remove());

  // Force-reload each img inside the clone by reassigning src.
  // On iOS WebKit, images in a cloned document don't always re-decode from
  // the data URI; this forces a fresh decode in the cloned context.
  const imgs = Array.from(printNode.querySelectorAll("img"));
  imgs.forEach((img) => {
    const src = img.getAttribute("src");
    if (src) {
      img.setAttribute("src", src);
      // html2canvas doesn't always honour object-fit: cover via CSS.
      // Inline the key properties so html2canvas picks them up correctly.
      img.style.objectFit = "cover";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.display = "block";
    }
    // Remove lazy loading, which can defer decode
    img.removeAttribute("loading");
    img.removeAttribute("decoding");
  });
};

// ─── html2canvas Capture ──────────────────────────────────────────────────────
/**
 * Captures the element with html2canvas at the specified scale.
 * Returns null if capture fails or the canvas is blank.
 */
const captureWithHtml2Canvas = async (
  element: HTMLElement,
  elementId: string,
  scale: number
): Promise<string | null> => {
  try {
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: false,          // MUST be false so canvas.toDataURL() is permitted
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 20000,        // 20s — iOS can be slow to decode large data URIs
      onclone: (clonedDoc) => normalizeCloneForCapture(clonedDoc, elementId),
    });

    // Validate: iOS can return a canvas that passes but is all white pixels
    if (!isCanvasNonBlank(canvas)) {
      console.warn(`[exportToPdf] Canvas at scale ${scale} is blank — skipping.`);
      return null;
    }

    return canvas.toDataURL("image/jpeg", 0.95);
  } catch (err) {
    console.warn(`[exportToPdf] html2canvas at scale ${scale} threw:`, err);
    return null;
  }
};

// ─── Main Export Function ─────────────────────────────────────────────────────
export const exportToPdf = async (
  elementId: string,
  filename: string = "name-slips.pdf"
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[exportToPdf] Element #${elementId} not found.`);
    return;
  }

  const ios = isIOS();

  // Wait for all images and fonts to load
  await ensureAssetsLoaded(element);

  // ── Settle Delay ────────────────────────────────────────────────────────────
  // iOS needs extra time for the GPU compositor to finish uploading decoded
  // image bitmaps. 100ms (old value) is insufficient; 600ms is reliable.
  const settleMs = ios ? 600 : 150;
  await new Promise((resolve) => setTimeout(resolve, settleMs));

  let imgData: string | null = null;

  // ── Attempt 1: Scale 1.5 ────────────────────────────────────────────────────
  // Scale 2 produces a ~1588×2246px canvas = ~14.3M pixels.
  // iOS WebKit's hard pixel budget is 16,777,216 pixels (4096×4096).
  // At scale 1.5 we get ~1191×1685px = ~2M pixels — well within budget, still
  // crisp enough for A4 print (150dpi effective resolution).
  imgData = await captureWithHtml2Canvas(element, elementId, 1.5);

  // ── Attempt 2: Scale 1 (safety fallback) ────────────────────────────────────
  // If scale 1.5 produces a blank canvas (very old / low-memory iOS device),
  // retry at scale 1 — always within the pixel budget.
  if (!imgData) {
    console.warn("[exportToPdf] Scale 1.5 failed. Retrying at scale 1...");
    await new Promise((resolve) => setTimeout(resolve, 300));
    imgData = await captureWithHtml2Canvas(element, elementId, 1);
  }

  // ── Give up if both attempts failed ────────────────────────────────────────
  if (!imgData) {
    throw new Error(
      "Could not capture the name slip. Your device may have limited memory. " +
        "Try refreshing the page and downloading again."
    );
  }

  // ── Build PDF ────────────────────────────────────────────────────────────────
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  // Fill the full A4 page (210mm × 297mm) with the captured image
  pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");

  // ── Download / Open PDF ──────────────────────────────────────────────────────
  if (ios) {
    // iOS Safari does NOT support Blob URL downloads (pdf.save() is a no-op or
    // opens a blank tab). Instead we open the PDF as a data URI in a new tab,
    // where the user can tap Share → "Save to Files" or "Print".
    const dataUri = pdf.output("datauristring");
    const newTab = window.open(dataUri, "_blank");
    if (!newTab) {
      // Pop-up was blocked — fall back to an in-page link click
      const a = document.createElement("a");
      a.href = dataUri;
      a.target = "_blank";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } else {
    // Desktop browsers (Chrome, Firefox, Safari, Edge) all support pdf.save()
    pdf.save(filename);
  }
};
