import { processVideo } from "./common/opencv.js";

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
  
  setTimeout(processVideo, 0);
}

cameraFlow()