import { SlipData } from "@/types";
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
 * Helper to download a Blob as a file in modern and mobile browsers.
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
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
  }, 2500);
};

/**
 * Helper to download a base64 Data URL as a file.
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
    downloadBlob(blob, filename);
  } catch (err) {
    console.warn("[downloadDataUrl] Fallback to direct anchor download:", err);
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
 * Server-Side Rendered (SSR) PDF Export.
 * Sends the in-memory SlipData payload to `/api/export-slip` and downloads the resulting binary PDF.
 */
export const exportServerPdf = async (
  data: SlipData,
  filename: string = "name-slips.pdf"
): Promise<void> => {
  const res = await fetch("/api/export-slip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      slipData: data,
      format: "pdf",
    }),
  });

  if (!res.ok) {
    let errorMsg = "Server failed to generate PDF.";
    try {
      const errJson = await res.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const blob = await res.blob();
  downloadBlob(blob, filename);
};

/**
 * Server-Side Rendered (SSR) PNG Export.
 * Sends the in-memory SlipData payload to `/api/export-slip` and downloads the resulting high-res PNG.
 */
export const exportServerPng = async (
  data: SlipData,
  filename: string = "name-slips.png"
): Promise<void> => {
  const res = await fetch("/api/export-slip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      slipData: data,
      format: "png",
    }),
  });

  if (!res.ok) {
    let errorMsg = "Server failed to generate PNG.";
    try {
      const errJson = await res.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const blob = await res.blob();
  downloadBlob(blob, filename);
};

/**
 * Client-Side Fallback Capture via html2canvas.
 */
const captureWithHtml2Canvas = async (
  element: HTMLElement,
  elementId: string,
  format: "jpeg" | "png" = "jpeg"
): Promise<string | null> => {
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
    return canvas.toDataURL(mimeType, format === "png" ? undefined : 0.95);
  } catch (err) {
    console.warn("[captureWithHtml2Canvas] html2canvas capture failed:", err);
    return null;
  }
};

/**
 * Client-side fallback capture via html-to-image.
 */
const captureWithHtmlToImage = async (
  element: HTMLElement,
  format: "jpeg" | "png" = "jpeg"
): Promise<string | null> => {
  try {
    const captureFn = format === "png" ? toPng : toJpeg;
    return await captureFn(element, {
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
  } catch (err) {
    console.warn("[captureWithHtmlToImage] html-to-image capture failed:", err);
    return null;
  }
};

/**
 * Primary PDF Export with Server-Side Rendering (SSR) & Client-Side Fallback.
 */
export const exportToPdf = async (
  elementIdOrData: string | SlipData,
  filename: string = "name-slips.pdf"
): Promise<void> => {
  // If SlipData object is passed, attempt Server-Side Rendering first
  if (typeof elementIdOrData === "object" && elementIdOrData !== null) {
    try {
      await exportServerPdf(elementIdOrData, filename);
      return;
    } catch (err) {
      console.warn("[exportToPdf] SSR export failed, attempting client fallback:", err);
    }
  }

  // Fallback to DOM capture
  const elementId = typeof elementIdOrData === "string" ? elementIdOrData : "print-container";
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Could not find preview element to generate PDF.");
  }

  await ensureAssetsLoaded(element);
  await new Promise((resolve) => setTimeout(resolve, 200));

  let imgData: string | null = null;
  if (isIOS()) {
    imgData = await captureWithHtml2Canvas(element, elementId, "jpeg");
    if (!imgData) imgData = await captureWithHtmlToImage(element, "jpeg");
  } else {
    imgData = await captureWithHtmlToImage(element, "jpeg");
    if (!imgData) imgData = await captureWithHtml2Canvas(element, elementId, "jpeg");
  }

  if (!imgData) {
    throw new Error("Could not capture name slip.");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
  pdf.save(filename);
};

/**
 * Primary PNG Export with Server-Side Rendering (SSR) & Client-Side Fallback.
 */
export const exportToPng = async (
  elementIdOrData: string | SlipData,
  filename: string = "name-slips.png"
): Promise<void> => {
  // If SlipData object is passed, attempt Server-Side Rendering first
  if (typeof elementIdOrData === "object" && elementIdOrData !== null) {
    try {
      await exportServerPng(elementIdOrData, filename);
      return;
    } catch (err) {
      console.warn("[exportToPng] SSR export failed, attempting client fallback:", err);
    }
  }

  // Fallback to DOM capture
  const elementId = typeof elementIdOrData === "string" ? elementIdOrData : "print-container";
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Could not find preview element to generate PNG.");
  }

  await ensureAssetsLoaded(element);
  await new Promise((resolve) => setTimeout(resolve, 200));

  let imgData: string | null = null;
  if (isIOS()) {
    imgData = await captureWithHtml2Canvas(element, elementId, "png");
    if (!imgData) imgData = await captureWithHtmlToImage(element, "png");
  } else {
    imgData = await captureWithHtmlToImage(element, "png");
    if (!imgData) imgData = await captureWithHtml2Canvas(element, elementId, "png");
  }

  if (!imgData) {
    throw new Error("Could not generate PNG image.");
  }

  downloadDataUrl(imgData, filename);
};
