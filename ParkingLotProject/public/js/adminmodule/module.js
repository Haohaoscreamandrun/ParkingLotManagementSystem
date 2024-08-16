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

let intervalId = null
let licensePromiseResolve = null; // Shared variable to hold the resolve function of the promise
let licenseCallback = null
let recognizedPlateInput = document.querySelector('#recognizedPlate')

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
      startRecognition(licenseCallback)
      recognizedPlateInput.value = ""
    }, 10000)
  }
}

export function startRecognition(callback){
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


export async function getAPICamera(license){
  try{
    let uri = `http://${window.location.hostname}:${window.location.port}`
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

export async function postS3(responseAPI, license){
  try{
    let captured = document.getElementById('captureCanvas')
    let blob = await new Promise((resolve) => {
      captured.toBlob((blob) => {
        resolve(blob)
      }, 'image/png')
    })
    
    let formDataS3 = new FormData()
    Object.entries(responseAPI.fields).forEach(([key, value]) => {
      formDataS3.append(key, value)
    })
    formDataS3.append('file', blob, `${license}.png`)
    
    let responseObj = await fetch(responseAPI.url, {
      method: "POST",
      body: formDataS3,
      mode: 'cors'
    })
    if (responseObj.ok) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

export async function postAPICamera(adminID, license){
  try{
    let uri = `http://${window.location.hostname}:${window.location.port}`
    let requestBodyObj = {
      'admin': adminID,
      'license': license
    }
    let responseObj = await fetch(`${uri}/api/camera`, {
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

export function open_enter_bar(){
  let enterGate = document.querySelector('#enterGate')
  let closedSrc = enterGate.src
  let openSrc = '../public/images/gate-open.jpg'
  enterGate.src = openSrc
  setTimeout(()=>{
    enterGate.src = closedSrc
  }, 5000)
}


export async function get_parking_lots(adminID){
  try{
    let uri = `http://${window.location.hostname}:${window.location.port}`
    let responseObj = await fetch(`${uri}/api/admin?admin=${adminID}`, {
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


export function render_chosen_lot(list){
  let dropdown = document.querySelector('#lotDropDown')
  list.forEach((lot) => {
    let listEle = document.createElement('li')
    let button =document.createElement('button')
    button.innerText = lot.lot_name
    button.id = lot.lot_id
    button.classList.add('dropdown-item')
    listEle.appendChild(button)
    dropdown.appendChild(listEle)
  })
}

export function render_lot_input(){
  let input = document.querySelector('#chosenLot')
  let dropdown = document.querySelector('#lotDropDown')
  dropdown.addEventListener('click', event => {
    if (event.target.classList.contains('dropdown-item')){
      let lot_name = event.target.innerText
      let lot_id = event.target.id
      input.value = `${lot_name}, ID: ${lot_id}`
    }
  })
}