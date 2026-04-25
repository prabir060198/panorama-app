const video = document.getElementById("video");
const status = document.getElementById("status");
const btn = document.getElementById("start");

let lastYaw = null;
let images = [];

const STEP = 25; // overlap control

async function startCamera(){
  const stream = await navigator.mediaDevices.getUserMedia({
    video:{ facingMode:"environment" }
  });
  video.srcObject = stream;
}

function startGyro(){
  window.addEventListener("deviceorientation", e=>{
    if(e.alpha==null) return;

    handleRotation(e.alpha);

  }, true);
}

function handleRotation(yaw){

  if(lastYaw === null){
    lastYaw = yaw;
    capture();
    return;
  }

  let diff = angleDiff(yaw, lastYaw);

  if(Math.abs(diff) > STEP){
    capture();
    lastYaw = yaw;
  }
}

function capture(){

  let canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  let ctx = canvas.getContext("2d");
  ctx.drawImage(video,0,0);

  canvas.toBlob(blob=>{
    images.push(blob);
  });

  status.innerText = "Captured: " + images.length;
}

// ================= UPLOAD =================
async function uploadImages(){

  let form = new FormData();

  images.forEach((img,i)=>{
    form.append("images", img, `img_${i}.jpg`);
  });

  let res = await fetch("http://localhost:3000/upload",{
    method:"POST",
    body:form
  });

  let data = await res.json();

  window.location.href = "viewer.html?img=" + data.output;
}

// ================= UTILS =================
function angleDiff(a,b){
  let d = a - b;
  d = (d+180)%360 - 180;
  return d;
}

// ================= START =================
btn.onclick = async ()=>{
  await startCamera();

  if(typeof DeviceOrientationEvent.requestPermission==="function"){
    let r = await DeviceOrientationEvent.requestPermission();
    if(r==="granted") startGyro();
  }else{
    startGyro();
  }

  status.innerText = "Rotate slowly";

  // stop after 10 sec and upload
  setTimeout(uploadImages, 10000);
};