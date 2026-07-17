```js
import jsPDF from "jspdf";

// ============================
// BILLSNAP SCRIPT.JS
// ============================

const fileInput = document.getElementById("fileInput");
const previewContainer = document.getElementById("previewContainer");
const generateBtn = document.getElementById("generatePDF");

let processedImages = [];

// ============================
// IMAGE UPLOAD + PREVIEW
// ============================

fileInput.addEventListener("change", async (e) => {
  const files = e.target.files;

  if (!files.length) {
    alert("No files selected");
    return;
  }

  previewContainer.innerHTML = "";
  processedImages = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const base64 = await convertToBase64(file);

    processedImages.push(base64);

    // Preview Image
    const img = document.createElement("img");
    img.src = base64;

    img.style.width = "120px";
    img.style.height = "160px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "12px";
    img.style.margin = "10px";
    img.style.border = "2px solid #4da3ff";

    previewContainer.appendChild(img);
  }

  console.log("Processed Images:", processedImages);
});

// ============================
// CONVERT IMAGE TO BASE64
// ============================

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
}

// ============================
// GENERATE PDF
// ============================

generateBtn.addEventListener("click", generatePDF);

async function generatePDF() {
  try {
    if (!processedImages || processedImages.length === 0) {
      alert("No images uploaded!");
      return;
    }

    generateBtn.innerText = "Preparing PDF...";

    const pdf = new jsPDF();

    for (let i = 0; i < processedImages.length; i++) {
      const img = processedImages[i];

      if (!img) continue;

      if (i !== 0) {
        pdf.addPage();
      }

      pdf.addImage(img, "JPEG", 10, 10, 190, 250);
    }

    pdf.save("BillSnap.pdf");

    generateBtn.innerText = "PDF Downloaded ✅";

    alert("PDF Generated Successfully!");

  } catch (error) {
    console.error(error);

    alert("PDF Error: " + error.message);

    generateBtn.innerText = "Generate PDF";
  }
}
```
