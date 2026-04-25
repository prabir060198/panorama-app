const video = document.getElementById("video");
const text = document.getElementById("overlay");
const btn = document.getElementById("captureBtn");

let steps = ["FRONT", "RIGHT", "BACK", "LEFT"];
let index = 0;

let images = [];

// CAMERA
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });
  video.srcObject = stream;
}

// CAPTURE IMAGE
function capture() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  canvas.toBlob(blob => {
    images.push(blob);

    index++;

    if (index < steps.length) {
      text.innerText = "Turn RIGHT → Capture " + steps[index];
    } else {
      text.innerText = "Uploading...";
      uploadImages();
    }
  });
}

// UPLOAD TO SERVER
async function uploadImages() {
  let form = new FormData();

  images.forEach((img, i) => {
    form.append("images", img, `img_${i}.jpg`);
  });

  let res = await fetch("http://localhost:3000/upload", {
    method: "POST",
    body: form
  });

  let data = await res.json();

  window.location.href = "viewer.html?img=" + data.output;
}

// START
btn.onclick = capture;

startCamera();