const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const countdownEl = document.getElementById("countdown");
const statusEl = document.getElementById("status");

const photoCanvas = document.getElementById("photoCanvas");
const stripCanvas = document.getElementById("stripCanvas");

let photos = [];
let stream = null;

const SERVER_URL = "/print";
startBtn.addEventListener("click", startPhotobooth);

async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
    },
    audio: false,
  });

  video.srcObject = stream;
}

async function startPhotobooth() {
  try {
    startBtn.disabled = true;
    startBtn.style.display = "none";
    photos = [];

    statusEl.textContent = "Opening camera...";

    if (!stream) {
      await startCamera();
    }

    await wait(1000);

    for (let i = 0; i < 4; i++) {
      statusEl.textContent = `Photo ${i + 1} of 4`;
      await runCountdown(3);

      const photo = takePhoto();
      photos.push(photo);

      statusEl.textContent = "Captured!";
      await wait(700);
    }

    statusEl.textContent = "Creating strip...";
    const finalImage = await createStrip();

    statusEl.textContent = "Printing...";
    await sendToServer(finalImage);

    statusEl.textContent = "Grab your strip!";
    countdownEl.textContent = "";

    await wait(5000);
    resetApp();
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Something went wrong. Try again.";
    countdownEl.textContent = "";
    startBtn.disabled = false;
    startBtn.style.display = "block";
  }
}

function takePhoto() {
  const width = video.videoWidth;
  const height = video.videoHeight;

  photoCanvas.width = width;
  photoCanvas.height = height;

  const ctx = photoCanvas.getContext("2d");
  ctx.drawImage(video, 0, 0, width, height);

  return photoCanvas.toDataURL("image/png");
}

function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;

  let sx, sy, sw, sh;

  if (imgRatio > boxRatio) {
    sh = img.height;
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = img.width / boxRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

async function createStrip() {
  const canvasWidth = 1200;
  const canvasHeight = 1800;

  stripCanvas.width = canvasWidth;
  stripCanvas.height = canvasHeight;

  const ctx = stripCanvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = "#111111";
  ctx.font = "bold 70px Arial";
  ctx.textAlign = "center";
  ctx.fillText("TAMOOM", canvasWidth / 2, 100);

  const photoX = 170;
  const photoW = 860;
  const photoH = 330;

  const startY = 170;
  const gap = 35;

  for (let i = 0; i < photos.length; i++) {
    const img = await loadImage(photos[i]);
    const y = startY + i * (photoH + gap);

drawImageCover(ctx, img, photoX, y, photoW, photoH);  }

  ctx.fillStyle = "#111111";
  ctx.font = "36px Arial";
  ctx.fillText("Thank you for visiting Tamoom", canvasWidth / 2, 1720);

  return stripCanvas.toDataURL("image/png");
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load"));

    img.src = src;
  });
}

async function sendToServer(imageData) {
  const response = await fetch(SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: imageData,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error("Server failed to save image");
  }

  return result;
}

async function runCountdown(seconds) {
  for (let i = seconds; i > 0; i--) {
    countdownEl.textContent = i;
    await wait(1000);
  }

  countdownEl.textContent = "📸";
  await wait(300);
  countdownEl.textContent = "";
}

function resetApp() {
  photos = [];
  statusEl.textContent = "Tap Start";
  countdownEl.textContent = "";
  startBtn.disabled = false;
  startBtn.style.display = "block";
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}