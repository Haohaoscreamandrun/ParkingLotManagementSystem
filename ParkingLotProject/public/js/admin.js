import { tokenValidation } from "./common/login.js";
import { recognizeLicensePlate } from "./common/tesseract.js";

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

  // Periodically Capture and process
  let arrayLicense = []
  let arrayConfidence = []
  let intervalId, license, confidence

  // function to check upload condition
  function checkUploadCondition(){
    let allSame = arrayLicense.every(val => val === arrayLicense[0]);
    let averageConfidence = arrayConfidence.reduce((sum, val) => sum + val, 0) / arrayConfidence.length;
    return allSame && averageConfidence > 30;
  }

 async function processRecognition(){
    [license, confidence] = await recognizeLicensePlate();
    if (arrayLicense.length === 3){
      arrayLicense.shift()
      arrayConfidence.shift()
    }
    arrayLicense.push(license)
    arrayConfidence.push(confidence)
    // check the conditions
    if (arrayLicense.length === 3 && checkUploadCondition()){
      // show on screen
      let recognizedPlateInput = document.querySelector('#recognizedPlate')
      recognizedPlateInput.value = `Successful! ${license}, conf. lv: ${arrayConfidence.reduce((sum, val) => sum + val, 0) / arrayConfidence.length}`
      // fetch backend
      // upload s3
      // give 5 secs break
      clearInterval(intervalId)
      setTimeout(()=>{
        intervalId = setInterval(processRecognition, 1500)
        recognizedPlateInput.value = ""
      }, 10000)
    }
  }
  // Starts
  intervalId = setInterval(processRecognition, 1500);
  
}

adminFlow()