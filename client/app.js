const captureIcon = document.getElementById("captureIcon");
const flash = document.getElementById("flash");

const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const printBtn = document.getElementById("printBtn");

const countdownEl = document.getElementById("countdown");
const shotText = document.getElementById("shotText");
const dotsEl = document.getElementById("dots");

const photoCanvas = document.getElementById("photoCanvas");
const stripCanvas = document.getElementById("stripCanvas");

const startScreen = document.getElementById("startScreen");
const cameraScreen = document.getElementById("cameraScreen");
const printScreen = document.getElementById("printScreen");
const finalScreen = document.getElementById("finalScreen");
const errorScreen = document.getElementById("errorScreen");

let photos = [];
let stream = null;
let finalImage = null;

const SERVER_URL = "/print";

startBtn.addEventListener("click", startPhotobooth);
// printBtn.addEventListener("click", printStrip);

function showScreen(screen) {
  [startScreen, cameraScreen, printScreen, finalScreen, errorScreen].forEach((s) => {
    s.classList.remove("active");
  });

  screen.classList.add("active");
}

async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
    },
    audio: false,
  });

  video.srcObject = stream;
}

function showCaptureFlash() {
  captureIcon.classList.add("show");

  flash.classList.remove("show");
  void flash.offsetWidth;
  flash.classList.add("show");
}

function hideCaptureIcon() {
  captureIcon.classList.remove("show");
}

async function startPhotobooth() {
  try {
    photos = [];
    finalImage = null;

    startBtn.disabled = true;
    showScreen(cameraScreen);

    if (!stream) {
      await startCamera();
    }

    await wait(1000);

    for (let i = 0; i < 4; i++) {
      updateShotUI(i);
      await runCountdown(3);

      showCaptureFlash();

        const photo = takePhoto();
        photos.push(photo);

        await wait(500);
        hideCaptureIcon();
    }

finalImage = await createStrip();

showScreen(finalScreen);

await sendToServer(finalImage);

await wait(7000);
resetApp();

  } catch (error) {
    console.error(error);
    showErrorAndReset();
  }
}

function updateShotUI(index) {
  shotText.textContent = `SHOT ${index + 1} OF 4`;

  dotsEl.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const dot = document.createElement("span");
    dot.className = i === index ? "dot active" : "dot";
    dotsEl.appendChild(dot);
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

async function createStrip() {
  const canvasWidth = 1200;
  const canvasHeight = 1800;

  stripCanvas.width = canvasWidth;
  stripCanvas.height = canvasHeight;

  const ctx = stripCanvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 5x15 strip centered inside 10x15 canvas
  const stripW = 520;
  const stripH = 1800;
  const stripX = (canvasWidth - stripW) / 2;
  const stripY = 0;

  // Left photo column
  const photoAreaX = stripX;
  const photoAreaY = 20;
  const photoAreaW = 350;
  const photoAreaH = 1760;

  // Right branding column
  const columnX = photoAreaX + photoAreaW;
  const columnW = stripW - photoAreaW;

  ctx.fillStyle = "#f6f4ef";
  ctx.fillRect(photoAreaX, stripY, photoAreaW, stripH);

  // Equal spacing between top / photos / bottom
  const gap = 5;
  const photoCount = 4;
  const photoW = photoAreaW;
  const photoH = (photoAreaH - gap * (photoCount - 1)) / photoCount;

  for (let i = 0; i < photos.length; i++) {
    const img = await loadImage(photos[i]);
    const x = photoAreaX;
    const y = photoAreaY + i * (photoH + gap);

    drawImageCover(ctx, img, x, y, photoW, photoH);
  }

  // Bood logo top-right
  try {
    const boodLogo = await loadImage("assets/bood-final-page.svg");

    drawImageContain(
      ctx,
      boodLogo,
      columnX + 42,
      65,
      75,
      95
    );
  } catch (error) {
    console.warn("bood-final-page.svg failed to load", error);
  }

  // Vertical text — bigger and closer to logos
  ctx.save();

  ctx.translate(columnX + 88, 900);
  ctx.rotate(-Math.PI / 2);

  ctx.fillStyle = "#111111";
  ctx.font = "36px Arial";
  ctx.textAlign = "center";

  ctx.fillText(
    "July 2026 | Tamoom's Third Birthday | Proof that you were here",
    0,
    0
  );

  ctx.restore();

  // Tamoom logo bottom-right
  try {
    const tamoomLogo = await loadImage("assets/final-photo-tamoom-logo.svg");

    drawImageContain(
      ctx,
      tamoomLogo,
      columnX + 35,
      1570,
      100,
      120
    );
  } catch (error) {
    console.warn("final-photo-tamoom-logo.svg failed to load", error);
  }

  return stripCanvas.toDataURL("image/png");
}

function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;

  let sx;
  let sy;
  let sw;
  let sh;

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

function drawImageContain(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;

  let drawW;
  let drawH;

  if (imgRatio > boxRatio) {
    drawW = w;
    drawH = w / imgRatio;
  } else {
    drawH = h;
    drawW = h * imgRatio;
  }

  const drawX = x + (w - drawW) / 2;
  const drawY = y + (h - drawH) / 2;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load"));

    img.src = src;
  });
}

// async function printStrip() {
//   try {
//     printBtn.disabled = true;
//     printBtn.textContent = "Printing...";

//     if (!finalImage) {
//       throw new Error("No final strip created");
//     }

//     await sendToServer(finalImage);

//     printBtn.textContent = "Tap to Print";
//     showScreen(finalScreen);

//     await wait(7000);
//     resetApp();

//   } catch (error) {
//     console.error(error);
//     showErrorAndReset();
//   }
// }

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

  countdownEl.textContent = "";
}

async function showErrorAndReset() {
  showScreen(errorScreen);
  await wait(5000);
  resetApp();
}

function resetApp() {
  photos = [];
  finalImage = null;
  countdownEl.textContent = "";

  startBtn.disabled = false;
  showScreen(startScreen);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}