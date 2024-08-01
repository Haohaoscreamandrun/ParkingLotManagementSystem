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
  console.log(imgURL)
}

//Process the image
process.addEventListener('click', async() => {
  try{
    // Load the image
    let mat = cv.imread(img)
    // Convert the image to grayscale
    let gray = new cv.Mat()
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY)
    // Apply edge detection
    let edges = new cv.Mat();
    cv.Canny(gray, edges, 50, 200); //Canny edge detection, 50-200 threshold of gradient magnitude, >200 definitely part of edge, <50 only include if connected to strong edge pixel. 
    
    // Apply thresholding
    let threshold = new cv.Mat();
    cv.threshold(gray, threshold, 127, 255, cv.THRESH_BINARY);
    
    // Morphological operations
    let kernel  = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));//Creates a rectangular structuring element of size 5x5 pixels. This defines the shape and size of the region used for the operation.
    cv.morphologyEx(threshold, threshold, cv.MORPH_CLOSE, kernel)// smooths the contours of the binary image by closing small gaps and holes.
    
    // Find contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(threshold, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

    //Iterate through contours
    let licensePlate = null
    for (let i=0; i < contours.size(); i++){
      let contour = contours.get(i); //Retrieves the i-th contour from the MatVector. Each contour is represented as a list of points that outline the shape.
      let rect = cv.boundingRect(contour); //Computes the smallest rectangle that encloses the contour. 
      let aspectRatio = rect.width / rect.height; //This is useful for identifying the shape of the object. For example, a license plate might have a specific aspect ratio range.
      if (aspectRatio > 1.8 && aspectRatio < 2.2){
        console.log(`find ${i}`)
        licensePlate = rect
        break
      }
    }
    let roi = threshold.roi(licensePlate)
    // Calculate new dimensions while maintaining aspect ratio
    let maxWidth = 500; // Desired maximum width
    let maxHeight = 400; // Desired maximum height

    let originalWidth = mat.cols;
    let originalHeight = mat.rows;

    let newWidth, newHeight;

    // Calculate new dimensions
    if (originalWidth / originalHeight > maxWidth / maxHeight) {
      newWidth = maxWidth;
      newHeight = Math.round((maxWidth / originalWidth) * originalHeight);
    } else {
      newHeight = maxHeight;
      newWidth = Math.round((maxHeight / originalHeight) * originalWidth);
    }

    let resize = new cv.Mat()
    let newSize = new cv.Size(newWidth, newHeight)
    cv.resize(roi, resize, newSize, 0, 0, cv.INTER_CUBIC)

    // Display
    cv.imshow('outputCanvas', resize)
    

    imgURL = canvas.toDataURL('image/png')
    
    // Delete Mat
    mat.delete()
    gray.delete()
    edges.delete()
    threshold.delete()
    hierarchy.delete()
    roi.delete();
    resize.delete()
  } catch (error){
    console.error(error)
  }
})

// start to recognize text
start.addEventListener('click', async() => {
  textarea.innerHTML = ''
  let worker = new Tesseract.createWorker(['eng'], 1,{
  logger: m => console.log(m),
  errorHandler: err => console.error(err)});
  worker = await worker
  await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    });
  let {data: {text, confidence}} = await worker.recognize(imgURL)
  console.log(`Text: ${text}`)
  console.log(`Confidence: ${confidence}`)
  textarea.innerHTML = `Recognize Confidence: ${confidence} \r\nRecognied Text: \r\n${text}`
  await worker.terminate()
})
