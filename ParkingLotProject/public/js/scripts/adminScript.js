import { uri } from "../common/server.js";
import { renderVacancy, renderCars } from "../view/adminView.js";

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

// store the cars information in variable
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
      // update vacancy
      renderVacancy(null,true)
      // update car list
      renderCars(['empty'], true)

    } else if (responseObj.ok && response.data.length > 0){

      // store it in temp storage
      tempStorageCars = await response.data
      // update vacancy
      renderVacancy(tempStorageCars)
      // render first ten cars
      renderCars(response.data)

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
function searchCarsByInput(){
  let searchCarsInput = document.querySelector('#searchCars')
  searchCarsInput.addEventListener('input', (event)=>{
    let query = event.target.value
    let queryResult = tempStorageCars.filter(car => {
      return car.license.toLowerCase().includes(query.toLowerCase())
    })
    if (queryResult.length > 10){
      queryResult = queryResult.slice(0, 10)
    }
    let carsListGroup = document.querySelector('#carsListGroup')
    carsListGroup.innerHTML = ''
    queryResult.forEach(car => {
      renderCars(car)
    })
  })
}


function formatDateForInput(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export {getParkingLots, getParkingLotById, fetchCarsRender, searchCarsByInput, formatDateForInput}