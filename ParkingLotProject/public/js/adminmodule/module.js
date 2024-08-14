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
      return response
    } else {
      console.error(responseObj.statusText)
      return null
    }
  } catch (error) {
    console.error('Error fetch to backend:', error)
  }
}

async function postS3(responseAPI, license){
  try{
    let captured = document.getElementById('captureCanvas')
    let blob = await new Promise((resolve) => {
      captured.toBlob((blob) => resolve(blob))
    })
    let formDataS3 = new FormData()
    formDataS3.append('file', blob, license)
    // Append other fields from the responseAPI
    for (let [key, value] of Object.entries(responseAPI.fields)) {
      formDataS3.append(key, value);
    }
    let responseObj = await fetch(response.url, {
      method: "POST",
      body: formDataS3
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
    // clear out previous data
    arrayLicense = []
    arrayConfidence = []
    // show on screen
    let recognizedPlateInput = document.querySelector('#recognizedPlate')
    recognizedPlateInput.value = `Successful! ${license}, conf. lv: ${arrayConfidence.reduce((sum, val) => sum + val, 0) / arrayConfidence.length}`
    // fetch backend
    let responseAPI = await postAPICamera(license)
    // upload s3
    let responseS3 = await postS3(responseAPI, license)
    
    // give 5 secs break
    clearInterval(intervalId)
    setTimeout(()=>{
      intervalId = setInterval(processRecognition, 1500)
      recognizedPlateInput.value = ""
    }, 10000)
  }
}