import { postThirdPrime } from "../scripts/paymentScript.js"

let tappayDefaultStyle = {
    fields : {
        number: {
            // css selector
            element: '#card-number',
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            // DOM object
            element: document.getElementById('card-expiration-date'),
            placeholder: 'MM / YY'
        },
        ccv: {
            element: '#card-ccv',
            placeholder: 'CCV'
        }
    },
    styles: {
      // style valid state
        '.valid': {
            'color': 'green'
        },
        // style invalid state
        '.invalid': {
            'color': 'red'
        }
    },
    
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11
    }
}

function onUpdate(update) {
    // update.canGetPrime === true
    // // --> you can call TPDirect.card.getPrime()
    // console.log(
    //     `
    //     cardType (String): ${update.cardType}
    //     canGetPrime (boolean): ${update.canGetPrime}
    //     hasError (boolean): ${update.hasError}
    //     status.number (int): ${update.status.number}
    //     status.expiry (int): ${update.status.expiry}
    //     status.ccv (int): ${update.status.ccv}
    //     `
    // )
    let submitButton = document.querySelector('#tappayBtn')
    let paidCheck = document.getElementById('paidCheck')
    let unPaidCheck = document.getElementById('unpaidCheck')
    let overTimeCheck = document.getElementById('overTimeCheck')  
    let paidWarning = document.getElementById('paidWarning')
    if (paidCheck.checked){
        paidWarning.hidden = false
    }else if (update.canGetPrime && (unPaidCheck.checked || overTimeCheck.checked)) {
        // Enable submit Button to get prime.
        submitButton.removeAttribute('disabled')
    } else {
        // Disable submit Button to get prime.
        submitButton.setAttribute('disabled', true)
    }
    
    let creditCardIcon = document.getElementById('creditCardIcon')
    // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unknown']
    if (update.cardType === 'visa') {
        creditCardIcon.classList.remove('fa-regular','fa-credit-card')
        creditCardIcon.classList.add('fa-brands', 'fa-cc-visa')
    } else if (update.cardType === 'mastercard'){
        creditCardIcon.classList.remove('fa-regular','fa-credit-card')
        creditCardIcon.classList.add('fa-brands', 'fa-cc-mastercard')
    } else if (update.cardType === 'jcb'){
        creditCardIcon.classList.remove('fa-regular','fa-credit-card')
        creditCardIcon.classList.add('fa-brands', 'fa-cc-jcb')
    } else if (update.cardType === 'amex'){
        creditCardIcon.classList.remove('fa-regular','fa-credit-card')
        creditCardIcon.classList.add('fa-brands', 'fa-cc-amex')
    } else if (update.cardType === 'unknown'){
        creditCardIcon.classList = 'pe-1 fa-regular fa-credit-card'
    }

    // // number 欄位是錯誤的
    // if (update.status.number === 2) {
    //     // setNumberFormGroupToError()
    // } else if (update.status.number === 0) {
    //     // setNumberFormGroupToSuccess()
    // } else {
    //     // setNumberFormGroupToNormal()
    // }
    
    // if (update.status.expiry === 2) {
    //     // setNumberFormGroupToError()
    // } else if (update.status.expiry === 0) {
    //     // setNumberFormGroupToSuccess()
    // } else {
    //     // setNumberFormGroupToNormal()
    // }
    
    // if (update.status.ccv === 2) {
    //     // setNumberFormGroupToError()
    // } else if (update.status.ccv === 0) {
    //     // setNumberFormGroupToSuccess()
    // } else {
    //     // setNumberFormGroupToNormal()
    // }
}

async function onSubmit(event, lotID) {
    // prevent default
    event.preventDefault()
    // 取得 TapPay Fields 的 status
    let tappayStatus = TPDirect.card.getTappayFieldsStatus()

    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        alert('can not get prime')
        return
    }

    // Get prime
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            alert('get prime error ' + result.msg)
            return
        }
        // alert('get prime 成功，prime: ' + result.card.prime)
        let prime = result.card.prime
        // send prime to your server, to pay with Pay by Prime API .
        // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
        
        postThirdPrime(prime, lotID)
    })
}

async function getLinePayPrime(){
    return new Promise((resolve, reject) => {
        TPDirect.linePay.getPrime(function(primeObj){
            if (primeObj && primeObj.msg === 'Success') {
                resolve(primeObj);
            } else {
                reject(new Error('Failed to get prime object'));
            }
        })
    })
    
}

async function getEasyWalletPrime(){
    return new Promise((resolve, reject) => {
        TPDirect.easyWallet.getPrime(function(error, result){
            if (error){
                reject(new Error(error))
            }else if(result.status !== 0){
                reject(new Error(result.msg))
            }else{
                resolve(result)
            }
        })
    })
}

export {onUpdate, onSubmit, tappayDefaultStyle, getLinePayPrime, getEasyWalletPrime}