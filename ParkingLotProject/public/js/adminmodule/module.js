import { recognizeLicensePlate } from "../common/tesseract.js";

// Periodically Capture and process
let arrayLicense = []
let arrayConfidence = []

// function to check upload condition
function checkUploadCondition(){
  let allSame = arrayLicense.every(val => val === arrayLicense[0] && val !== "" );
  let averageConfidence = arrayConfidence.reduce((sum, val) => sum + val, 0) / arrayConfidence.length;
  return allSame || averageConfidence > 30;
}

async function postAPICamera(license){
  try{
    let uri = `http://${window.location.hostname}:${window.location.port}`
    let responseObj = await fetch(`${uri}/api/camera?license=${license}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (responseObj.ok){
      let response = await responseObj.json()
      console.log(response)
      return response
    } else {
      console.error(responseObj.statusText)
      return null
    }
  } catch (error) {
    console.error('Error fetch to backend:', error)
  }
}

async function putS3(responseAPI, license){
  try{
    let captured = document.getElementById('captureCanvas')
    let blob = await new Promise((resolve) => {
      captured.toBlob((blob) => resolve(blob))
    })
    let formDataS3 = new FormData()
    formDataS3.append('file', blob, license)
    
    let responseObj = await fetch(responseAPI, {
      method: "PUT",
      headers: {'Content-Type': 'multipart/form-data'},
      body: formDataS3,
      mode: 'cors'
    })
    if (responseObj.ok) {
      let response = await responseObj.json()
      console.log(response)
      return response
    } else {
      console.error(responseObj.statusText)
      return null
    }
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}
let intervalId

export async function processRecognition(){
  let [license, confidence] = await recognizeLicensePlate();
  if (arrayLicense.length === 3){
    arrayLicense.shift()
    arrayConfidence.shift()
  }
  arrayLicense.push(license)
  arrayConfidence.push(confidence)
  // check the conditions
  if (arrayLicense.length === 3 && checkUploadCondition()){
    // give 10 secs break
    stopRecognition()
    setTimeout(() => {
      startRecognition()
      recognizedPlateInput.value = ""
    }, 10000)
    // clear out previous data
    arrayLicense = []
    arrayConfidence = []
    // show on screen
    let recognizedPlateInput = document.querySelector('#recognizedPlate')
    recognizedPlateInput.value = `Successful! ${license}, conf. lv: ${arrayConfidence.reduce((sum, val) => sum + val, 0) / arrayConfidence.length}`
    // fetch backend
    let responseAPI = await postAPICamera(license)
    // upload s3
    let responseS3 = await putS3(responseAPI, license)
  }
}

export function startRecognition(){
  if (!intervalId){
    intervalId = setInterval(processRecognition, 1500)
  }
}

function stopRecognition(){
  clearInterval(intervalId)
  intervalId = null
}