document.getElementById('submitImg').addEventListener('submit', async function(event){
  event.preventDefault()

  // get input values
  let textInputValue = document.getElementById('textInput').value
  let fileInput = document.getElementById('formFile')
  let file = fileInput.files[0]

  console.log('Text Input:', textInputValue);
  console.log('File:', file);

  let formData = new FormData()
  formData.append("text", textInputValue)
  formData.append("file", file)

  // send it to backend
  let url = window.location.href
  let response = fetch(url+"api/postimg", {
    method: "POST",
    body: formData
  })
  response = await (await response).json()
  console.log(response)
  // reset form
  document.getElementById('submitImg').reset();
})