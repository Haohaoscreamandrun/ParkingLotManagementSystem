import { getParkingLotById, fetchCarsRender, formatDateForInput, tempStorageCars, updateCarByID } from "../scripts/adminScript.js"
import { pastTimetoFee } from "../scripts/chooseScript.js"

function renderChosenLot(list){
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

async function renderLotInput(){
  let input = document.querySelector('#chosenLot')
  let dropdown = document.querySelector('#lotDropDown')
  let firstChild = dropdown.children[0].children[0]
  // default as first one
  input.value = `${firstChild.innerText}, ID: ${firstChild.id}`
  let lots = await getParkingLotById(firstChild.id)
  renderParkingLotCard(lots[0])
  fetchCarsRender(firstChild.id)
  // change upon selection
  dropdown.addEventListener('click', async function(event) {
    if (event.target.classList.contains('dropdown-item')){
      let lot_name = event.target.innerText
      let lot_id = event.target.id
      input.value = `${lot_name}, ID: ${lot_id}`
      let lots = await getParkingLotById(lot_id)
      renderParkingLotCard(lots[0])
      fetchCarsRender(lot_id)
    }
  })
}

function renderParkingLotCard(lot){
  let parkingLotName = document.querySelector('#parkingLotName')
  let parkingLotAddress = document.querySelector('#parkingLotAddress')
  let parkingLotFee = document.querySelector('#parkingLotFee')
  let parkingLotSpace = document.querySelector('#parkingLotSpace')
  
  parkingLotName.innerHTML = lot.name
  parkingLotAddress.innerHTML = lot.address
  parkingLotFee.innerHTML = `$TWD ${lot.parking_fee}/hr`
  parkingLotSpace.innerHTML = `${lot.total_space} Total`
  
}

function renderCars(carList, isEmpty=false){
  // clears up previous data
  let carsListGroup = document.querySelector('#carsListGroup')
  carsListGroup.innerHTML = ''
 
  if (isEmpty){
    // construct button list
    let button = document.createElement('button')
    button.type = 'button'
    button.classList.add('list-group-item', 'list-group-item-action')
    button.innerText = "Currently Empty in this parking lot!"
    // append button
    carsListGroup.appendChild(button)
  } else {
    carList.forEach((car) => {
      // construct button list
      let button = document.createElement('button')
      button.type = 'button'
      button.classList.add('list-group-item', 'list-group-item-action')
      let car_id = car.car_id
      let license = car.license
      let enter_time = new Date(car.enter_time).toLocaleString()
      button.id = car_id
      button.innerHTML = `&#128663; 車牌號碼: ${license} &#9203; 入場時間: ${enter_time}`
      // append button
      carsListGroup.appendChild(button)
    })
  }
}

// render vacancy
async function renderVacancy(tempStorageCars=null, noupdate=false){
  let parkingLotSpace = document.querySelector('#parkingLotSpace')
  let parkingLotVacancy = document.querySelector('#parkingLotVacancy')
  let parkingLotSpaceInt = parseInt(parkingLotSpace.innerText.split(' ')[0])
  if (noupdate === true){
    parkingLotVacancy.innerHTML = `${parkingLotSpaceInt} Vacancy`
  } else {
    parkingLotVacancy.innerHTML = `${parkingLotSpaceInt - await tempStorageCars.length} Vacancy`
    }
}

// car card function
function renderCarCard(event, carList = tempStorageCars){

  if (event.target.classList.contains('list-group-item')){
    let target_id = event.target.id
    let queryResult = carList.filter(car => {
      return car.car_id === parseInt(target_id)
    })
    let cardImgTop = document.querySelector('#cardImgTop')
    let licensePlate = document.querySelector('#licenseplate')
    let timeStamp = document.querySelector('#timestamp')
    let parkingFee = document.querySelector('#parkingfee')
    let paidCheck = document.querySelector('#paidCheck')
    let unpaidCheck = document.querySelector('#unpaidCheck')
    let updateButton = document.querySelector('.btn.btn-warning.mb-3')
    let deleteButton  =document.querySelector('.btn.btn-danger.mb-3')
    cardImgTop.src = `https://d3ryi88x00jzt7.cloudfront.net/${queryResult[0].license}.png`
    licensePlate.value = queryResult[0].license
    timeStamp.value = formatDateForInput(new Date(queryResult[0].enter_time))
    
    // check green light
    let lastGreenTime = new Date(queryResult[0].green_light) - new Date()
    if (lastGreenTime <= 0){
      paidCheck.checked = false
      unpaidCheck.checked = true
    }else{
      paidCheck.checked = true
      unpaidCheck.checked = false
    }
    
    // Calculate fee subtotal
    let parkingLotFee = document.querySelector('#parkingLotFee')
    let parkingLotFeeInt = parseInt(parkingLotFee.innerText.split(" ")[1].split("/")[0])
    
    let [hours, minutes, subTotal] = pastTimetoFee(new Date(queryResult[0].enter_time), new Date(queryResult[0].green_light), parkingLotFeeInt)

    parkingFee.value = subTotal
    // render button
    updateButton.removeAttribute('disabled')
    deleteButton.removeAttribute('disabled')
    updateButton.id = `updateCarID${target_id}`
    deleteButton.id = `deleteCarLicense${queryResult[0].license}`
    updateButton.addEventListener('click', updateCarByID)
  }
}

export {renderChosenLot, renderLotInput, renderParkingLotCard, renderCars, renderVacancy, renderCarCard}