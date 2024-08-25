import { uri } from "../common/server.js";
import { formatDateForInput } from "./admin_module.js";
import { pastTimetoFee } from "./choose_module.js";

export async function getCarByID(carID){
  try{
    let responseObj = await fetch(`${uri}/api/cars/${carID}`, 
      {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
    })
    
    let response = await responseObj.json()
    
    if (responseObj.ok && response.data === null){
      // find not car by this ID
      return null
    } else if (responseObj.ok && response.data.length > 0){
      // find a car by this ID
      return response.data
    } else {
      // other error
      console.log("enter new Error loop")
      throw new Error(response.message)
    }
  } catch (error) {
    // catch other error
    alert('Error fetch to backend:', error)
    console.log(error)
  }
}

export async function getParkingLotByID(lotID){
  try{
    let responseObj = await fetch(`${uri}/api/parkinglot/${lotID}`, 
      {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
    })
    
    let response = await responseObj.json()
    if (responseObj.ok && response.data === null){
      // find not lot by this ID
      return null
    } else if (responseObj.ok && response.data.length > 0){
      // find a lot by this ID
      return response.data
    } else {
      // other error
      console.log("enter new Error loop")
      throw new Error(response.message)
    }
  } catch (error) {
    // catch other error
    alert('Error fetch to backend:', error)
    console.log(error)
  }
}

export async function renderCarDetails(carList, lotList){
  
  let car = carList[0]
  let lot = lotList[0]
  
  // get node
  let carImage = document.getElementById('carImage')
  let licensePlate= document.getElementById('licensePlate')
  let timeStamp = document.getElementById('timeStamp')
  let totalTime = document.getElementById('totalTime')
  let parkingLot = document.getElementById('parkingLot')
  let parkingRate = document.getElementById('parkingRate')
  let parkingFee = document.getElementById('parkingFee')
  let paidCheck = document.getElementById('paidCheck')
  let unpaidCheck = document.getElementById('unpaidCheck')
  let overTimeCheck = document.getElementById('overTimeCheck')
  let paidWarning = document.getElementById('paidWarning')

  // remove placeholder
  Array.from([licensePlate, timeStamp, totalTime, parkingLot, parkingRate, parkingFee]).forEach(node => {
    if (node){
      node.classList.remove('placeholder')
    }
  })

  // assign value
  carImage.src = `https://d3ryi88x00jzt7.cloudfront.net/${car.license}.png`
  licensePlate.value = car.license
  timeStamp.value = formatDateForInput(new Date(car.enter_time))
  let [hours, minutes, subTotal] = pastTimetoFee(car.enter_time, car.green_light, lot.parking_fee)
  totalTime.value = `${hours} hours / ${minutes} minutes`
  parkingLot.value = lot.name
  parkingRate.value = lot.parking_fee
  parkingFee.value = subTotal
  if(new Date(car.green_light) - new Date() > 0){
    // logic of paid
    paidCheck.checked = true
    unpaidCheck.checked = false
    overTimeCheck.checked = false
    paidWarning.classList.remove('visually-hidden')
  } else if(new Date(car.green_light) - new Date() < 0 && new Date(car.green_light) - new Date(car.enter_time) > 0){
    // logic of overtime
    paidCheck.checked = false
    unpaidCheck.checked = false
    overTimeCheck.checked = true
    paidWarning.classList.remove('alert-warning', 'visually-hidden')
    paidWarning.classList.add('alert-danger')
    paidWarning.children[1].innerText = "Please pay for additional parking fee since you haven't left in 15 minutes."
  } else {
    paidCheck.checked = false
    unpaidCheck.checked = true
    overTimeCheck.checked = false
  }
}


export async function postThirdPrime(prime, lotID){
  // render btn
  renderProcessBtn(false, true)
  // get post data
  let carID = window.location.href.split('/')[4]
  let subTotal = document.getElementById('parkingFee').value
  let userName = document.getElementById('userName').value
  let phoneNumber = document.getElementById('phoneNumber').value
  let email = document.getElementById('email').value
  // construct request body
  let requestBody = {
    'prime': prime,
    'car': {
      'id': parseInt(carID),
      'sub_total': parseInt(subTotal)
    },
    'card_holder':{
      'phone_number': phoneNumber,
      'name': userName,
      'email': email
    }
  } 
  let responseObj = await fetch(`${uri}/api/third/credit`,
    {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    }
  )
  let response = await responseObj.json()
  if(responseObj.ok && response.ok){
    renderProcessBtn(true)
    setTimeout(() => {
      window.location.href = `${uri}/camera/${lotID}`
    }, 3000)
  } else if (responseObj.ok && response.error){
    renderProcessBtn(false, false, response.message)
  }
}

export function renderProcessBtn(success=false, waiting=false, msg="Some thing went South"){
  let tappayBtn = document.getElementById('tappayBtn')
  if (waiting){
    tappayBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    <span role="status">Connecting...</span>
    `
  } else if (success){
    tappayBtn.setAttribute('disabled', true)
    tappayBtn.classList.remove('btn-info')
    tappayBtn.classList.add('btn-success')
    tappayBtn.innerHTML = '<i class="fa-solid fa-check"></i> Succeed'
  } else {
    // tappayBtn.setAttribute('disabled', true)
    tappayBtn.classList.remove('btn-info')
    tappayBtn.classList.add('btn-danger')
    tappayBtn.setAttribute('data-bs-toggle', "tooltip")
    tappayBtn.setAttribute('data-bs-placement', "top")
    tappayBtn.setAttribute('data-bs-title', msg)
    tappayBtn.innerHTML = `<i class="fa-solid fa-ban"></i> Transaction rejected`
    tappayBtn =new bootstrap.Tooltip(tappayBtn)
  }
}
