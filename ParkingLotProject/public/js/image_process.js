// Import the OpenCV.js library
import cv from 'opencv.js'
// Load the image
let src = cv.imread('../images/WM-8888.jpg')
console.log(src)
// Convert the image to grayscale
let gray = new cv.Mat()
cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
// Resize the image
let resized = new cv.Mat()

