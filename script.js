// ===============================
// GLOBAL VARIABLES
// ===============================
let processedImages = [];

// ===============================
// FILE INPUT HANDLING
// ===============================
const fileInput = document.getElementById("fileInput");
const previewContainer = document.getElementById("preview");

fileInput.addEventListener("change", handleFiles);

function handleFiles() {
  const files = fileInput.files;
  processedImages = [];
  previewContainer.innerHTML = "";

  if (files.length === 0) return;

  document.getElementById("fileCount").innerText = files.length + " files selected";

  Array.from(files).forEach(file => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const cropped = autoCropImage(img);

      processedImages.push(cropped);

      // Show preview
      const previewImg = document.createElement("img");
      previewImg.src = cropped;
      previewImg.style.width = "120px";
      previewImg.style.margin = "10px";
      previewContainer.appendChild(previewImg);
    };
  });
}

// ===============================
// AUTO CROP FUNCTION
// ===============================
function autoCropImage(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let top = 0, bottom = canvas.height;
  let left = 0, right = canvas.width;

  const threshold = 240;

  // TOP
  for (let y = 0; y < canvas.height; y++) {
    let isWhite = true;
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const avg = (data[i] + data[i+1] + data[i+2]) / 3;
      if (avg < threshold) {
        isWhite = false;
        break;
      }
    }
    if (!isWhite) {
      top = y;
      break;
    }
  }

  // BOTTOM
  for (let y = canvas.height - 1; y >= 0; y--) {
    let isWhite = true;
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const avg = (data[i] + data[i+1] + data[i+2]) / 3;
      if (avg < threshold) {
        isWhite = false;
        break;
      }
    }
    if (!isWhite) {
      bottom = y;
      break;
    }
  }

  // LEFT
  for (let x = 0; x < canvas.width; x++) {
    let isWhite = true;
    for (let y = 0; y < canvas.height; y++) {
      const i = (y * canvas.width + x) * 4;
      const avg = (data[i] + data[i+1] + data[i+2]) / 3;
      if (avg < threshold) {
        isWhite = false;
        break;
      }
    }
    if (!isWhite) {
      left = x;
      break;
    }
  }

  // RIGHT
  for (let x = canvas.width - 1; x >= 0; x--) {
    let isWhite = true;
    for (let y = 0; y < canvas.height; y++) {
      const i = (y * canvas.width + x) * 4;
      const avg = (data[i] + data[i+1] + data[i+2]) / 3;
      if (avg < threshold) {
        isWhite = false;
        break;
      }
    }
    if (!isWhite) {
      right = x;
      break;
    }
  }

  const width = right - left;
  const height = bottom - top;

  const newCanvas = document.createElement("canvas");
  newCanvas.width = width;
  newCanvas.height = height;

  const newCtx = newCanvas.getContext("2d");

  // Scanner effect
  newCtx.filter = "grayscale(100%) contrast(160%) brightness(110%)";

  newCtx.drawImage(
    canvas,
    left, top, width, height,
    0, 0, width, height
  );

  return newCanvas.toDataURL("image/jpeg", 0.9);
}

// ===============================
// PDF GENERATION
// ===============================
async function generatePDF() {
  if (processedImages.length === 0) {
    alert("Please upload images first!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  for (let i = 0; i < processedImages.length; i++) {
    const img = processedImages[i];

    if (i !== 0) pdf.addPage();

    pdf.addImage(img, "JPEG", 10, 10, 190, 0);
  }

  pdf.save("BillSnap.pdf");

  alert("✅ PDF Downloaded Successfully!");
}

// ===============================
// BUTTON CLICK
// ===============================
document.getElementById("downloadBtn").addEventListener("click", generatePDF);