import { tokenValidation } from "./common/login.js";
import { startRecognition, getAPICamera, postAPICamera, postS3, open_enter_bar, get_parking_lots, render_chosen_lot, render_lot_input, render_cars_list, search_cars_by_input, render_car_card } from "./modules/admin_module.js";

async function adminFlow (){
  // token validation
  let adminID = await tokenValidation()
  

  // get parking lot list
  let parkingLotList = await get_parking_lots(adminID)
  render_chosen_lot(parkingLotList)
  // render lot and detail
  render_lot_input()
  // render car list
  await render_cars_list()
  search_cars_by_input()
  
  // render car card
  render_car_card()
  // Access the camera
  navigator.mediaDevices.getUserMedia({video: true})
  .then(stream => {
    // Get the video element
    let video = document.getElementById('localVideo');
    // Set the srcObject of the video element to the stream
    video.srcObject = stream;
  })
  .catch(error => {
    console.error('Error accessing media devices', error)
  })

  function handleLicenseUpdate(license){
    console.log('Recognized License:', license)
    getAPICamera(license).then(responseGet => {
      return postS3(responseGet, license)
    }).then(responseS3 => {
      if (responseS3){
        return postAPICamera(adminID, license)
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
  // Start recognition with callback
  startRecognition(handleLicenseUpdate)
}

adminFlow()