import { tokenValidation } from "../common/login.js";
import { getParkingLots, searchCarsByInput } from "../scripts/adminScript.js";
import { renderChosenLot, renderLotInput, renderCarCard } from "../view/adminView.js";
import { cameraWarning } from "../common/camera.js";

async function adminFlow (){
  // token validation
  let adminID = await tokenValidation()
  
  // get parking lot list
  let parkingLotList = await getParkingLots(adminID)
  renderChosenLot(parkingLotList)
  // render lot and detail
  renderLotInput()
  // render car list
  searchCarsByInput()
  
  // render car card
  renderCarCard()

  let denyCameraBtn = document.getElementById('denyCamera')
  let agreeCameraBtn = document.getElementById('agreeCamera')
  
  denyCameraBtn.addEventListener('click', cameraWarning)
  agreeCameraBtn.addEventListener('click', cameraWarning)
  
}

adminFlow()
