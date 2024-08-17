document.addEventListener("DOMContentLoaded", () => {
  // Get references to HTML elements
  const video = document.getElementById("video");
  const captureButton = document.getElementById("capture");
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  const capturedImageElement = document.getElementById("capturedImage");
  const extractedTextElement = document.getElementById("extractedText");
  const loadingElement = document.getElementById("loading");
  const toggleCameraButton = document.getElementById("toggleCamera");
  let usingFrontCamera = false;

  // Constraints for the camera
  const constraints = {
    video: {
      facingMode: { exact: "environment" }, // Default to rear-facing camera
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    }
  };

  const switchCamera = () => {
    console.log("switchCamera ...");
    usingFrontCamera = usingFrontCamera;
    constraints.video.facingMode = usingFrontCamera
      ? "user"
      : { exact: "environment" };
    console.log("constraints ...", constraints);
    // Stop the current video stream
    // if (stream) {
    //   stream.getTracks().forEach((track) => track.stop());
    // }

    // Start the new stream with the updated constraints
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((newStream) => {
        stream = newStream;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error("Error accessing camera: ", err);
      });
  };

  // Initialize the camera
  // switchCamera();

  // Event listener for the toggle camera button
  // toggleCameraButton.addEventListener("click", switchCamera);

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
    // Show loading spinner
    loadingElement.style.display = "block";

    // Draw the video frame onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply basic contrast enhancement
    context.filter = "contrast(150%)";
    context.drawImage(canvas, 0, 0);

    // Convert the canvas image to a data URL
    const imageData = canvas.toDataURL("image/png");

    // Display the captured image on the page
    capturedImageElement.src = imageData;
    capturedImageElement.style.display = "block";

    let newImageData = processByOpenCV(capturedImageElement);

    // Use Tesseract.js to extract text from the image
    Tesseract.recognize(newImageData, "eng", {
      logger: (m) => console.log(m) // Log progress
    })
      .then(({ data: { text } }) => {
        console.log("Extracted Text: ", text);
        extractedTextElement.textContent = text || "No text found.";
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
  const captureButton = document.getElementById("capture");
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  const capturedImageElement = document.getElementById("capturedImage");
  const extractedTextElement = document.getElementById("extractedText");
  const loadingElement = document.getElementById("loading");
  const uploadButton = document.getElementById("upload");

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

  // Capture the image from the video stream and use Tesseract.js to extract text
  captureButton.addEventListener("click", () => {
    // Show loading spinner
    loadingElement.style.display = "block";

    // Draw the video frame onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to a data URL
    const imageData = canvas.toDataURL("image/png");

    // Display the captured image on the page
    capturedImageElement.src = imageData;
    capturedImageElement.style.display = "block";

    // Use Tesseract.js to extract text from the image
    Tesseract.recognize(imageData, "eng", {
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
