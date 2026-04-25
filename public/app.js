let scene, camera, renderer;
let targets = [];
let currentIndex = 0;

let video = document.getElementById("video");

// ================= CAMERA STREAM =================
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => {
  video.srcObject = stream;
});

// ================= THREE SETUP =================
scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ================= SPHERE =================
let geometry = new THREE.SphereGeometry(5, 32, 32);
let material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true
});
let sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// ================= TARGET POINTS =================
targets = [
  new THREE.Vector3(0, 0, -5),
  new THREE.Vector3(5, 0, 0),
  new THREE.Vector3(0, 0, 5),
  new THREE.Vector3(-5, 0, 0),
  new THREE.Vector3(0, 5, 0),
  new THREE.Vector3(0, -5, 0)
];

// ================= DEVICE ORIENTATION =================
window.addEventListener("deviceorientation", (event) => {
  let alpha = event.alpha; // Yaw
  let beta = event.beta;   // Pitch

  if (alpha && beta) {
    camera.rotation.y = THREE.MathUtils.degToRad(alpha);
    camera.rotation.x = THREE.MathUtils.degToRad(beta);
  }
});

// ================= CAPTURE LOGIC =================
function checkAlignment() {
  let target = targets[currentIndex];

  let direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  let angle = direction.angleTo(target.clone().normalize());

  if (angle < 0.2) {
    captureImage();
    currentIndex++;

    if (currentIndex >= targets.length) {
      alert("Capture Complete!");
    }
  }
}

function captureImage() {
  let canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  let ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  canvas.toBlob(blob => {
    let formData = new FormData();
    formData.append("photo", blob);

    fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData
    });
  });
}

// ================= LOOP =================
function animate() {
  requestAnimationFrame(animate);

  checkAlignment();

  renderer.render(scene, camera);
}

animate();