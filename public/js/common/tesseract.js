let video = document.getElementById('localVideo')
let captured = document.getElementById('captureCanvas')
let canvas = document.getElementById('videoCanvas')

async function captureFrame(){
    // Capture frames from Video
    let context = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    captured.width = video.videoWidth
    captured.height = video.videoHeight
    context.drawImage(video, 0, 0, captured.width, captured.height)
  }

async function basicBinary(){
  // read mat from canvas
  let mat = cv.imread(canvas)
  // Gaussian Blur
  let gaussian = new cv.Mat();
  let ksize = new cv.Size(7, 7)
  cv.GaussianBlur(mat, gaussian, ksize, 0)
  
  // Convert the image to grayscale
  let gray = new cv.Mat()
  cv.cvtColor(gaussian, gray, cv.COLOR_RGBA2GRAY)
  
  // Apply thresholding
  let threshold = new cv.Mat();
  cv.threshold(gray, threshold, 127, 255, cv.THRESH_BINARY);
  
  // Morphological operations (閉合運算:可以將圖形內陷的銳角給鈍化)
  let kernel  = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));//Creates a rectangular structuring element of size 5x5 pixels. This defines the shape and size of the region used for the operation.
  cv.morphologyEx(threshold, threshold, cv.MORPH_CLOSE, kernel)// smooths the contours of the binary image by closing small gaps and holes.

  // Apply edge detection
  // let edges = new cv.Mat();
  // cv.Canny(threshold, edges, 50, 200); //Canny edge detection, 50-200 threshold of gradient magnitude, >200 definitely part of edge, <50 only include if connected to strong edge pixel.

  // Display
  cv.imshow('videoCanvas', threshold)
  cv.imshow('captureCanvas', gaussian)

  // Delete cv
  mat.delete()
  gaussian.delete()
  gray.delete()
  edges.delete()
  threshold.delete()
}

// Recognize
export async function recognizeLicensePlate(){
    // capture the license plate and do basic process
    await captureFrame()
    await basicBinary()
    // Tesseract worker
    try{
      let worker = new Tesseract.createWorker(['eng'], 1,
        {
          // logger: m => console.log(m),
          // errorHandler: err => console.error(err)
        }
      );
      worker = await worker
      await worker.setParameters({
          tessedit_pageseg_mode: 7,
          tessedit_char_whitelist: 'ABCDEFGHJKLMNPQRSTUVWXYZ012356789',
          load_system_dawg: false,
          load_freq_dawg: false
        });
      // get result
      let {data: {text: text, confidence: confidence}} = await worker.recognize(canvas)
      // process result
      let licensePlate = ''
      text.replace(/ /g, '\n').split("\n").forEach(candidate => {
        if (candidate.trim().length >= 5 && candidate.trim().length <= 7){
          licensePlate = candidate.trim()
          return
        }
      })
      // terminate worker
      await worker.terminate()
      
      if (licensePlate.length > 0){
        let recognizedPlateInput = document.querySelector('#recognizedPlate')
        recognizedPlateInput.value = `Reading... ${licensePlate}, conf. lv: ${confidence}`
        // return car plate
        return [licensePlate, confidence]
      } else {
        return ["", 0]
      }
            
    } catch (error) {
      console.error(error)
    }
  }