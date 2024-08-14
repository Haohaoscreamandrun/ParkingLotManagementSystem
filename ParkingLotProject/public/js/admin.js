import { tokenValidation } from "./common/login.js";
import { startRecognition } from "./adminmodule/module.js";

async function adminFlow (){
  // token validation
  let adminID = await tokenValidation()
  console.log(`Get admin data, admin Id is ${adminID}`)

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

  // Starts
  startRecognition()
  
}

adminFlow()