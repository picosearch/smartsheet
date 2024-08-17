const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const capturedImage = document.getElementById("captured-image");
const captureButton = document.getElementById("capture-button");
const processButton = document.getElementById("process-button");
const extractedTextArea = document.getElementById("extracted-text");
const uploadButton = document.getElementById("upload-button");

navigator.mediaDevices
  .getUserMedia({
    video: {
      facingMode: { exact: "environment" } // Use rear camera
    }
  })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Error accessing the camera:", err);
  });

captureButton.addEventListener("click", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");

  // Draw the video frame to the canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Apply basic contrast enhancement
  context.filter = "contrast(150%)";
  context.drawImage(canvas, 0, 0);

  const imageDataUrl = canvas.toDataURL("image/png");
  capturedImage.src = imageDataUrl;
  capturedImage.style.display = "block";

  processButton.disabled = false;
});

processButton.addEventListener("click", async () => {
  const image = capturedImage.src;

  try {
    const result = await Tesseract.recognize(image, "eng");
    extractedTextArea.value = result.data.text;
    uploadButton.disabled = false;
  } catch (error) {
    console.error("Error processing the image:", error);
  }
});

uploadButton.addEventListener("click", async () => {
  const extractedText = extractedTextArea.value;
  if (!extractedText) {
    alert("No text to upload!");
    return;
  }

  const spreadsheetId = "YOUR_SPREADSHEET_ID"; // Load this from your environment
  const apiKey = "YOUR_GOOGLE_SHEETS_API_KEY";
  const range = "Sheet1!A1"; // Adjust the range accordingly

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [[extractedText]] })
      }
    );

    if (response.ok) {
      alert("Text uploaded successfully!");
    } else {
      alert("Failed to upload text.");
    }
  } catch (error) {
    console.error("Error uploading the text:", error);
  }
});
