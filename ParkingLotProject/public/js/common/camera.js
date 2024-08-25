import { postS3 } from "./s3.js";
import { recognizeLicensePlate } from "./tesseract.js";

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

function drawCameraMessage(message) {
  let video = document.querySelector('#localVideo')  
  let canvas = document.getElementById('videoCanvas');
  let context = canvas.getContext('2d');

  if (canvas.hidden){
    video.hidden = true
    canvas.hidden= false
  }

  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Set up font style and color
  context.font = '40px Arial';
  context.fillStyle = 'red';
  context.textAlign = 'center';

  // Draw the text in the center of the canvas
  context.fillText(message, canvas.width / 2, canvas.height / 2);
}

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


// Periodically Capture and process
let arrayLicense = []
let arrayConfidence = []

// function to check upload condition
function checkUploadCondition(){
  let allSame = arrayLicense.every(val => val === arrayLicense[0] && val !== "" );
  let averageConfidence = arrayConfidence.reduce((sum, val) => sum + val, 0) / arrayConfidence.length;
  return allSame || averageConfidence > 30;
}

let intervalId = null
let licensePromiseResolve = null; // Shared variable to hold the resolve function of the promise
let licenseCallback = null
let recognizedPlateInput = document.querySelector('#recognizedPlate')

function openEnterBar(){
  let enterGate = document.querySelector('#enterGate')
  let closedSrc = enterGate.src
  let openSrc = '../public/images/gate-open.jpg'
  enterGate.src = openSrc
  setTimeout(()=>{
    enterGate.src = closedSrc
  }, 5000)
}

function handleLicenseUpdate(license){
  console.log('Recognized License:', license)
  getAPICamera(license).then(responseGet => {
    return postS3(responseGet, license)
  }).then(responseS3 => {
    let lotID
    // at admin
    if (responseS3 && window.location.href.includes('admin')){
      lotID = document.getElementById('chosenLot').value.split(": ")[1]
    // at camera
    } else if(responseS3 && window.location.href.includes('camera')){
      lotID = window.location.href.split('/')[4]
    }
    return postNewCar(lotID, license)
  }).then(responsePost=>{
    if(responsePost){
      console.log('Allows car enter!')
      openEnterBar()
    }else{
      console.log('Wait for vacancy!')
    }
  }).catch(error=>{
    console.error('Error in processing:', error)
  })
}

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
    drawCameraMessage(`Welcome! ${license}`)
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

function stopRecognition(){
  if (intervalId){
    clearInterval(intervalId)
    intervalId = null
  }
}

async function getAPICamera(license){
  try{
    let responseObj = await fetch(`${uri}/api/camera?license=${license}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    })
    let response = await responseObj.json()
    if (responseObj.ok){
      return response.data
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    alert('Error fetch to backend:', error)
  }
}

async function postNewCar(lotID, license){
  try{
    let requestBodyObj = {
      'lotID': lotID,
      'license': license
    }
    let responseObj = await fetch(`${uri}/api/cars/${license}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBodyObj)
    })
    let response = await responseObj.json()
    if (responseObj.ok){
      return response.ok
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    alert('Error fetch to backend:', error)
  }
}

export {startCamera, drawCameraMessage, cameraWarning, openEnterBar, handleLicenseUpdate, processRecognition, startRecognition, stopRecognition, getAPICamera, postNewCar}