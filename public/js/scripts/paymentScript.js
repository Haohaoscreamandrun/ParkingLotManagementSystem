import { uri } from "../common/server.js";
import { renderProcessBtn } from "../view/paymentView.js";

async function getCarByID(carID){
  try{
    let responseObj = await fetch(`${uri}/api/cars?carID=${carID}`, 
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
    let responseObj = await fetch(`${uri}/api/parkinglot?lotID=${lotID}`, 
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

async function postThirdPrime(prime, lotID, method='credit'){
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
    'merchant_id': undefined,
    'cardholder': undefined,
    'result_url': undefined
  }
  if (method === 'credit'){
    // render btn
    renderProcessBtn(false, true)
    requestBody.merchant_id = 'J842671395_TAISHIN'
    requestBody.cardholder = {
      'phone_number': phoneNumber,
      'name': userName,
      'email': email
    }
  } else if(method === 'linePay' || method === 'jkoPay'){
    requestBody.merchant_id = `J842671395_${method.toUpperCase()}`
    requestBody.cardholder = {
      'phone_number': '0912345678',
      'name': 'Jimmy',
      'email': 'abcd@gmial.com'
    }
    requestBody.result_url = {
      'frontend_redirect_url': `${uri}/thankyou/${lotID}`,
      'backend_notify_url': `${uri}/api/third/thirdPay/notify`,
      'go_back_url': uri
    }
  }

  let responseObj = await fetch(`${uri}/api/third/${method}`,
    {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    }
  )
  let response = await responseObj.json()
  if(responseObj.ok && response.ok && method === 'credit'){
    renderProcessBtn(true)
    setTimeout(() => {
      window.location.href = `${uri}/camera/${lotID}`
    }, 3000)
  } else if (responseObj.ok && response.error && method === 'credit'){
    renderProcessBtn(false, false, response.message)
  } else if (responseObj.ok && response.ok && (method === 'linePay' || method === 'jkoPay')){
    //redirect to line pay url
    window.location.href = response.payment_url
  }
}

export {getCarByID, getParkingLotByID, postThirdPrime}