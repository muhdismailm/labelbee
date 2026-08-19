import { toJpeg } from "html-to-image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Ensures all image elements and web fonts inside the target element are loaded before capture.
 */
const ensureAssetsLoaded = async (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true);
        setTimeout(() => resolve(true), 3000);
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

/**
 * Capture using html-to-image (SVG foreignObject to Canvas / JPEG).
 * Excellent for maintaining high-fidelity text rendering and CSS styles without DOM mutation.
 */
const captureWithHtmlToImage = async (element: HTMLElement): Promise<string | null> => {
  try {
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2, // ~1588x2246 px crisp A4 resolution
      backgroundColor: "#ffffff",
      cacheBust: true,
      style: {
        transform: "none",
        transformOrigin: "top left",
        position: "relative",
        top: "0",
        left: "0",
        margin: "0",
      },
      filter: (node) => {
        if (node instanceof HTMLElement) {
          if (
            node.classList.contains("preview-watermark") ||
            node.classList.contains("preview-watermark-overlay")
          ) {
            return false;
          }
        }
        return true;
      },
    });

    if (dataUrl && dataUrl.length > 500) {
      return dataUrl;
    }
  } catch (err) {
    console.warn("[exportToPdf] html-to-image failed, trying html2canvas fallback:", err);
  }
  return null;
};

/**
 * Capture using html2canvas as primary/fallback engine.
 * Direct 2D canvas drawing on cloned document.
 */
const captureWithHtml2Canvas = async (element: HTMLElement, elementId: string): Promise<string | null> => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const printNode = clonedDoc.getElementById(elementId);
        if (printNode) {
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

          if (printNode.parentElement) {
            printNode.parentElement.style.width = "794px";
            printNode.parentElement.style.height = "1123px";
            printNode.parentElement.style.overflow = "visible";
            printNode.parentElement.style.transform = "none";
          }

          printNode.querySelectorAll(".preview-watermark, .preview-watermark-overlay").forEach((el) => {
            el.remove();
          });
        }
      },
    });

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    if (dataUrl && dataUrl.length > 500) {
      return dataUrl;
    }
  } catch (err) {
    console.warn("[exportToPdf] html2canvas also threw an error:", err);
  }
  return null;
};

export const exportToPdf = async (
  elementId: string,
  filename: string = "name-slips.pdf"
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[exportToPdf] Element #${elementId} not found.`);
    throw new Error("Preview element not found. Please refresh and try again.");
  }

  // Preload assets & wait for settlement
  await ensureAssetsLoaded(element);
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Try Engine 1: html-to-image
  let imgData = await captureWithHtmlToImage(element);

  // Try Engine 2: html2canvas fallback
  if (!imgData) {
    imgData = await captureWithHtml2Canvas(element, elementId);
  }

  if (!imgData) {
    throw new Error("Could not capture the name slip. Please check your internet connection or try again.");
  }

  // Build standard portrait A4 PDF (210mm x 297mm)
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");

  // Save PDF - triggers browser download
  pdf.save(filename);
};
