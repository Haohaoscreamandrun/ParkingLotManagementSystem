import { formValidation, signInValidation, tokenValidation } from "./common/login.js";

import { getLocation } from "./modules/choose_module.js";
import { render_parking_lots_list, get_cars_by_lot } from "./modules/index_module.js";
import { get_parking_lot_by_id } from "./modules/admin_module.js";

async function indexFlow(){
  // Login logic
  // login offcanvas validation bootstrap
  formValidation()
  // login form function
  let signInForm = document.querySelector('#signInForm')
  signInForm.addEventListener('submit', event => {signInValidation(event)})
  // token validation
  tokenValidation()

  // render parking lots
  let parkingLotList = document.querySelector('#parkingLotList')
  let parkingLots = await getLocation()
  render_parking_lots_list(parkingLots)
  parkingLotList.addEventListener('click', async function (event) {
    if(event.target.classList.contains('list-group-item')){
      let lot_id = event.target.id
      await get_parking_lot_by_id(lot_id)
      get_cars_by_lot(lot_id)
    }
  })
}

indexFlow()