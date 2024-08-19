import { uri } from "../common/server.js"
import { render_vacancy, render_parking_lot_card } from "./admin_module.js"

export async function getLocation() {
  if (navigator.geolocation) {
    try{  
      let position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
       })
      let parkingLots = await get_parking_lots_by_coordinate(position)
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

export async function get_parking_lots_by_coordinate(position=undefined, latitude=undefined, longitude=undefined){
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



export function render_parking_lots_list(data, query = ""){  
  let parkingLotList = document.querySelector('#parkingLotList')
  parkingLotList.innerHTML = ''
  //render message if no data
  if (data.length === 0){
    let newBtn = document.createElement('button')
    newBtn.classList.add('list-group-item', 'list-group-item-action')
    newBtn.type = 'button'
    newBtn.id = 0
    if(query.length > 0) {
      newBtn.innerText = `No address of nearby parking lots contain ${query}`
    } else {
      newBtn.innerText = "There's no parking lot nearby!"
    }
    parkingLotList.appendChild(newBtn)
  }
  data.forEach(lot => {
    let newBtn = document.createElement('button')
    newBtn.classList.add('list-group-item', 'list-group-item-action')
    newBtn.type = 'button'
    newBtn.id = lot.id
    newBtn.innerText = lot.name
    parkingLotList.appendChild(newBtn)
  })
}

export async function get_cars_by_lot(lotID) {
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
      render_vacancy([])

    } else if (responseObj.ok && response.data.length > 0){

      // update vacancy
      await render_vacancy(response.data)
      
    } else {
      console.log("enter new Error loop")
      throw new Error(response.message)
    }
  } catch (error) {
    alert('Error fetch to backend:', error)
    console.log(error)
  }
}

export function render_lot_card(event, placeholderNode, lotsArray, lotID=null) {
  let parent, self, lot_id
  
  if(event.target.classList.contains('list-group-item')){
    parent = event.target.parentNode
    self = event.target
    lot_id = event.target.id
  } else if (event.isTrusted){
    parent = document.querySelector('#parkingLotList')
    self = document.getElementById(`${lotID}`)
    lot_id = lotID
  }
  // replace placeholder
  let placeholder = document.querySelector('#lotDetailCard')
  placeholder.innerHTML = placeholderNode.innerHTML
  // toggle active list-item
  let allChildrenArray = Array.from(parent.children)
  allChildrenArray.forEach(element => {
    if (element.classList.contains('active')){
      element.classList.toggle('active')
    }
  });
  self.classList.toggle('active')
  // render car card
  let lot_data = lotsArray.find(lot => {
    return lot.id === parseInt(lot_id)
  })
  render_parking_lot_card(lot_data)
  get_cars_by_lot(lot_id)
  // process button of finding car
  let button = document.querySelector('#findCarButton')
  button.id = `getLot${lot_id}`
  button.disabled = false
  button.addEventListener('click', event => direct_find_car_btn(event))
}

function direct_find_car_btn(event){
  let lot_id = event.target.id.split('getLot')[1]
  window.location.href = `${uri}/choose/${lot_id}`
}

export function search_lots_by_address(event, lotsArray){
  let query = event.target.value
  let queryResult = lotsArray.filter(lot => {
    return lot.address.toLowerCase().includes(query.toLowerCase())
  })
  render_parking_lots_list(queryResult, query)
}