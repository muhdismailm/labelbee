import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

export const exportToPdf = async (elementId: string, filename: string = "name-slips.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Temporarily reset transform for unscaled high-res capture
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;
    element.style.transform = "none";
    element.style.transition = "none";

    // Small delay to allow DOM to layout without transform
    await new Promise((resolve) => setTimeout(resolve, 60));

    let imgData: string;
    try {
      // Generate JPEG from the element using html-to-image at 300 DPI
      imgData = await toJpeg(element, {
        quality: 1,
        pixelRatio: 3, // High resolution
        backgroundColor: "#ffffff",
      });
    } finally {
      // Always restore original scale transform
      element.style.transform = originalTransform;
      element.style.transition = originalTransition;
    }

    // Create a new jsPDF instance (A4 size, portrait)
    // A4 dimensions: 210 x 297 mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // The A4 aspect ratio is ~1.414. We want to fit the image on the A4 page perfectly.
    // Our preview container is styled as 210mm x 297mm, so it maps 1:1.
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

    // Download the PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
