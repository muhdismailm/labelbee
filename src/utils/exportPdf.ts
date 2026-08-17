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
  // iOS Safari canvas memory limit is strict (pixelRatio 2 produces ~1588x2246 px, avoiding canvas crashes)
  const pixelRatio = isIOS ? 2 : 2.5;

  // Temporarily reset transform for unscaled high-res capture
  const originalTransform = element.style.transform;
  const originalTransition = element.style.transition;

  try {
    element.style.transform = "none";
    element.style.transition = "none";

    // Wait for DOM layout repaint and asset readiness
    await new Promise((resolve) => setTimeout(resolve, 150));
    await ensureAssetsLoaded(element);

    // Warm-up pass for Safari/WebKit to bake foreignObject sub-resources into the rasterizer cache
    try {
      await toJpeg(element, {
        quality: 0.8,
        pixelRatio: 1,
        backgroundColor: "#ffffff",
      });
    } catch {
      // Warm-up pass is non-critical
    }

    const filterNode = (node: Node) => {
      if (node instanceof HTMLElement) {
        if (node.classList.contains("preview-watermark") || node.classList.contains("preview-watermark-overlay")) {
          return false;
        }
      }
      return true;
    };

    // High-resolution capture (strictly filtered for clean PDF output)
    let imgData = await toJpeg(element, {
      quality: 0.98,
      pixelRatio,
      backgroundColor: "#ffffff",
      cacheBust: true,
      filter: filterNode,
    });

    // If Safari returned an empty payload, retry once with fallback parameters
    if (!imgData || imgData.length < 5000) {
      console.warn("[exportToPdf] Retrying image capture for Safari/WebKit...");
      imgData = await toJpeg(element, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: filterNode,
      });
    }

    // Create a new jsPDF instance (A4 size: 210mm x 297mm, portrait)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

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
    // Always restore original scale transform
    element.style.transform = originalTransform;
    element.style.transition = originalTransition;
  }
};

