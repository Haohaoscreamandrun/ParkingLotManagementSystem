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
  let intervalId

  // function to check upload condition
  function checkUploadCondition(){
    let allSame = arrayLicense.every(val => val === arrayLicense[0] && val !== "" );
    let averageConfidence = arrayConfidence.reduce((sum, val) => sum + val, 0) / arrayConfidence.length;
    return allSame || averageConfidence > 30;
  }

 async function processRecognition(){
    let [license, confidence] = await recognizeLicensePlate();
    if (arrayLicense.length === 3){
      arrayLicense.shift()
      arrayConfidence.shift()
    }
    arrayLicense.push(license)
    arrayConfidence.push(confidence)
    // check the conditions
    if (arrayLicense.length === 3 && checkUploadCondition()){
      // clear out previous data
      arrayLicense = []
      arrayConfidence = []
      // show on screen
      let recognizedPlateInput = document.querySelector('#recognizedPlate')
      recognizedPlateInput.value = `Successful! ${license}, conf. lv: ${arrayConfidence.reduce((sum, val) => sum + val, 0) / arrayConfidence.length}`
      // fetch backend
      let uri = `http://${window.location.hostname}:${window.location.port}`
      let responseObj = await fetch(`${uri}/api/camera?license=${license}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        }
      })
      let response = await responseObj.json()
      
      // upload s3
      let captured = document.getElementById('captureCanvas')
      let blob = await new Promise((resolve) => {
        captured.toBlob((blob) => resolve(blob))
      })
      let formDataS3 = new FormData()
      formDataS3.append('file', blob, license)
      // Append other fields from the response
      for (let [key, value] of Object.entries(response.fields)) {
        formDataS3.append(key, value);
      }
      responseObj = await fetch(response.url, {
        method: "POST",
        body: formDataS3
      })
      response = await responseObj.json()
      console.log(response)
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