import { tokenValidation } from "./common/login.js";
import { startRecognition, getAPICamera, postAPICamera, postS3, open_enter_bar, get_parking_lots, render_chosen_lot, render_lot_input, search_cars_by_input, render_car_card } from "./modules/admin_module.js";
import { startCamera, drawNoCameraMessage } from "./common/camera.js";

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

function handleLicenseUpdate(license){
    console.log('Recognized License:', license)
    getAPICamera(license).then(responseGet => {
      return postS3(responseGet, license)
    }).then(responseS3 => {
      if (responseS3){
        let lotID = document.getElementById('chosenLot').value.split(": ")[1]
        return postAPICamera(lotID, license)
      }
    }).then(responsePost=>{
      if(responsePost){
        console.log('Allows car enter!')
        open_enter_bar()
      }else{
        console.log('Wait for vacancy!')
      }
    }).catch(error=>{
      console.error('Error in processing:', error)
    })
  }

function cameraWarning(event){
  let option = event.target.id
  if( option === 'denyCamera'){
    return false
  }else if( option === 'agreeCamera'){
    let validCamera = startCamera()
    if (validCamera){
      // Start recognition with callback
      startRecognition(handleLicenseUpdate)
    }else if(!validCamera){
      drawNoCameraMessage()
    }
  }
}
