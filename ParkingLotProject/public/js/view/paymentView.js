import { formatDateForInput } from "../scripts/adminScript.js";
import { pastTimetoFee } from "../scripts/chooseScript.js";

async function renderCarDetails(carList, lotList){
  
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

function renderProcessBtn(success=false, waiting=false, msg="Some thing went South"){
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

export {renderCarDetails, renderProcessBtn}