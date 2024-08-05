let fileSelector = document.querySelector('input')
let process = document.querySelector('.process')
let start = document.querySelector('.recognize')
let img = document.querySelector('img')
let canvas = document.getElementById('outputCanvas')
let progress = document.querySelector('.progress')
let textarea = document.querySelector("textarea")
let file
let imgURL1 = ''
let imgURL2 = ''

//Show image uploaded
fileSelector.onchange = () => {
  file = fileSelector.files[0]
  imgURL1 = window.URL.createObjectURL(new Blob([file], { type: 'image/jpg' }))
  img.src = imgURL1
}

//Process the image
process.addEventListener('click', async() => {
  try{
    // Load the image
    let mat = cv.imread(img)
    
    let threshold = basicBinary(mat)
    
    // // Find contours
    // let contours = new cv.MatVector();
    // let hierarchy = new cv.Mat();
    // cv.findContours(threshold, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    // //Iterate through contours
    // let contoursArray = [];
    // let licensePlate = null
    // for (let i=0; i < contours.size(); i++){
    //   let contour = contours.get(i); //Retrieves the i-th contour from the MatVector. Each contour is represented as a list of points that outline the shape.
    //   contoursArray.push(contour)
    // }
    // contoursArray.sort((a, b) => cv.contourArea(b) - cv.contourArea(a))
    // let location = null
    // for (let i = 0; i < 10; i++) {
    //   let contour = contoursArray[i];
      
    //   let rect = cv.boundingRect(contour); //Computes the smallest rectangle that encloses the contour. 
    //   let aspectRatio = rect.width / rect.height; //This is useful for identifying the shape of the object. For example, a license plate might have a specific aspect ratio range.
    //   if (aspectRatio > 1.7 && aspectRatio < 2.3){
    //     licensePlate = rect
    //     console.log('find one')
    //     break
    //   }
      // let approx = new cv.Mat()
      // let epsilon = 0.01 * cv.arcLength(contour, true)
      // cv.approxPolyDP(contour, approx, epsilon, true)
      // console.log(approx.size().height)
      // if(approx.size().height == 4){
      //   location = approx
      //   break
      // }
    // }
    // // Log the location
    // if (location) {
    //     console.log("Location: ", location.data32S);
    // } else {
    //     console.log("Location: Not found");
    // }
    // // Create a blank image with the same dimensions as the original image
    // let mask = new cv.Mat.zeros(mat.rows, mat.cols, cv.CV_8UC1)
    // // Create an empty MatVector and add the location to it
    // let matVector = new cv.MatVector();
    // matVector.push_back(location);
    // // Draw contours on the mask image
    // cv.drawContours(mask, matVector, 0, new cv.Scalar(255), -1)
    // // Take bitwise AND between the original image and mask image
    // let cropped = new cv.Mat()
    // cv.bitwise_and(mat, mat, cropped, mask)

    
    // let roi = threshold.roi(licensePlate)
    
    // Display
    cv.imshow('outputCanvas', threshold)
    

    imgURL2 = canvas.toDataURL('image/png')
    
    // Delete Mat
    mat.delete()
    threshold.delete()
    // hierarchy.delete()
    // approx.delete();
    // contours.delete();
    // roi.delete();
    // resize.delete()
  } catch (error){
    console.error(error)
  }
})

function basicBinary(mat){
  
  // Gaussian Blur
  let gaussian = new cv.Mat();
  let ksize = new cv.Size(7, 7)
  cv.GaussianBlur(mat, gaussian, ksize, 0)
  
  // Convert the image to grayscale
  let gray = new cv.Mat()
  cv.cvtColor(gaussian, gray, cv.COLOR_RGBA2GRAY)
  
  // Apply edge detection
  let edges = new cv.Mat();
  cv.Canny(gray, edges, 50, 200); //Canny edge detection, 50-200 threshold of gradient magnitude, >200 definitely part of edge, <50 only include if connected to strong edge pixel. 
  
  // Apply thresholding
  let threshold = new cv.Mat();
  cv.threshold(gray, threshold, 127, 255, cv.THRESH_BINARY);
  
  // Morphological operations (閉合運算:可以將圖形內陷的銳角給鈍化)
  let kernel  = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));//Creates a rectangular structuring element of size 5x5 pixels. This defines the shape and size of the region used for the operation.
  cv.morphologyEx(threshold, threshold, cv.MORPH_CLOSE, kernel)// smooths the contours of the binary image by closing small gaps and holes.

  // Delete cv
  gaussian.delete()
  gray.delete()
  edges.delete()

  return threshold
}

// start to recognize text
start.addEventListener('click', async() => {
  try{
    textarea.innerHTML = ''
    let worker = new Tesseract.createWorker(['eng'], 1,
      {
        logger: m => console.log(m),
        errorHandler: err => console.error(err)
      }
    );
    worker = await worker
    await worker.setParameters({
        tessedit_pageseg_mode: 7,
        tessedit_char_whitelist: 'ABCDEFGHJKLMNPQRSTUVWXYZ012356789'
      });
    let {data: {text: text1, confidence: confidence1}} = await worker.recognize(imgURL1)
    let {data: {text: text2, confidence: confidence2}} = await worker.recognize(imgURL2)
    textarea.innerHTML = `Upload:\r\nRecognize Confidence: ${confidence1} \r\nRecognied Text: \r\n${text1}\r\nProcessed:\r\nRecognize Confidence: ${confidence2} \r\nRecognied Text: \r\n${text2}`

    // post the image and plate number
    let licensePlate = ''
    text2.split("\n").forEach(candidate => {
      if (candidate.trim().length >= 5 && candidate.trim().length <= 7){
        licensePlate = candidate.trim()
        return
      }
    })
    if (!licensePlate){
      text1.split("\n").forEach(candidate => {
      if (candidate.trim().length >= 5 && candidate.trim().length <= 7){
        licensePlate = candidate.trim()
        return
      }
    })
    }
    let postForm = new FormData()
    postForm.append('imageFile', file)
    postForm.append('recognized', licensePlate)
    let respond = await fetch('/api/ocr',{
      method: "POST",
      body: postForm
    })
    let response = await respond.json()
    console.log(response)
    await worker.terminate()
  } catch (error) {
    console.error(error)
  }
})
