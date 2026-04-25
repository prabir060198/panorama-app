// ================= CONFIG =================
const CONFIG = {
  holdTime: 1000,
  alignThreshold: 5,
  sensitivity: 3,
};

// ================= ELEMENTS =================
const video = document.getElementById("camera");
const targetEl = document.getElementById("target");
const progressEl = document.getElementById("progress");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");

// ================= STATE =================
let targets = [];
let currentIndex = 0;
let currentTarget = null;
let holdStart = 0;

// ================= INIT =================
function initTargets() {
  const yaws = [0, 60, 120, 180, 240, 300];
  const pitches = [0, 45, -45];

  targets = [];

  pitches.forEach(p => {
    yaws.forEach(y => {
      targets.push({ yaw: y, pitch: p });
    });
  });

  currentTarget = targets[0];
}

// ================= CAMERA =================
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });
  video.srcObject = stream;
}

// ================= GYRO =================
function startGyro() {
  window.addEventListener("deviceorientation", handleOrientation, true);
}

function handleOrientation(e) {
  if (e.alpha == null) return;

  updateGuide(e.alpha, e.beta);
}

// ================= GUIDE =================
function updateGuide(yaw, pitch) {
  const dy = normalizeAngle(currentTarget.yaw - yaw);
  const dp = currentTarget.pitch - pitch;

  moveTarget(dy, dp);

  const distance = Math.sqrt(dy * dy + dp * dp);

  if (distance < CONFIG.alignThreshold) {
    onAligned();
  } else {
    onNotAligned();
  }
}

// ================= UI UPDATES =================
function moveTarget(dy, dp) {
  const x = dy * CONFIG.sensitivity;
  const y = dp * CONFIG.sensitivity;

  targetEl.style.transform = `translate(${x}px, ${y}px)`;
}

function onAligned() {
  targetEl.style.background = "lime";

  if (!holdStart) holdStart = Date.now();

  const elapsed = Date.now() - holdStart;

  updateProgress(elapsed);

  statusEl.innerText = "Hold steady...";

  if (elapsed > CONFIG.holdTime) {
    captureImage();
    nextTarget();
    resetProgress();
  }
}

function onNotAligned() {
  targetEl.style.background = "red";
  holdStart = 0;
  resetProgress();

  statusEl.innerText = "Align dot to center";
}

function updateProgress(time) {
  const deg = (time / CONFIG.holdTime) * 360;
  progressEl.style.transform = `translate(-50%,-50%) rotate(${deg}deg)`;
}

function resetProgress() {
  progressEl.style.transform = `translate(-50%,-50%) rotate(0deg)`;
}

// ================= CAPTURE =================
function captureImage() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  downloadImage(canvas);
}

function downloadImage(canvas) {
  const link = document.createElement("a");
  link.download = `capture_${currentIndex}.jpg`;
  link.href = canvas.toDataURL("image/jpeg");
  link.click();
}

// ================= FLOW =================
function nextTarget() {
  currentIndex++;

  if (currentIndex >= targets.length) {
    statusEl.innerText = "Capture Complete ✅";
    return;
  }

  currentTarget = targets[currentIndex];
  holdStart = 0;
}

// ================= UTILS =================
function normalizeAngle(angle) {
  angle %= 360;
  if (angle > 180) angle -= 360;
  if (angle < -180) angle += 360;
  return angle;
}

// ================= START =================
startBtn.onclick = async () => {
  await startCamera();

  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    const res = await DeviceOrientationEvent.requestPermission();
    if (res === "granted") startGyro();
  } else {
    startGyro();
  }

  initTargets();

  statusEl.innerText = "Move dot to center";
  startBtn.style.display = "none";
};