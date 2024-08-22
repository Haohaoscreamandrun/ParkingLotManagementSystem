import { tokenValidation } from "./common/login.js";
import { get_parking_lots, render_chosen_lot, render_lot_input, search_cars_by_input, render_car_card, cameraWarning } from "./modules/admin_module.js";

async function adminFlow (){
  // token validation
  let adminID = await tokenValidation()
  

  // get parking lot list
  let parkingLotList = await get_parking_lots(adminID)
  render_chosen_lot(parkingLotList)
  // render lot and detail
  render_lot_input()
  // render car list
  search_cars_by_input()
  
  // render car card
  render_car_card()

  
  let denyCameraBtn = document.getElementById('denyCamera')
  let agreeCameraBtn = document.getElementById('agreeCamera')
  
  denyCameraBtn.addEventListener('click', cameraWarning)
  agreeCameraBtn.addEventListener('click', cameraWarning)
  
}

adminFlow()
