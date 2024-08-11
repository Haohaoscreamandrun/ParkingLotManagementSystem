import { recognizeLicensePlate } from "./common/tesseract.js";

async function cameraFlow(){
  // Access the camera
  navigator.mediaDevices.getUserMedia({video: true})
  .then(stream => {
    // Get the video element
    let video = document.getElementById('localVideo');
    // Set the srcObject of the video element to the stream
    video.srcObject = stream;
  })
  .catch(error => {
    console.error('Error accessing media devices', error)
  })

  // Periodically Capture and process
  setInterval(async()=>{
    await recognizeLicensePlate();
  }, 5000)
}

cameraFlow()