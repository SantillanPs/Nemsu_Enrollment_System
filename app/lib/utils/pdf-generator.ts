import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generates a PDF from an HTML element
 * @param element The HTML element to convert to PDF
 * @param filename The name of the PDF file
 */
export const generatePDF = async (
  element: HTMLElement,
  filename: string = "certificate.pdf"
): Promise<void> => {
  try {
    // Create a canvas from the HTML element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable CORS for images
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Calculate the PDF dimensions (A4 size)
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create a new PDF document
    const pdf = new jsPDF("p", "mm", "a4");
    
    // Add the canvas as an image to the PDF
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      imgWidth,
      imgHeight
    );
    
    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

/**
 * Generates a Certificate of Registration PDF
 * @param studentName The student's full name
 */
export const generateCertificateOfRegistration = async (
  studentName: string
): Promise<void> => {
  // Get the certificate container element
  const element = document.getElementById("certificate-container");
  
  if (!element) {
    throw new Error("Certificate container element not found");
  }
  
  // Generate the PDF
  await generatePDF(
    element,
    `Certificate_of_Registration_${studentName.replace(/\s+/g, "_")}.pdf`
  );
};
