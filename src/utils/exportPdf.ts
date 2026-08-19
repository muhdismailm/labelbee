import { toJpeg } from "html-to-image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Detects if the current device is running iOS (iPhone, iPad, iPod) or iPadOS.
 */
const isIOS = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
};

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
 * Primary engine for iOS (and fallback for others): html2canvas.
 * Directly renders DOM trees onto a 2D HTML5 canvas without SVG foreignObject,
 * ensuring photos, text, and styles are preserved on iOS Safari.
 */
const captureWithHtml2Canvas = async (element: HTMLElement, elementId: string): Promise<string | null> => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Crisp ~1588x2246 A4 print resolution
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const printNode = clonedDoc.getElementById(elementId);
        if (printNode) {
          // Normalize dimensions and reset CSS transforms for clean A4 capture
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

          // Strip preview watermarks
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
    console.warn("[exportToPdf] html2canvas capture failed:", err);
  }
  return null;
};

/**
 * Engine for Desktop and Android: html-to-image.
 * Renders via SVG foreignObject with CSS style overrides.
 */
const captureWithHtmlToImage = async (element: HTMLElement): Promise<string | null> => {
  try {
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2,
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
    console.warn("[exportToPdf] html-to-image capture failed:", err);
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

  const ios = isIOS();
  let imgData: string | null = null;

  // On iOS, SVG foreignObject (html-to-image) drops images due to WebKit sandboxing.
  // We use html2canvas direct 2D canvas rendering first for iOS.
  if (ios) {
    imgData = await captureWithHtml2Canvas(element, elementId);
    if (!imgData) {
      imgData = await captureWithHtmlToImage(element);
    }
  } else {
    // On Desktop and Android, try html-to-image first, then html2canvas fallback
    imgData = await captureWithHtmlToImage(element);
    if (!imgData) {
      imgData = await captureWithHtml2Canvas(element, elementId);
    }
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

  // Save PDF - triggers native download / view prompt on iOS Safari and Desktop
  pdf.save(filename);
};
