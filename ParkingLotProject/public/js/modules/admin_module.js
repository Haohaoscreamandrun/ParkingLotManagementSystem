import { recognizeLicensePlate } from "../common/tesseract.js";
import { uri } from "../common/server.js";
import { startCamera, drawNoCameraMessage } from "../common/camera.js";
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

export async function postAPICamera(lotID, license){
  try{
    let requestBodyObj = {
      'lotID': lotID,
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


export function handleLicenseUpdate(license){
    console.log('Recognized License:', license)
    getAPICamera(license).then(responseGet => {
      return postS3(responseGet, license)
    }).then(responseS3 => {
      let lotID
      // at admin
      if (responseS3 && window.location.href.contains('admin')){
        lotID = document.getElementById('chosenLot').value.split(": ")[1]
      // at camera
      } else if(responseS3 && window.location.href.contains('camera')){
        lotID = window.location.href.split('/')[4]
      }
      return postAPICamera(lotID, license)
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

  export function cameraWarning(event){
  let option = event.target.id
  if( option === 'denyCamera'){
    return false
  }else if( option === 'agreeCamera'){
    let validCamera = startCamera()
    if (validCamera){
      // Start recognition with callback
      startRecognition(handleLicenseUpdate)
    }else if(!validCamera){
      drawNoCameraMessage()
    }
  }
}


export async function get_parking_lots(adminID){
  try{
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

export async function render_lot_input(){
  let input = document.querySelector('#chosenLot')
  let dropdown = document.querySelector('#lotDropDown')
  let firstChild = dropdown.children[0].children[0]
  // default as first one
  input.value = `${firstChild.innerText}, ID: ${firstChild.id}`
  let lots = await get_parking_lot_by_id(firstChild.id)
  render_parking_lot_card(lots[0])
  fetch_cars_render(firstChild.id)
  // change upon selection
  dropdown.addEventListener('click', async function(event) {
    if (event.target.classList.contains('dropdown-item')){
      let lot_name = event.target.innerText
      let lot_id = event.target.id
      input.value = `${lot_name}, ID: ${lot_id}`
      let lots = await get_parking_lot_by_id(lot_id)
      render_parking_lot_card(lots[0])
      fetch_cars_render(lot_id)
    }
  })
}

export async function get_parking_lot_by_id(lotID){
  try{
    let responseObj = await fetch(`${uri}/api/parkinglot/${lotID}`, {
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
    console.log('Error fetch to backend:', error)
  }
}

export function render_parking_lot_card(lot){
  let parkingLotName = document.querySelector('#parkingLotName')
  let parkingLotAddress = document.querySelector('#parkingLotAddress')
  let parkingLotFee = document.querySelector('#parkingLotFee')
  let parkingLotSpace = document.querySelector('#parkingLotSpace')
  
  parkingLotName.innerHTML = lot.name
  parkingLotAddress.innerHTML = lot.address
  parkingLotFee.innerHTML = `$TWD ${lot.parking_fee}/hr`
  parkingLotSpace.innerHTML = `${lot.total_space} Total`
  
}

// store the cars information in variable
let temp_storage_cars

async function fetch_cars_render(lotID){
  // fetch
  try{
    let responseObj = await fetch(`${uri}/api/cars?lot_id=${lotID}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    let response = await responseObj.json()
    
    if (responseObj.ok && response.data === null){
      
      // no cars in this lot
      // update vacancy
      render_vacancy(null,true)
      // update car list
      let carsListGroup = document.querySelector('#carsListGroup')
      carsListGroup.innerHTML = ''
      let button = document.createElement('button')
      button.type = 'button'
      button.classList.add('list-group-item', 'list-group-item-action')
      button.innerText = "Currently Empty in this parking lot!"
      // append button
      carsListGroup.appendChild(button)


    } else if (responseObj.ok && response.data.length > 0){

      // store it in temp storage
      temp_storage_cars = await response.data
      // update vacancy
      render_vacancy(temp_storage_cars)
      // render first ten cars
      let carsListGroup = document.querySelector('#carsListGroup')
      carsListGroup.innerHTML = ''
      response.data.slice(0, 10).forEach((car) => {
        render_cars(car)
      })
    } else {
      console.log("enter new Error loop")
      throw new Error(response.message)
    }
  } catch (error) {
    alert('Error fetch to backend:', error)
    console.log(error)
  }
}

function render_cars(car){
  let car_id = car.car_id
  let license = car.license
  let enter_time = new Date(car.enter_time).toLocaleString()
  
  // construct button list
  let button = document.createElement('button')
  button.type = 'button'
  button.id = car_id
  button.classList.add('list-group-item', 'list-group-item-action')
  button.innerHTML = `&#128663; 車牌號碼: ${license} &#9203; 入場時間: ${enter_time}`

  // append button
  carsListGroup.appendChild(button)
}
// render vacancy
export async function render_vacancy(temp_storage_cars=null, noupdate=false){
  let parkingLotSpace = document.querySelector('#parkingLotSpace')
  let parkingLotVacancy = document.querySelector('#parkingLotVacancy')
  let parkingLotSpaceInt = parseInt(parkingLotSpace.innerText.split(' ')[0])
  if (noupdate === true){
    parkingLotVacancy.innerHTML = `${parkingLotSpaceInt} Vacancy`
  } else {
    parkingLotVacancy.innerHTML = `${parkingLotSpaceInt - await temp_storage_cars.length} Vacancy`
    }
}

// function of search car
export function search_cars_by_input(){
  let searchCarsInput = document.querySelector('#searchCars')
  searchCarsInput.addEventListener('input', (event)=>{
    let query = event.target.value
    let queryResult = temp_storage_cars.filter(car => {
      return car.license.toLowerCase().includes(query.toLowerCase())
    })
    if (queryResult.length > 10){
      queryResult = queryResult.slice(0, 10)
    }
    let carsListGroup = document.querySelector('#carsListGroup')
    carsListGroup.innerHTML = ''
    queryResult.forEach(car => {
      render_cars(car)
    })
  })
}

// car card function
export function render_car_card(){
  let carsListGroup = document.querySelector('#carsListGroup')
  carsListGroup.addEventListener('click', event => {
    if (event.target.classList.contains('list-group-item')){
      let target_id = event.target.id
      let queryResult = temp_storage_cars.filter(car => {
        return car.car_id === parseInt(target_id)
      })
      let cardImgTop = document.querySelector('#cardImgTop')
      let licensePlate = document.querySelector('#licenseplate')
      let timeStamp = document.querySelector('#timestamp')
      let parkingFee = document.querySelector('#parkingfee')
      let paidCheck = document.querySelector('#paidCheck')
      let unpaidCheck = document.querySelector('#unpaidCheck')
      cardImgTop.src = `https://d3ryi88x00jzt7.cloudfront.net/${queryResult[0].license}.png`
      licensePlate.value = queryResult[0].license
      timeStamp.value = formatDateForInput(new Date(queryResult[0].enter_time))
      // Calculate passed time
      let passedTime = new Date() - new Date(queryResult[0].enter_time)
      let totalSeconds = Math.floor(passedTime / 1000)
      let minutes = Math.floor(totalSeconds / 60)
      let hours = Math.floor(minutes / 60)
      minutes = Math.floor(minutes % 60)
      // Calculate fee subtotal
      let parkingLotFee = document.querySelector('#parkingLotFee')
      let parkingLotFeeInt = parseInt(parkingLotFee.innerText.split(" ")[1].split("/")[0])
      // under one hour => one hour fee
      // over one hour => less than 30 mins => 1.5 hour fee
      // over one hour => more than 30 mins => 2 hours fee
      let subTotal = 0
      if (hours < 1){
        subTotal = parkingLotFeeInt
      }else if(hours >=1 && minutes < 30){
        subTotal = parkingLotFeeInt * (hours + 0.5)
      }else if(hours >=1 && minutes >= 30){
        subTotal = parkingLotFeeInt * (hours + 1)
      }
      parkingFee.value = subTotal

      // check green light
      let lastGreenTime = new Date(queryResult[0].green_light) - new Date()
      if (lastGreenTime <= 0){
        paidCheck.checked = false
        unpaidCheck.checked = true
      }else{
        paidCheck.checked = true
        unpaidCheck.checked = false
      }
    }
  })
}


export function formatDateForInput(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
