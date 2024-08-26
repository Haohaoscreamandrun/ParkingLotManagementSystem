import { recognizeLicensePlate } from "./tesseract.js";
import { handleLicenseUpdate } from "../scripts/cameraScript.js";
import { drawCameraMessage } from "../view/cameraView.js";

// Periodically Capture and process
let arrayLicense = []
let arrayConfidence = []
let intervalId = null
let licensePromiseResolve = null; // Shared variable to hold the resolve function of the promise
let licenseCallback = null
let recognizedPlateInput = document.querySelector('#recognizedPlate')

// function handle open camera based on popup modal input
async function cameraWarning(event){
  let option = event.target.id
  if( option === 'denyCamera'){
    return false
  }else if( option === 'agreeCamera'){
    let validCamera = await startCamera()
    if (validCamera){
      // Start recognition with callback
      startRecognition(handleLicenseUpdate)
    }else if(!validCamera){
      drawCameraMessage('No Camera')
    }
  }
}

// function that open user's camera
async function startCamera(){
  // get rid of play button
  let imageStartBtn = document.querySelector('#startBtn button')
  imageStartBtn.remove()
  // Access the camera
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: {ideal: 'environment'}// Request the back camera, but fallback to the front camera if necessary
    }
  })
  .then(stream => {
    // Get the video element
    let video = document.getElementById('localVideo');
    // Set the srcObject of the video element to the stream
    video.srcObject = stream;
    return true
  })
  .catch(error => {
    alert(`Error accessing media devices: ${error}`)
    return false
  })
}

// function that start the loop
function startRecognition(callback){
  licenseCallback = callback
  return new Promise((resolve)=>{
    if (intervalId){
      clearInterval(intervalId)
    }
    // Store the resolve function
    licensePromiseResolve = resolve
    // Start new interval
    intervalId = setInterval(processRecognition, 1500)
  })
 
}

// function to check upload condition
function checkUploadCondition(){
  let allSame = arrayLicense.every(val => val === arrayLicense[0] && val !== "" );
  let averageConfidence = arrayConfidence.reduce((sum, val) => sum + val, 0) / arrayConfidence.length;
  return allSame || averageConfidence > 30;
}

// recognition main logic
async function processRecognition(){
  let [license, confidence] = await recognizeLicensePlate();
  if (arrayLicense.length === 3){
    arrayLicense.shift()
    arrayConfidence.shift()
  }
  if (license !== ""){
    arrayLicense.push(license)
    arrayConfidence.push(confidence)
  }
  console.log('Array License:', arrayLicense); // Debugging line
  // check the conditions
  if (arrayLicense.length === 3 && checkUploadCondition()){
     console.log('Upload Condition Met'); // Debugging line
    // show on screen
    recognizedPlateInput.value = `Successful! ${license}, conf. lv: ${arrayConfidence.reduce((sum, val) => sum + val, 0) / arrayConfidence.length}`
  
    // clear out previous data
    arrayLicense = []
    arrayConfidence = []
    // return license to callback
    if (licenseCallback){
      licenseCallback(license)
    }
    // Resolve the promise with the license
    if (licensePromiseResolve) {
      licensePromiseResolve(license);
      licensePromiseResolve = null; // Clear the resolve function
    }
    // give 10 secs break
    stopRecognition()
    setTimeout(() => {
      console.log('Restarting Recognition'); // Debugging line
      let video = document.querySelector('#localVideo')  
      let canvas = document.getElementById('videoCanvas');

      if (!canvas.hidden && window.location.href.includes('camera')){
        video.hidden = false
        canvas.hidden= true
      }
      
      startRecognition(licenseCallback)
      recognizedPlateInput.value = ""
    }, 10000)
  }
}

function stopRecognition(){
  if (intervalId){
    clearInterval(intervalId)
    intervalId = null
  }
}

export {cameraWarning}