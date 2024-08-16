document.addEventListener("DOMContentLoaded", () => {
  // Get references to HTML elements
  const video = document.getElementById("video");
  const captureButton = document.getElementById("capture");
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  const capturedImageElement = document.getElementById("capturedImage");
  const extractedTextElement = document.getElementById("extractedText");
  const loadingElement = document.getElementById("loading");

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
      fetch("https://example.com/api/upload", {
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
