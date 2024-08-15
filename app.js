const player = document.getElementById("player");
const snapshotZone = document.getElementById("snapshot");
const captureButton = document.getElementById("capture");
const result = document.getElementById("result");

navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  player.srcObject = stream;
});

captureButton.addEventListener("click", function () {
  const context = snapshot.getContext("2d");
  context.drawImage(player, 0, 0, snapshotZone.width, snapshotZone.height);
  // Tesseract.recognize(snapshotZone, 'jpn', { logger: m => console.log(m) }) // 日本語
  Tesseract.recognize(snapshotZone, "eng", { logger: (m) => console.log(m) }) // 英語
    .then(({ data: { text } }) => {
      result.value = text;
    });
});
