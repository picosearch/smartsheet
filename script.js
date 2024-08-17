document.addEventListener("DOMContentLoaded", () => {
  // Get references to HTML elements
  const video = document.getElementById("video");
  const captureButton = document.getElementById("capture");
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  const capturedImageElement = document.getElementById("capturedImage");
  const extractedTextElement = document.getElementById("extractedText");
  const loadingElement = document.getElementById("loading");
  const clickSound = document.getElementById("click-sound");
  const processButton = document.getElementById("process_btn");
  const uploadButton = document.getElementById("upload");
  const contrastSlider = document.getElementById("contrast-slider");

  // Adjust contrast of the captured image
  contrastSlider.addEventListener("input", () => {
    const contrastValue = contrastSlider.value;
    capturedImage.style.filter = `contrast(${contrastValue}%)`;
  });

  // Constraints for the camera
  const constraints = {
    video: {
      facingMode: { exact: "environment" } // Default to rear-facing camera
    }
  };

  // Play click sound
  function playClickSound() {
    clickSound.play();
  }

  // Request access to the camera and stream it to the video element
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => {
      console.error("Error accessing camera: ", err);
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
    capturedImageElement.style.display = "block";
    processButton.style.display = "block";
  });

  processButton.addEventListener("click", () => {
    // Show loading spinner
    loadingElement.style.display = "block";

    // Use Tesseract.js to extract text from the image
    Tesseract.recognize(capturedImageElement, "eng", {
      logger: (m) => console.log(m) // Log progress
    })
      .then(({ data: { text } }) => {
        console.log("Extracted Text: ", text);
        extractedTextElement.textContent = text || "No text found.";
        uploadButton.style.display = "block"; // Show upload button
      })
      .catch((err) => {
        console.error("Error during text recognition: ", err);
        extractedTextElement.textContent = "Error during text recognition.";
      })
      .finally(() => {
        // Hide loading spinner
        loadingElement.style.display = "none";
      });
  });

  // Handle upload button click
  uploadButton.addEventListener("click", () => {
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

document.addEventListener("DOMContentLoaded", () => {
  // Get references to HTML elements
  const video = document.getElementById("video");

  // Request access to the camera and stream it to the video element
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => {
      console.error("Error accessing camera: ", err);
    });
});
