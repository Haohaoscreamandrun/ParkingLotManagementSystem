import { tokenValidation } from "./common/login.js";
import { startRecognition, getAPICamera, postAPICamera, postS3 } from "./adminmodule/module.js";

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
  let license = await startRecognition()

  // get backend
  let responseGet = await getAPICamera(license)
  console.log(responseGet)
  // upload s3
  let responseS3 = await postS3(responseGet, license)
  console.log(responseS3)
  // post backend
  let responsePost = await postAPICamera(adminID, license)
  console.log(responsePost)
}

adminFlow()