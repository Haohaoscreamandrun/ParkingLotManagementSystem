import { uri } from "../common/server.js";
import { renderVacancy, renderCars } from "../view/adminView.js";
// store the cars information in variable

async function getParkingLots(adminID){
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

async function getParkingLotById(lotID){
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

let tempStorageCars

async function fetchCarsRender(lotID){
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
      tempStorageCars = []
      // update vacancy
      renderVacancy(null,true)
      // update car list
      renderCars(tempStorageCars, true)

    } else if (responseObj.ok && response.data.length > 0){

      // store it in temp storage
      tempStorageCars = await response.data
      // update vacancy
      renderVacancy(tempStorageCars)
      // render first ten cars
      renderCars(tempStorageCars)

    } else {
      console.log("enter new Error loop")
      throw new Error(response.message)
    }
  } catch (error) {
    alert('Error fetch to backend:', error)
    console.log(error)
  }
}


// function of search car
function searchCarsByInput(event, carList = tempStorageCars){
  
  let query = event.target.value
  let queryResult = carList.filter(car => {
    return car.license.toLowerCase().includes(query.toLowerCase())
  })
  let carsListGroup = document.querySelector('#carsListGroup')
  carsListGroup.innerHTML = ''
  renderCars(queryResult)
  
}


function formatDateForInput(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export {getParkingLots, getParkingLotById, fetchCarsRender, searchCarsByInput, formatDateForInput, tempStorageCars}