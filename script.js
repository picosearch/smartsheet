document.addEventListener("DOMContentLoaded", () => {
  // Get references to HTML elements
  const video = document.getElementById("video");
  const captureButton = document.getElementById("capture");
  const retakeButton = document.getElementById("re-take");
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  const capturedImageElement = document.getElementById("capturedImage");
  const extractedTextElement = document.getElementById("extractedText");
  const clickSound = document.getElementById("click-sound");
  const processButton = document.getElementById("process_btn");
  const uploadButton = document.getElementById("upload");
  const rocketIcon = document.getElementById("rocket");
  const copyButton = document.getElementById("copy");
  const resultPanel = document.getElementById("result-panel");
  const uploadIcon = document.getElementById("upload-icon");

  // Constraints for the camera
  const constraints = {
    video: {
      facingMode: { exact: "environment" } // Default to rear-facing camera
    }
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const constraints_laptop = {
    video: {
      facingMode: "user" // Default to rear-facing camera
    }
  };

  // Play click sound
  function playClickSound() {
    clickSound.play();
  }

  // Request access to the camera and stream it to the video element
  navigator.mediaDevices
    .getUserMedia(isMobile ? constraints : constraints_laptop)
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => {
      console.error("Error accessing camera: ", err);
    });

  retakeButton.addEventListener("click", () => {
    video.style.display = "block";
    captureButton.style.display = "block";
    retakeButton.style.display = "none";
    capturedImageElement.style.display = "none";
    copyButton.style.display = "none";
    resultPanel.style.display = "none";
  });
  // Capture the image from the video stream and use Tesseract.js to extract text
  captureButton.addEventListener("click", () => {
    playClickSound();
    // Draw the video frame onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply basic contrast enhancement
    // context.filter = "contrast(170%)";
    context.drawImage(canvas, 0, 0);

    // Convert the canvas image to a data URL
    const imageData = canvas.toDataURL("image/png");

    // Display the captured image on the page
    capturedImageElement.src = imageData;
    video.style.display = "none";
    captureButton.style.display = "none";
    retakeButton.style.display = "block";
    capturedImageElement.style.display = "block";

    resultPanel.style.display = "block";
    processButton.style.display = "block";
  });

  processButton.addEventListener("click", () => {
    // Show loading spinner
    // loadingElement.style.display = "block";
    rocketIcon.className = "fas fa-spin fa-arrows-rotate";

    // Use Tesseract.js to extract text from the image
    Tesseract.recognize(capturedImageElement, "eng", {
      logger: (m) => console.log(m) // Log progress
    })
      .then(({ data: { text } }) => {
        console.log("Extracted Text: ", text);
        extractedTextElement.textContent = text || "No text found.";
        uploadButton.style.display = "block"; // Show upload button
        copyButton.style.display = "block";
      })
      .catch((err) => {
        console.error("Error during text recognition: ", err);
        extractedTextElement.textContent = "Error during text recognition.";
      })
      .finally(() => {
        // Hide loading spinner
        // loadingElement.style.display = "none";
        // rocketIcon.style.display = "block";
        rocketIcon.className = "fas fa-rocket";
      });
  });

  // Copy text to clipboard
  copyButton.addEventListener("click", () => {
    const textToCopy = extractedTextElement.textContent;
    if (textToCopy) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          alert("Text copied to clipboard!");
        })
        .catch((err) => {
          console.error("Error copying text:", err);
        });
    } else {
      alert("No text to copy!");
    }
  });

  // Handle upload button click
  uploadButton.addEventListener("click", () => {
    uploadIcon.className = "fas fa-spin fa-arrows-rotate";
    const text = extractedTextElement.textContent;

    if (
      text &&
      text.trim() !== "No text found." &&
      text.trim() !== "Error during text recognition."
    ) {
      // Perform API request to upload the data
      fetch("https://smartsheetdata.glitch.me/upload", {
        // Replace with your API endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          alert("Text uploaded successfully!");
          uploadIcon.className = "fas fa-arrow-up-from-bracket";
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error uploading text.");
        });
    } else {
      alert("No text available for upload.");
    }
  });
});

function processByOpenCV(capturedImage) {
  const src = cv.imread(capturedImage);
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const edged = new cv.Mat();
  const dst = new cv.Mat();

  try {
    // Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    // Apply Gaussian Blur to reduce noise and improve edge detection
    const ksize = new cv.Size(5, 5);
    cv.GaussianBlur(gray, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);

    // Perform Canny edge detection
    cv.Canny(blurred, edged, 75, 200);

    // Apply adaptive thresholding to enhance text clarity
    cv.adaptiveThreshold(
      edged,
      dst,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      11,
      2
    );

    // Convert the processed image back to the canvas
    cv.imshow(canvas, dst);

    // Prepare the image for OCR
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error processing the image:", error);
  } finally {
    // Clean up
    src.delete();
    gray.delete();
    blurred.delete();
    edged.delete();
    dst.delete();
  }
}
