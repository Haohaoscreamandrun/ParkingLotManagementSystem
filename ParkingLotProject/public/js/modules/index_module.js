import { uri } from "../common/server.js"
import { render_vacancy } from "./admin_module.js"

export function render_parking_lots_list(data){
  let parkingLotList = document.querySelector('#parkingLotList')
  parkingLotList.innerHTML = ''
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