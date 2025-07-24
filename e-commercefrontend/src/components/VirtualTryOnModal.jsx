import { useEffect, useRef, useState } from 'react';
import { FaCamera, FaDownload, FaRedo, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const VirtualTryOnModal = ({ isOpen, onClose, productImage, productTitle, clothingType = 'shirt' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const resultCanvasRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const processVirtualTryOn = async () => {
    if (!capturedImage || !productImage) {
      toast.error('Please capture an image first');
      return;
    }

    setIsProcessing(true);
    setResultImage(null);

    try {
      // Convert product image URL to base64
      const productImageBase64 = await urlToBase64(productImage);
      
      const response = await fetch('http://localhost:5001/api/tryon/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          person_image: capturedImage,
          clothing_image: productImageBase64,
          clothing_type: clothingType.toLowerCase(),
          background_type: 'clean'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResultImage(data.result_image);
        toast.success('Virtual try-on completed successfully!');
      } else {
        toast.error(data.message || 'Failed to process try-on');
      }
    } catch (error) {
      console.error('Error processing try-on:', error);
      toast.error('Failed to process virtual try-on. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const urlToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataURL);
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const downloadResult = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.download = `virtual-tryon-${productTitle.replace(/\s+/g, '-')}.jpg`;
      link.href = resultImage;
      link.click();
    }
  };

  const resetTryOn = () => {
    setCapturedImage(null);
    setResultImage(null);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-[#8B6B3E]">Virtual Try-On</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Trying on: {productTitle}</h3>
            <p className="text-gray-600 text-sm">
              Position yourself in front of the camera and capture your image to see how this {clothingType} looks on you!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Camera/Capture Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-[#8B6B3E]">Step 1: Capture Your Image</h4>
              
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <FaCamera className="mx-auto mb-2 text-4xl" />
                      <p>Camera will appear here</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                {isCameraActive ? (
                  <button
                    onClick={captureImage}
                    className="flex items-center gap-2 px-6 py-2 bg-[#8B6B3E] text-white rounded-lg hover:bg-[#6a5027] transition-colors"
                  >
                    <FaCamera />
                    Capture Image
                  </button>
                ) : (
                  <button
                    onClick={resetTryOn}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FaRedo />
                    Retake Photo
                  </button>
                )}
              </div>
            </div>

            {/* Result Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-[#8B6B3E]">Step 2: Virtual Try-On Result</h4>
              
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {resultImage ? (
                  <img
                    src={resultImage}
                    alt="Try-on Result"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">👕</div>
                      <p>Try-on result will appear here</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={processVirtualTryOn}
                  disabled={!capturedImage || isProcessing}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                    !capturedImage || isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#8B6B3E] text-white hover:bg-[#6a5027]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Try On
                    </>
                  )}
                </button>

                {resultImage && (
                  <button
                    onClick={downloadResult}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaDownload />
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <img
                src={productImage}
                alt={productTitle}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold">{productTitle}</h4>
                <p className="text-gray-600 text-sm">Type: {clothingType}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Note: The virtual try-on shows only the clothing without your body for the best visualization.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden canvases for image processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <canvas ref={resultCanvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default VirtualTryOnModal;
