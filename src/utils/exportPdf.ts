import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

/**
 * Checks if the current browser environment is running on iOS (iPhone, iPad, iPod)
 * or iPadOS (which identifies as MacIntel with touch points).
 */
const isIOSDevice = (): boolean => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

/**
 * Ensures all image elements and fonts inside the target container are fully loaded and decoded.
 */
const ensureAssetsLoaded = async (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true);
        setTimeout(() => resolve(true), 2500);
      });
    })
  );

  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font loading errors
    }
  }
};

export const exportToPdf = async (elementId: string, filename: string = "name-slips.pdf"): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  const isIOS = isIOSDevice();
  // Standard A4 pixel metrics at 96 DPI: 794px width x 1123px height
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;
  const pixelRatio = isIOS ? 2 : 2.5;

  // Create an isolated off-screen staging container
  // This completely eliminates mobile viewport clipping, parent CSS transforms, and scale distortion
  const offscreenContainer = document.createElement("div");
  offscreenContainer.style.position = "fixed";
  offscreenContainer.style.left = "-9999px";
  offscreenContainer.style.top = "0";
  offscreenContainer.style.width = `${A4_WIDTH}px`;
  offscreenContainer.style.height = `${A4_HEIGHT}px`;
  offscreenContainer.style.overflow = "hidden";
  offscreenContainer.style.zIndex = "-9999";
  offscreenContainer.style.pointerEvents = "none";
  offscreenContainer.style.backgroundColor = "#ffffff";

  // Deep clone the print container
  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = "print-container-export-clone";
  clone.style.transform = "none";
  clone.style.transition = "none";
  clone.style.position = "relative";
  clone.style.top = "0";
  clone.style.left = "0";
  clone.style.width = `${A4_WIDTH}px`;
  clone.style.height = `${A4_HEIGHT}px`;
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  clone.style.borderRadius = "0";
  clone.style.overflow = "hidden";
  clone.style.boxSizing = "border-box";

  // Remove any preview watermarks or overlays from the clone to guarantee clean output
  clone.querySelectorAll(".preview-watermark, .preview-watermark-overlay, [aria-hidden='true']").forEach((el) => {
    el.remove();
  });

  offscreenContainer.appendChild(clone);
  document.body.appendChild(offscreenContainer);

  try {
    // Wait for layout calculation and sub-assets in the clone
    await new Promise((resolve) => setTimeout(resolve, 150));
    await ensureAssetsLoaded(clone);

    // Warm-up pass for Safari/WebKit to bake foreignObject sub-resources into the rasterizer cache
    try {
      await toJpeg(clone, {
        quality: 0.8,
        pixelRatio: 1,
        width: A4_WIDTH,
        height: A4_HEIGHT,
        backgroundColor: "#ffffff",
      });
    } catch {
      // Warm-up pass is non-critical
    }

    // High-resolution capture from the isolated clone
    let imgData = await toJpeg(clone, {
      quality: 0.98,
      pixelRatio,
      width: A4_WIDTH,
      height: A4_HEIGHT,
      canvasWidth: Math.round(A4_WIDTH * pixelRatio),
      canvasHeight: Math.round(A4_HEIGHT * pixelRatio),
      backgroundColor: "#ffffff",
      cacheBust: true,
    });

    // If Safari returned an empty payload, retry once with fallback parameters
    if (!imgData || imgData.length < 5000) {
      console.warn("[exportToPdf] Retrying image capture for Safari/WebKit...");
      imgData = await toJpeg(clone, {
        quality: 0.95,
        pixelRatio: 2,
        width: A4_WIDTH,
        height: A4_HEIGHT,
        backgroundColor: "#ffffff",
      });
    }

    // Create a new jsPDF instance (A4 size: 210mm x 297mm, portrait)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // Map 1:1 onto standard A4 page
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");

    if (isIOS) {
      // iOS Safari does not support the HTML5 <a download> attribute on asynchronous Blob URLs.
      // We create an application/pdf Blob URL and open/navigate so Safari displays the native PDF reader
      // with full Share, "Save to Files", Print, and AirDrop functionality.
      const pdfBlob = pdf.output("blob");
      const pdfBlobUrl = URL.createObjectURL(pdfBlob);

      const downloadLink = document.createElement("a");
      downloadLink.href = pdfBlobUrl;
      downloadLink.target = "_blank";
      downloadLink.rel = "noopener noreferrer";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // If popup blocker prevents opening a new tab, navigate current window to the PDF blob directly
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = pdfBlobUrl;
        }
      }, 200);
    } else {
      // Desktop browsers (Chrome, Edge, Firefox, Desktop Safari)
      pdf.save(filename);
    }
  } catch (error) {
    console.error("[exportToPdf] Error generating PDF:", error);
    throw error;
  } finally {
    // Always clean up offscreen container
    if (offscreenContainer.parentNode) {
      offscreenContainer.parentNode.removeChild(offscreenContainer);
    }
  }
};

