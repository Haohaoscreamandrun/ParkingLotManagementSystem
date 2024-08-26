import { uri } from "../common/server.js";
import { postS3 } from "../common/s3.js";
import { openEnterBar, drawCameraMessage } from "../view/cameraView.js";

async function getS3UploadURL(license){
  try{
    let responseObj = await fetch(`${uri}/api/camera?license=${license}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    })
    let response = await responseObj.json()
    if (responseObj.ok){
      return response.data
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    alert('Error fetch to backend:', error)
  }
}

async function postNewCar(lotID, license){
  try{
    let requestBodyObj = {
      'lotID': lotID,
      'license': license
    }
    let responseObj = await fetch(`${uri}/api/cars`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBodyObj)
    })
    let response = await responseObj.json()
    if (responseObj.ok){
      return response.ok
    } else if (response.error){
      return response.message
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    alert('Error fetch to backend:', error)
  }
}

async function deleteCar(lotID, license){
  
  try{
    let responseObj = await fetch(`${uri}/api/cars/${license}?lot_id=${lotID}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json'
      }
    })
    let response = await responseObj.json()
    if (responseObj.ok){
      return response.ok
    } else if (response.error){
      return response.message
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    alert('Error fetch to backend:', error)
  }
}


async function handleLicenseUpdate(license){
  console.log('Recognized License:', license)
  let enterRadio = document.getElementById('enterRadio')
  let exitRadio = document.getElementById('exitRadio')
  try{
    let lotID
    // at admin
    if (window.location.href.includes('admin')){
      lotID = document.getElementById('chosenLot').value.split(": ")[1]
    // at camera
    } else if(window.location.href.includes('camera')){
      lotID = window.location.href.split('/')[4]
    }

    if (enterRadio.checked){
      let responsePost = await postNewCar(lotID, license)
      if (responsePost === true){
        let responseGet = await getS3UploadURL(license)
        let postS3Response = await postS3(responseGet, license)
        drawCameraMessage(`Welcome! ${license}`)
        openEnterBar()
      } else if (typeof responsePost === 'string'){
        drawCameraMessage(responsePost)
      }
    } else if (exitRadio.checked){
      let responseDelete = await deleteCar(lotID, license)
      if(responseDelete === true){
        drawCameraMessage(`Bye! ${license}`)
        openEnterBar()
      } else if (typeof responseDelete === 'string'){
        drawCameraMessage(responseDelete)
      }
    }
  } catch (error){
    console.log("Error:", error)
  }
}

export {handleLicenseUpdate}