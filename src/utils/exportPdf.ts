import html2canvas from "html2canvas";
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

  try {
    // Wait for all image bitmaps and fonts to be ready
    await ensureAssetsLoaded(element);
    await new Promise((resolve) => setTimeout(resolve, 100));

    // html2canvas renders directly to 2D Canvas context (immune to WebKit foreignObject sandbox image dropping)
    const canvas = await html2canvas(element, {
      scale: 2, // 2x DPI (~1588x2246 px) delivers crisp 300DPI-equivalent prints without exceeding mobile canvas memory
      useCORS: true,
      allowTaint: true,
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

          // Strip preview watermarks from the clone so output PDF is 100% clean
          printNode.querySelectorAll(".preview-watermark, .preview-watermark-overlay").forEach((el) => {
            el.remove();
          });
        }
      },
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);

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
  } catch (error) {
    console.error("[exportToPdf] Error generating PDF:", error);
    throw error;
  }
};

