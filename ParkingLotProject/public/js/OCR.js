let fileSelector = document.querySelector('input')
let process = document.querySelector('.process')
let start = document.querySelector('.recognize')
let img = document.querySelector('img')
let canvas = document.getElementById('outputCanvas')
let progress = document.querySelector('.progress')
let textarea = document.querySelector("textarea")
let imgURL = ''

//Show image uploaded
fileSelector.onchange = () => {
  let file = fileSelector.files[0]
  imgURL = window.URL.createObjectURL(new Blob([file], { type: 'image/jpg' }))
  img.src = imgURL
}

//Process the image
process.addEventListener('click', async() => {
  let mat = cv.imread(img)
  cv.imshow('outputCanvas', mat)
})

// start to recognize text
start.addEventListener('click', async() => {
  textarea.innerHTML = ''
  let worker = new Tesseract.createWorker(['eng'], 1,{
  logger: m => console.log(m),
  errorHandler: err => console.error(err)});
  worker = await worker
  let {data: {text, confidence}} = await worker.recognize(imgURL)
  console.log(`Text: ${text}`)
  console.log(`Confidence: ${confidence}`)
  textarea.innerHTML = `Recognize Confidence: ${confidence} \r\nRecognied Text: \r\n${text}`
  await worker.terminate()
})
