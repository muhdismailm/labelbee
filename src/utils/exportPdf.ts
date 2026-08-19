import { toJpeg, toPng } from "html-to-image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Detects if the current device is running iOS (iPhone, iPad, iPod) or iPadOS,
 * covering Safari, Chrome (CriOS), Firefox (FxiOS), and Edge on iOS.
 */
export const isIOS = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    /CriOS|FxiOS|EdgiOS/.test(ua) ||
    (ua.includes("Mac") && "ontouchend" in document)
  );
};

/**
 * Ensures all image elements and web fonts inside the target element are loaded and decoded before capture.
 */
const ensureAssetsLoaded = async (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        if ("decode" in img) {
          return img.decode().catch(() => true);
        }
        return Promise.resolve(true);
      }
      return new Promise((resolve) => {
        img.onload = () => {
          if ("decode" in img) {
            img.decode().then(() => resolve(true)).catch(() => resolve(true));
          } else {
            resolve(true);
          }
        };
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
 * Primary engine for iOS (Safari, Chrome) and fallback for others: html2canvas.
 * Directly renders DOM trees onto a 2D HTML5 canvas without SVG foreignObject,
 * ensuring photos, text, and styles are preserved on iOS WebKit browsers.
 */
const captureWithHtml2Canvas = async (
  element: HTMLElement,
  elementId: string,
  format: "jpeg" | "png" = "jpeg"
): Promise<string | null> => {
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

          // FIX FOR IOS SAFARI & IOS CHROME IMAGE DROPPING:
          // In WebKit (iOS), <img> tags in cloned iframes often fail to re-decode.
          // By converting each fully-loaded <img> from the live DOM into an in-memory <canvas>,
          // html2canvas copies the pixel buffers directly with 100% reliability and exact transforms.
          const sourceImages = Array.from(element.querySelectorAll("img"));
          const clonedImages = Array.from(printNode.querySelectorAll("img"));

          clonedImages.forEach((clonedImg, idx) => {
            const sourceImg = sourceImages[idx];
            if (sourceImg && sourceImg.complete && sourceImg.naturalWidth > 0) {
              try {
                const c = clonedDoc.createElement("canvas");
                c.width = sourceImg.naturalWidth;
                c.height = sourceImg.naturalHeight;
                const ctx = c.getContext("2d");
                if (ctx) {
                  ctx.drawImage(sourceImg, 0, 0);
                  // Retain className and style transforms (zoom, rotation, position offsets)
                  c.className = clonedImg.className;
                  c.style.cssText = clonedImg.style.cssText;
                  if (!c.style.width) c.style.width = "100%";
                  if (!c.style.height) c.style.height = "100%";
                  clonedImg.parentNode?.replaceChild(c, clonedImg);
                }
              } catch (e) {
                console.warn("[captureWithHtml2Canvas] Error converting image to canvas:", e);
              }
            }
          });
        }
      },
    });

    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    const dataUrl = canvas.toDataURL(mimeType, format === "png" ? undefined : 0.95);
    if (dataUrl && dataUrl.length > 500) {
      return dataUrl;
    }
  } catch (err) {
    console.warn("[captureWithHtml2Canvas] html2canvas capture failed:", err);
  }
  return null;
};

/**
 * Engine for Desktop and Android: html-to-image.
 * Renders via SVG foreignObject with CSS style overrides.
 */
const captureWithHtmlToImage = async (
  element: HTMLElement,
  format: "jpeg" | "png" = "jpeg"
): Promise<string | null> => {
  try {
    const captureFn = format === "png" ? toPng : toJpeg;
    const dataUrl = await captureFn(element, {
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
    console.warn("[captureWithHtmlToImage] html-to-image capture failed:", err);
  }
  return null;
};

/**
 * Helper to download a base64 Data URL as a file across modern and mobile browsers (iOS Safari, iOS Chrome, Android, Desktop).
 */
export const downloadDataUrl = (dataUrl: string, filename: string): void => {
  try {
    const parts = dataUrl.split(",");
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const byteString = atob(parts[1]);
    const u8arr = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      u8arr[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([u8arr], { type: mime });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (err) {
    console.warn("[downloadDataUrl] Blob download fallback to data URL link:", err);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 2000);
  }
};

/**
 * Exports the specified DOM container as a standard portrait A4 PDF (210mm x 297mm).
 */
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

  // On iOS (Safari & Chrome), SVG foreignObject (html-to-image) drops images due to WebKit sandboxing.
  // We use html2canvas direct 2D canvas rendering first for iOS with canvas-backed image inlining.
  if (ios) {
    imgData = await captureWithHtml2Canvas(element, elementId, "jpeg");
    if (!imgData) {
      imgData = await captureWithHtmlToImage(element, "jpeg");
    }
  } else {
    // On Desktop and Android, try html-to-image first, then html2canvas fallback
    imgData = await captureWithHtmlToImage(element, "jpeg");
    if (!imgData) {
      imgData = await captureWithHtml2Canvas(element, elementId, "jpeg");
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

  // Save PDF - triggers native download / view prompt on iOS Safari/Chrome and Desktop
  pdf.save(filename);
};

/**
 * Exports the specified DOM container as a high-resolution A4 PNG image (~1588x2246 px).
 */
export const exportToPng = async (
  elementId: string,
  filename: string = "name-slips.png"
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[exportToPng] Element #${elementId} not found.`);
    throw new Error("Preview element not found. Please refresh and try again.");
  }

  // Preload assets & wait for settlement
  await ensureAssetsLoaded(element);
  await new Promise((resolve) => setTimeout(resolve, 200));

  const ios = isIOS();
  let imgData: string | null = null;

  // On iOS (Safari & Chrome), use html2canvas with direct pixel inlining first
  if (ios) {
    imgData = await captureWithHtml2Canvas(element, elementId, "png");
    if (!imgData) {
      imgData = await captureWithHtmlToImage(element, "png");
    }
  } else {
    imgData = await captureWithHtmlToImage(element, "png");
    if (!imgData) {
      imgData = await captureWithHtml2Canvas(element, elementId, "png");
    }
  }

  if (!imgData) {
    throw new Error("Could not generate PNG image. Please try again.");
  }

  downloadDataUrl(imgData, filename);
};

