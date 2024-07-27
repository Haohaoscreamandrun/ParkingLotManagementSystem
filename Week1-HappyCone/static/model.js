
async function render(){
  let url = window.location.href
  let response = await fetch(url+"api/getrds", {
    method: "GET"
  })
  response = await response.json()
  let container = document.getElementById('message')
  let insertHTML = ''
  response.forEach((obj) => {
    insertHTML += `
    <div class="col">
      <div class="card border-dark" style="width: 18rem;">
        <img src="${obj.url}" class="card-img-top" alt="...">
        <div class="card-body">
          <p class="card-text">${obj.text}</p>
        </div>
      </div>
    </div>
    `
  })
  container.innerHTML = insertHTML
}

render()

document.getElementById('submitImg').addEventListener('submit', async function(event){
  event.preventDefault()

  // get input values
  let textInputValue = document.getElementById('textInput').value
  let fileInput = document.getElementById('formFile')
  let file = fileInput.files[0]

  let formData = new FormData()
  formData.append("text", textInputValue)
  formData.append("file", file)

  // send it to backend
  let url = window.location.href
  let respond = await fetch(url+"api/postimg", {
    method: "POST",
    body: formData
  })
  let response = await respond.json()
  if (!respond.ok){
    alert(response.content)
  } else {
    // Reload the current page
    location.reload();
  }
  
})