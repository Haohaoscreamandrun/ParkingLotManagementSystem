import { uri } from "../common/server.js";
import { renderProcessBtn } from "../view/paymentView.js";

async function getCarByID(carID){
  try{
    let responseObj = await fetch(`${uri}/api/cars/${carID}`, 
      {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
    })
    
    let response = await responseObj.json()
    
    if (responseObj.ok && response.data === null){
      // find not car by this ID
      return null
    } else if (responseObj.ok && response.data.length > 0){
      // find a car by this ID
      return response.data
    } else {
      // other error
      console.log("enter new Error loop")
      throw new Error(response.message)
    }
  } catch (error) {
    // catch other error
    alert('Error fetch to backend:', error)
    console.log(error)
  }
}

async function getParkingLotByID(lotID){
  try{
    let responseObj = await fetch(`${uri}/api/parkinglot/${lotID}`, 
      {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
    })
    
    let response = await responseObj.json()
    if (responseObj.ok && response.data === null){
      // find not lot by this ID
      return null
    } else if (responseObj.ok && response.data.length > 0){
      // find a lot by this ID
      return response.data
    } else {
      // other error
      console.log("enter new Error loop")
      throw new Error(response.message)
    }
  } catch (error) {
    // catch other error
    alert('Error fetch to backend:', error)
    console.log(error)
  }
}

async function postThirdPrime(prime, lotID){
  // render btn
  renderProcessBtn(false, true)
  // get post data
  let carID = window.location.href.split('/')[4]
  let subTotal = document.getElementById('parkingFee').value
  let userName = document.getElementById('userName').value
  let phoneNumber = document.getElementById('phoneNumber').value
  let email = document.getElementById('email').value
  // construct request body
  let requestBody = {
    'prime': prime,
    'car': {
      'id': parseInt(carID),
      'sub_total': parseInt(subTotal)
    },
    'card_holder':{
      'phone_number': phoneNumber,
      'name': userName,
      'email': email
    }
  } 
  let responseObj = await fetch(`${uri}/api/third/credit`,
    {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    }
  )
  let response = await responseObj.json()
  if(responseObj.ok && response.ok){
    renderProcessBtn(true)
    setTimeout(() => {
      window.location.href = `${uri}/camera/${lotID}`
    }, 3000)
  } else if (responseObj.ok && response.error){
    renderProcessBtn(false, false, response.message)
  }
}

export {getCarByID, getParkingLotByID, postThirdPrime}