import { useEffect, useRef, useState } from 'react';
import { FaDownload, FaPlay, FaStop, FaTimes, FaVideo } from 'react-icons/fa';
import { toast } from 'react-toastify';

const RealtimeVirtualTryOn = ({ isOpen, onClose, productImage, productTitle, clothingType = 'shirt' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [fps, setFps] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const processedCanvasRef = useRef(null);
  const processingIntervalRef = useRef(null);
  const fpsIntervalRef = useRef(null);
  const frameCountRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopSession();
    }
    
    return () => {
      stopSession();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      toast.success('Camera started successfully!');
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
  };

  const startVirtualTryOn = async () => {
    if (!productImage || !videoRef.current) {
      toast.error('Please ensure camera is ready and product is loaded');
      return;
    }

    setIsProcessing(true);

    try {
      // Convert product image to base64
      const productImageBase64 = await urlToBase64(productImage);
      
      // Start try-on session
      const response = await fetch('http://localhost:5001/api/tryon/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clothing_image: productImageBase64,
          clothing_type: clothingType.toLowerCase()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.session_id);
        setIsSessionActive(true);
        startFrameProcessing();
        startFPSCounter();
        toast.success('Virtual try-on started!');
      } else {
        toast.error(data.message || 'Failed to start virtual try-on');
      }
    } catch (error) {
      console.error('Error starting virtual try-on:', error);
      toast.error('Failed to start virtual try-on');
    } finally {
      setIsProcessing(false);
    }
  };

  const stopSession = async () => {
    // Stop frame processing
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }

    // Stop FPS counter
    if (fpsIntervalRef.current) {
      clearInterval(fpsIntervalRef.current);
      fpsIntervalRef.current = null;
    }

    // Stop backend session
    if (sessionId) {
      try {
        await fetch('http://localhost:5001/api/tryon/stop-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error stopping session:', error);
      }
    }

    setIsSessionActive(false);
    setSessionId(null);
    setFps(0);
    frameCountRef.current = 0;
    stopCamera();
  };

  const startFrameProcessing = () => {
    processingIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !processedCanvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const processedCanvas = processedCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const processedCtx = processedCanvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      processedCanvas.width = video.videoWidth;
      processedCanvas.height = video.videoHeight;

      // Draw current frame to hidden canvas
      ctx.drawImage(video, 0, 0);

      // Get frame data
      const frameData = canvas.toDataURL('image/jpeg', 0.8);

      try {
        // Send frame for processing
        const response = await fetch('http://localhost:5001/api/tryon/process-frame', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            frame: frameData
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Display processed frame directly on the visible canvas
          const processedImage = new Image();
          processedImage.onload = () => {
            processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
            processedCtx.drawImage(processedImage, 0, 0);
            frameCountRef.current++;
          };
          processedImage.src = data.processed_frame;
        } else {
          // If processing fails, show original frame
          processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
          processedCtx.drawImage(video, 0, 0);
        }
      } catch (error) {
        console.error('Error processing frame:', error);
        // On error, show original frame
        processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
        processedCtx.drawImage(video, 0, 0);
      }
    }, 100); // Process at ~10 FPS for smooth experience
  };

  const startFPSCounter = () => {
    fpsIntervalRef.current = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);
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

  const downloadCurrentFrame = () => {
    const canvas = isSessionActive ? processedCanvasRef.current : canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `virtual-tryon-${productTitle.replace(/\s+/g, '-')}-${Date.now()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
      toast.success('Image captured and downloaded!');
    } else {
      toast.error('No image to capture');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header Bar - Fixed at top */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${isSessionActive ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium">
                {isSessionActive ? 'Try-On Active' : 'Ready to Start'}
              </span>
            </div>
            {isSessionActive && (
              <div className="text-sm text-gray-300">
                FPS: {fps} • Processing: {clothingType}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Full Screen Camera/Video Display */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        {/* Camera video (hidden during processing) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isSessionActive ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        />
        
        {/* Processed result (shown during processing) */}
        <canvas
          ref={processedCanvasRef}
          className={`absolute inset-0 w-full h-full object-cover ${isSessionActive ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        />
        
        {/* Loading states */}
        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <FaVideo className="mx-auto mb-2 text-6xl" />
              <p className="text-xl">Starting camera...</p>
            </div>
          </div>
        )}
        
        {stream && !isSessionActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">👕</div>
              <p className="text-xl">Click "Start Try-On" to begin</p>
            </div>
          </div>
        )}
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-xl">Starting virtual try-on...</p>
            </div>
          </div>
        )}
        
        {/* Live indicator */}
        {isSessionActive && (
          <div className="absolute top-20 left-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            LIVE
          </div>
        )}
        
        {/* FPS counter */}
        {isSessionActive && (
          <div className="absolute top-20 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full">
            {fps} FPS
          </div>
        )}
      </div>

      {/* Bottom Control Bar - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 z-10">
        <div className="flex justify-center items-center gap-4">
          {!isSessionActive ? (
            <button
              onClick={startVirtualTryOn}
              disabled={isProcessing || !stream}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors text-lg ${
                isProcessing || !stream
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <FaPlay />
              {isProcessing ? 'Starting...' : 'Start Try-On'}
            </button>
          ) : (
            <>
              <button
                onClick={downloadCurrentFrame}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-lg"
              >
                <FaDownload />
                Capture
              </button>
              <button
                onClick={stopSession}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-lg"
              >
                <FaStop />
                Stop
              </button>
            </>
          )}
        </div>
        
        {/* Product Info Bar */}
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-300">
          <img
            src={productImage}
            alt={productTitle}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div>
            <span className="font-medium">{productTitle}</span>
            <span className="ml-2">({clothingType})</span>
          </div>
        </div>
      </div>

      {/* Instructions Overlay - Show only when not active */}
      {!isSessionActive && stream && (
        <div className="absolute bottom-20 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg text-center">
          <h4 className="font-bold mb-2">How to use:</h4>
          <p className="text-sm">
            Position yourself clearly in front of the camera • Click "Start Try-On" • 
            Move around to see how the clothing fits • Click "Capture" to save
          </p>
        </div>
      )}

      {/* Hidden canvases for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default RealtimeVirtualTryOn;
