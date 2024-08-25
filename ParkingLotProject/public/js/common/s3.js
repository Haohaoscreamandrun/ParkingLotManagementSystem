export async function postS3(responseAPI, license){
  try{
    let captured = document.getElementById('captureCanvas')
    let blob = await new Promise((resolve) => {
      captured.toBlob((blob) => {
        resolve(blob)
      }, 'image/png')
    })
    
    let formDataS3 = new FormData()
    Object.entries(responseAPI.fields).forEach(([key, value]) => {
      formDataS3.append(key, value)
    })
    formDataS3.append('file', blob, `${license}.png`)
    
    let responseObj = await fetch(responseAPI.url, {
      method: "POST",
      body: formDataS3,
      mode: 'cors'
    })
    if (responseObj.ok) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}