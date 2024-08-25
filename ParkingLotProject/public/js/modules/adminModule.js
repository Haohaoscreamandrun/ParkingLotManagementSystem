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
  let searchCarsInput = document.querySelector('#searchCars')
  searchCarsInput.addEventListener('input', (event)=>{
    searchCarsByInput(event)
  })
  // render car card
  let carsListGroup = document.querySelector('#carsListGroup')
  carsListGroup.addEventListener('click', event =>{
    renderCarCard(event)
  })

  let denyCameraBtn = document.getElementById('denyCamera')
  let agreeCameraBtn = document.getElementById('agreeCamera')
  
  denyCameraBtn.addEventListener('click', cameraWarning)
  agreeCameraBtn.addEventListener('click', cameraWarning)
  
}

adminFlow()
