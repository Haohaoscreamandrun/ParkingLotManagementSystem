import { getCarsByLot ,directToCamera, directToChoose } from "../scripts/indexScript.js";
import { renderParkingLotCard } from "./adminView.js";

async function renderParkingLotsList(data, query = ""){  
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

async function renderLotCard(event, placeholderNode, lotsArray, lotID=null) {
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
  renderParkingLotCard(lot_data)
  await getCarsByLot(lot_id)
  // process button of finding car
  let findCarButton = document.querySelector('#findCarButton')
  findCarButton.id = `getLot${lot_id}`
  findCarButton.disabled = false
  findCarButton.addEventListener('click', event => directToChoose(event))
  // process button of enter parking lot
  let vacancy = parseInt(document.querySelector('#parkingLotVacancy').innerText.split(' ')[0])
  let enterLotButton = document.querySelector('#enterButton')
  enterLotButton.id = `getCamera${lot_id}`
  if (vacancy > 0){
    enterLotButton.disabled = false
    enterLotButton.addEventListener('click', event => directToCamera(event))
  } else {
    enterLotButton.innerText = 'Currently full!'
  }
  
}

export {renderParkingLotsList, renderLotCard}