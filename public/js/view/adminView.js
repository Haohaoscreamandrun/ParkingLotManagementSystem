import { getParkingLotById, fetchCarsRender, formatDateForInput, tempStorageCars, updateCarByID, deleteCarByLicense } from "../scripts/adminScript.js"
import { pastTimetoFee } from "../scripts/chooseScript.js"

function renderChosenLot(list){
  let dropdown = document.querySelector('#lotDropDown')
  dropdown.innerHTML = ''
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
  input.placeholder = `${firstChild.innerText}, ID: ${firstChild.id}`
  let lots = await getParkingLotById(firstChild.id)
  renderParkingLotCard(lots[0], 'firstLoading')
  fetchCarsRender(firstChild.id)
  // change upon selection
  dropdown.addEventListener('click', async function(event) {
    if (event.target.classList.contains('dropdown-item')){
      // loading screen
      renderParkingLotCard([], 'loading')
      let carsList = document.getElementById('carsListGroup')
      carsList.innerHTML = `
      <div class="d-flex justify-content-center">
        <div class="spinner-grow text-secondary mt-2" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      `

      let lot_name = event.target.innerText
      let lot_id = event.target.id
      input.value = ''
      input.placeholder = `${lot_name}, ID: ${lot_id}`
      let lots = await getParkingLotById(lot_id)
      
      fetchCarsRender(lot_id)
      renderParkingLotCard(lots[0])
    }
  })
}

let loadingCard

function renderParkingLotCard(lot, status='normal'){
  if (status === 'firstLoading'){
    loadingCard = document.getElementById('lotDetailCard').innerHTML
  } else if (status === 'loading'){
    document.getElementById('lotDetailCard').innerHTML = loadingCard
    return
  }

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
    deleteButton.addEventListener('click', deleteCarByLicense)
  }
}

function renderBtnLoading(event, complete=false){
  let button = event.target
  let btnWord = button.innerText
  if(!complete){
    button.innerHTML = `
    <span class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
    <span role="status">${btnWord}</span>
    `
  } else if(complete){
    button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
    </svg> Complete`
  }
}

function renderAlert(){
  let parentNode = document.getElementById('alertPanel')
  let alert = document.createElement('div')
  alert.classList.add('alert', 'alert-danger', 'd-flex', 'align-items-center', 'alert-dismissible', 'fade', 'show')
  alert.setAttribute('role', 'alert')
  alert.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
  </svg>
  <div class="px-3">
    Always update payment status to <strong>Paid</strong> before delete it.
  </div>
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`
  parentNode.append(alert)
}

export {renderChosenLot, renderLotInput, renderParkingLotCard, renderCars, renderVacancy, renderCarCard, renderBtnLoading, renderAlert}