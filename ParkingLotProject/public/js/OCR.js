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
    // Gaussian Blur
    let gaussian = new cv.Mat();
    let ksize = new cv.Size(7, 7)
    cv.GaussianBlur(mat, gaussian, ksize, 0)
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
    cv.findContours(edges, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

    //Iterate through contours
    let contoursArray = [];
    let licensePlate = null
    for (let i=0; i < contours.size(); i++){
      let contour = contours.get(i); //Retrieves the i-th contour from the MatVector. Each contour is represented as a list of points that outline the shape.
      contoursArray.push(contour)
    }
    contoursArray.sort((a, b) => cv.contourArea(b) - cv.contourArea(a))
    let location = null
    for (let i = 0; i < 10; i++) {
      let contour = contoursArray[i];
      // let rect = cv.boundingRect(contour); //Computes the smallest rectangle that encloses the contour. 
      // let aspectRatio = rect.width / rect.height; //This is useful for identifying the shape of the object. For example, a license plate might have a specific aspect ratio range.
      // if (aspectRatio > 1.7 && aspectRatio < 2.3){
      //   licensePlate = rect
      //   console.log('find one')
      //   break
      // }
      let approx = new cv.Mat()
      let epsilon = 0.01 * cv.arcLength(contour, true)
      cv.approxPolyDP(contour, approx, epsilon, true)
      console.log(approx.size().height)
      if(approx.size().height == 4){
        location = approx
        break
      }
    }
    // Log the location
    if (location) {
        console.log("Location: ", location.data32S);
    } else {
        console.log("Location: Not found");
    }
    // Create a blank image with the same dimensions as the original image
    let mask = new cv.Mat.zeros(gray.rows, gray.cols, cv.CV_8UC1)
    // Create an empty MatVector and add the location to it
    let matVector = new cv.MatVector();
    matVector.push_back(location);
    // Draw contours on the mask image
    cv.drawContours(mask, matVector, 0, new cv.Scalar(255), -1)
    // Take bitwise AND between the original image and mask image
    let cropped = new cv.Mat()
    cv.bitwise_and(mat, mat, cropped, mask)

  
    // let roi = threshold.roi(licensePlate)
    // // Calculate new dimensions while maintaining aspect ratio
    // let maxWidth = 500; // Desired maximum width
    // let maxHeight = 400; // Desired maximum height

    // let originalWidth = mat.cols;
    // let originalHeight = mat.rows;

    // let newWidth, newHeight;

    // // Calculate new dimensions
    // if (originalWidth / originalHeight > maxWidth / maxHeight) {
    //   newWidth = maxWidth;
    //   newHeight = Math.round((maxWidth / originalWidth) * originalHeight);
    // } else {
    //   newHeight = maxHeight;
    //   newWidth = Math.round((maxHeight / originalHeight) * originalWidth);
    // }

    // let resize = new cv.Mat()
    // let newSize = new cv.Size(newWidth, newHeight)
    // cv.resize(roi, resize, newSize, 0, 0, cv.INTER_CUBIC)

    // Display
    cv.imshow('outputCanvas', cropped)
    

    imgURL = canvas.toDataURL('image/png')
    
    // Delete Mat
    mat.delete()
    gray.delete()
    edges.delete()
    threshold.delete()
    hierarchy.delete()
    // approx.delete();
    contours.delete();
    // roi.delete();
    // resize.delete()
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
