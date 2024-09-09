import { uri } from "../common/server.js"
import { renderVacancy } from "../view/adminView.js";
import { renderParkingLotsList } from "../view/indexView.js";

async function getLocation() {
  if (navigator.geolocation) {
    try{  
      let position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        // maximumAge: 300000, // return cache in 5 mins
        enableHighAccuracy: true
      });
       })
      let parkingLots = await getParkingLotsByCoordinate(position)
      return parkingLots
    } catch(error){
      showError(error)
      return null
    } 
  } else {
    alert("Geolocation is not supported by this browser.")
    return null
  }
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
        alert("User denied the request for Geolocation.")
        break;
    case error.POSITION_UNAVAILABLE:
        alert("Location information is unavailable.")
        break;
    case error.TIMEOUT:
        alert("The request to get user location timed out.")
        break;
    case error.UNKNOWN_ERROR:
        alert("An unknown error occurred.")
        break;
  }
}

async function getParkingLotsByCoordinate(position=undefined, latitude=undefined, longitude=undefined){
  let lat, lon
  if (position !== undefined){
    lat = position.coords.latitude
    lon = position.coords.longitude
  } else if (latitude !== undefined && longitude !== undefined){
    lat = latitude
    lon = longitude
  }
  
   try{
    let responseObj = await fetch(`${uri}/api/parkinglot?latitude=${lat}&longitude=${lon}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    })
    let response = await responseObj.json()
    if (responseObj.ok && response.data.length > 0){
      return (response.data)
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.log('Error fetch to backend:', error)
  }
}

async function getCarsByLot(lotID) {
  try{
    let responseObj = await fetch(`${uri}/api/cars/${lotID}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    let response = await responseObj.json()
    
    if (responseObj.ok && response.data === null){
      
      // no cars in this lot
      renderVacancy([])

    } else if (responseObj.ok && response.data.length > 0){

      // update vacancy
      await renderVacancy(response.data)
      
    } else {
      console.log("enter new Error loop")
      throw new Error(response.message)
    }
  } catch (error) {
    alert('Error fetch to backend:', error)
    console.log(error)
  }
}

function directToCamera(event){
  let lot_id = event.target.id.split('getCamera')[1]
  window.location.href = `${uri}/camera/${lot_id}`
}

function directToChoose(event){
  let lot_id = event.target.id.split('getLot')[1]
  window.location.href = `${uri}/choose/${lot_id}`
}

async function searchLotsByAddress(event, lotsArray){
  let query = event.target.value
  let queryResult = lotsArray.filter(lot => {
    return lot.address.toLowerCase().includes(query.toLowerCase())
  })
  await renderParkingLotsList(queryResult, query)
}

export {getLocation, getParkingLotsByCoordinate, getCarsByLot, directToCamera, directToChoose, searchLotsByAddress}