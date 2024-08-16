import { tokenValidation } from "./common/login.js";
import { startRecognition, getAPICamera, postAPICamera, postS3, open_enter_bar, get_parking_lots, render_chosen_lot, render_lot_input, render_cars_list } from "./adminmodule/module.js";

async function adminFlow (){
  // token validation
  let adminID = await tokenValidation()
  console.log(`Get admin data, admin Id is ${adminID}`)

  // get parking lot list
  let parkingLotList = await get_parking_lots(adminID)
  render_chosen_lot(parkingLotList)
  render_lot_input()
  // render car list
  await render_cars_list()
  
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