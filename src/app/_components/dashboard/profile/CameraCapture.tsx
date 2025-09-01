"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Check, X, Loader2, SwitchCamera, Focus, Zap, ZapOff } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

interface CameraConstraints {
  width: { min: number; ideal: number; max: number };
  height: { min: number; ideal: number; max: number };
  facingMode: string;
  frameRate: { ideal: number };
}

export default function CameraCapture({ onCapture, onCancel, isUploading = false }: CameraCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const facingMode = 'environment'; // Always use back camera
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);



  // Get optimal camera constraints for high quality
  const getCameraConstraints = useCallback((): MediaStreamConstraints => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { exact: facingMode },
        width: { min: 640, ideal: isMobile ? 1920 : 2560, max: 4096 },
        height: { min: 480, ideal: isMobile ? 1080 : 1440, max: 2160 },
        frameRate: { ideal: 30, max: 60 },
        aspectRatio: { ideal: 16 / 9 }
      },
      audio: false
    };

    return constraints;
  }, [facingMode]);

  // Initialize camera with high-quality settings
  const initializeCamera = useCallback(async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Clean up existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = getCameraConstraints();
      let stream: MediaStream;

      try {
        // Try with exact facingMode first
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: any) {
        // Fallback to ideal facingMode if exact fails
        const videoConstraints = constraints.video as MediaTrackConstraints;
        constraints.video = {
          ...videoConstraints,
          facingMode: { ideal: facingMode }
        };

        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (fallbackErr: any) {
          // Final fallback - any camera with high resolution
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { min: 640, ideal: 1920, max: 4096 },
              height: { min: 480, ideal: 1080, max: 2160 },
              frameRate: { ideal: 30 }
            },
            audio: false
          });
        }
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            const { videoWidth, videoHeight } = videoRef.current;
            setVideoSize({ width: videoWidth, height: videoHeight });
            console.log(`Camera resolution: ${videoWidth}x${videoHeight}`);
          }
          setIsInitializing(false);
          setIsCameraReady(true);
        };

        videoRef.current.onerror = () => {
          setError("Failed to load camera stream.");
          setIsInitializing(false);
        };

        // Enable autofocus if supported
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          try {
            const capabilities = videoTrack.getCapabilities();
            if ('focusMode' in capabilities && Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes('continuous')) {
              await videoTrack.applyConstraints({
                advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet]
              });
            }
          } catch (err) {
            console.warn('Autofocus not supported:', err);
          }
        }
      }
    } catch (err: any) {
      console.error("Camera initialization error:", err);
      setIsInitializing(false);

      if (err.name === 'NotAllowedError') {
        setError("Camera permission denied. Please allow camera access and try again.");
      } else if (err.name === 'NotFoundError') {
        setError("No camera found. Please make sure your device has a camera.");
      } else if (err.name === 'NotReadableError') {
        setError("Camera is busy or in use. Please close other camera apps and try again.");
      } else if (err.name === 'OverconstrainedError') {
        setError("Camera doesn't support the requested quality. Trying lower resolution...");
        // Retry with lower constraints
        setTimeout(() => {
          navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode, width: 1280, height: 720 },
            audio: false
          }).then(stream => {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            setIsInitializing(false);
            setIsCameraReady(true);
            setError(null);
          }).catch(() => {
            setError("Unable to access camera with any quality settings.");
          });
        }, 1000);
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  }, [facingMode, getCameraConstraints]);

  // Cleanup camera stream
  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Capture high-quality photo with proper processing
  const capturePhoto = useCallback(() => {
    if (!isCameraReady || !videoRef.current) {
      console.error("Camera is not ready");
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { alpha: false });

      if (!context) {
        setError("Failed to capture photo. Please try again.");
        return;
      }

      // Get actual video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Set canvas to maximum quality
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Enable high-quality rendering
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      // Always use back camera - no flipping needed
      context.drawImage(video, 0, 0, videoWidth, videoHeight);

      // Use maximum quality JPEG with minimal compression
      const imageData = canvas.toDataURL('image/jpeg', 0.95);

      console.log(`Captured image: ${videoWidth}x${videoHeight}, Size: ${Math.round(imageData.length / 1024)}KB`);
      console.log('Stream active after capture:', streamRef.current?.active);
      setCapturedImage(imageData);
    } catch (err) {
      console.error("Error capturing photo:", err);
      setError("Failed to capture photo. Please try again.");
    }
  }, [isCameraReady]);

  // Confirm capture and upload
  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    console.log('Retaking photo - Current stream active:', streamRef.current?.active);
    console.log('Video element state:', videoRef.current?.videoWidth, videoRef.current?.videoHeight);

    setCapturedImage(null);

    // Check if stream is still active and working
    if (streamRef.current?.active && (videoRef.current?.videoWidth ?? 0) > 0) {
      // Stream is good, just clear the captured image
      console.log('Stream still active, just clearing captured image');
      return;
    }

    // Stream needs reinitialization
    console.log('Reinitializing camera stream');
    setIsCameraReady(false);
    setIsInitializing(true);
    setError(null);

    // Clean up current stream first
    cleanupCamera();

    // Small delay to ensure cleanup, then reinitialize camera
    setTimeout(() => {
      initializeCamera();
    }, 200);
  }, [initializeCamera, cleanupCamera]);

  // Cancel and cleanup
  const handleCancel = useCallback(() => {
    cleanupCamera();
    onCancel();
  }, [onCancel, cleanupCamera]);

  // Camera switching removed - always use back camera

  // Tap to focus (if supported)
  const handleVideoClick = useCallback(async (e: React.MouseEvent) => {
    if (!streamRef.current) return;

    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const capabilities = videoTrack.getCapabilities();
      if ('focusMode' in capabilities && Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes('single-shot')) {
        await videoTrack.applyConstraints({
          advanced: [{ focusMode: 'single-shot' } as MediaTrackConstraintSet]
        });
      }
    } catch (err) {
      console.warn('Focus not supported:', err);
    }
  }, []);

  // Initialize camera on mount and when facingMode changes
  useEffect(() => {
    initializeCamera();

    // Cleanup on unmount
    return () => {
      cleanupCamera();
    };
  }, [initializeCamera, cleanupCamera]);

  // Show error state
  if (error) {
    return (
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Error Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* Error Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6">
            <Camera className="h-12 w-12 text-red-600" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-white mb-4 tracking-tight">
            CAMERA ERROR
          </h1>

          {/* Error Message */}
          <p className="text-gray-300 text-lg mb-8 max-w-md leading-relaxed">
            {error}
          </p>

          {/* Action Button */}
          <Button
            onClick={handleCancel}
            size="lg"
            className="bg-brand-bright-orange text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl mb-8"
          >
            Cancel
          </Button>

          {/* Troubleshooting Section */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 max-w-md">
            <p className="text-gray-400 text-sm mb-4 font-medium">
              If the error persists, try:
            </p>
            <ul className="text-left space-y-3 text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm">Refreshing the page</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm">Closing other camera apps</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm">Using a different browser</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-black">
      {/* Camera View */}
      <div className="relative flex-1 bg-black overflow-hidden">
        {!capturedImage ? (
          <>
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-600 mb-2" />
                  <p className="text-sm text-gray-600">Initialising camera...</p>
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onClick={handleVideoClick}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              style={{
                filter: 'contrast(1.1) saturate(1.1)'
              }}
            />
          </>
        ) : (
          <img
            src={capturedImage}
            alt="Captured progress photo"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'contrast(1.05) saturate(1.05)'
            }}
          />
        )}
      </div>

      {/* Camera Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-md">
        {!capturedImage && (
          <div className="flex justify-center items-center px-6 pt-4 pb-2">
            {/* Camera Info */}
            <div className="text-white text-xs opacity-75 text-center">
              <div>{videoSize.width}×{videoSize.height}</div>
              {/* <div>Back Camera</div> */}
            </div>
          </div>
        )}

        <div className="flex justify-center items-center gap-4 p-6 pb-8">
          {!capturedImage ? (
            <>
              {/* Capture Button - Large and prominent */}
              <div className="flex items-center gap-6">
                <Button onClick={handleCancel} variant="ghost" className="text-white hover:bg-white/20 px-6 py-3">
                  Cancel
                </Button>

                <Button
                  onClick={capturePhoto}
                  disabled={isInitializing || !isCameraReady}
                  className="bg-white hover:bg-gray-100 text-black rounded-full w-20 h-20 p-0 shadow-lg ring-4 ring-white/30 disabled:opacity-50 disabled:ring-gray-500/30"
                >
                  <Camera className="h-8 w-8" />
                </Button>

                <div className="w-16" /> {/* Spacer for symmetry */}
              </div>
            </>
          ) : (
            <>
              <Button
                onClick={retakePhoto}
                disabled={isUploading}
                variant="ghost"
                className="text-white hover:bg-white/20 px-6 py-3 rounded-full"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Retake
              </Button>

              <Button
                onClick={confirmCapture}
                disabled={isUploading}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full shadow-lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Save Photo
                  </>
                )}
              </Button>

              <Button
                onClick={handleCancel}
                disabled={isUploading}
                variant="ghost"
                className="text-white hover:bg-white/20 px-6 py-3 rounded-full"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Close Button */}
      <div className="absolute top-4 right-4 z-20 safe-area-pt">
        <Button
          onClick={handleCancel}
          variant="ghost"
          size="sm"
          className="bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 rounded-full w-10 h-10 p-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

    </div>
  );
}