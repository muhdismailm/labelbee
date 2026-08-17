import html2canvas from "html2canvas";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

/**
 * Ensures all image elements and fonts inside the target element are loaded before capture.
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
      // Ignore font readiness errors
    }
  }
};

export const exportToPdf = async (elementId: string, filename: string = "name-slips.pdf"): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  // Ensure assets are loaded
  await ensureAssetsLoaded(element);
  await new Promise((resolve) => setTimeout(resolve, 100));

  let imgData: string | null = null;

  // Primary Engine: html2canvas (Direct 2D Canvas rendering - preserves images on iOS without foreignObject sandbox dropping)
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // ~1588x2246 px crisp A4 resolution
      useCORS: true,
      allowTaint: false, // Critical: allowTaint must be false so canvas.toDataURL() is permitted
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const printNode = clonedDoc.getElementById(elementId);
        if (printNode) {
          // Reset transform and scaling on the clone for clean, unclipped A4 layout
          printNode.style.transform = "none";
          printNode.style.transition = "none";
          printNode.style.position = "relative";
          printNode.style.top = "0";
          printNode.style.left = "0";
          printNode.style.margin = "0";
          printNode.style.boxShadow = "none";
          printNode.style.borderRadius = "0";
          printNode.style.width = "794px";
          printNode.style.height = "1123px";

          // Expand parent in clone so no mobile container clipping occurs
          if (printNode.parentElement) {
            printNode.parentElement.style.width = "794px";
            printNode.parentElement.style.height = "1123px";
            printNode.parentElement.style.overflow = "visible";
          }

          // Strip preview watermarks from the clone so output PDF is 100% clean
          printNode.querySelectorAll(".preview-watermark, .preview-watermark-overlay").forEach((el) => {
            el.remove();
          });
        }
      },
    });

    imgData = canvas.toDataURL("image/jpeg", 0.98);
  } catch (canvasErr) {
    console.warn("[exportToPdf] html2canvas failed, attempting html-to-image fallback...", canvasErr);
  }

  // Fallback Engine: html-to-image (toJpeg) if html2canvas was blocked
  if (!imgData || imgData.length < 5000) {
    try {
      const originalTransform = element.style.transform;
      element.style.transform = "none";
      await new Promise((resolve) => setTimeout(resolve, 80));

      imgData = await toJpeg(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
        filter: (node) => {
          if (node instanceof HTMLElement) {
            if (node.classList.contains("preview-watermark") || node.classList.contains("preview-watermark-overlay")) {
              return false;
            }
          }
          return true;
        },
      });

      element.style.transform = originalTransform;
    } catch (toJpegErr) {
      console.error("[exportToPdf] html-to-image fallback also failed:", toJpegErr);
      throw toJpegErr;
    }
  }

  if (!imgData) {
    throw new Error("Failed to capture name slip image data for PDF.");
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

  // Standard pdf.save() triggers native browser download confirmation prompt on iOS Safari and Desktop
  pdf.save(filename);
};

