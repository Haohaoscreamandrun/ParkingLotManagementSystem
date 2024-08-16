import { tokenValidation } from "./common/login.js";
import { startRecognition, getAPICamera, postAPICamera, postS3, open_enter_bar } from "./adminmodule/module.js";

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

  // // Starts
  // let license = await startRecognition()
  // console.log('License:', license);
  // // get backend
  // let responseGet = await getAPICamera(license)
  // // upload s3
  // let responseS3 = await postS3(responseGet, license)
  // if (responseS3){
  //   // post backend
  //   let responsePost = await postAPICamera(adminID, license)
  //   console.log(responsePost)
  // }
  function handleLicenseUpdate(license){
    console.log('Recognized License:', license)
    getAPICamera(license).then(responseGet => {
      return postS3(responseGet, license)
    }).then(responseS3 => {
      if (responseS3){
        return postAPICamera(adminID, license)
      }
    }).then(responsePost=>{
      if(responsePost){
        console.log('Allows car enter!')
        open_enter_bar()
      }else{
        console.log('Wait for vacancy!')
      }
    }).catch(error=>{
      console.error('Error in processing:', error)
    })
  }
  // Start recognition with callback
  startRecognition(handleLicenseUpdate)
}

adminFlow()