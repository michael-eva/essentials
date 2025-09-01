"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Check, X, Loader2, RotateCw } from "lucide-react";
import { toast } from "sonner";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

export default function CameraCapture({ onCapture, onCancel, isUploading = false }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // Default to back camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setIsInitializing(true);
      setIsVideoReady(false);
      setError(null);

      // Ensure running in a browser with supported MediaDevices API
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        setError("Camera can only be used in the browser environment.");
        return;
      }

      const host = window.location.hostname;
      const protocol = window.location.protocol;
      const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.localhost');
      const isNgrok = host.includes('ngrok') || host.includes('ngrok-free.app');
      
      // Mobile browsers are stricter about secure contexts
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (!window.isSecureContext && !isLocalHost) {
        const suggestion = isNgrok 
          ? "Use 'ngrok http --scheme=https 3000' to get HTTPS tunneling"
          : isMobile 
            ? "Mobile browsers require HTTPS for camera access. Use ngrok with HTTPS or access from desktop for testing."
            : "Camera requires HTTPS. Use a secure connection or localhost for testing.";
            
        setError(`Camera requires a secure context (HTTPS).
        
Current: ${protocol}//${host}
Device: ${isMobile ? 'Mobile' : 'Desktop'}
Secure Context: ${window.isSecureContext}

${suggestion}`);
        return;
      }

      // Enhanced mobile browser detection
      if (!navigator.mediaDevices?.getUserMedia) {
        const debugInfo = `
          - Host: ${host}
          - Secure Context: ${window.isSecureContext}
          - MediaDevices: ${!!navigator.mediaDevices}
          - GetUserMedia: ${!!navigator.mediaDevices?.getUserMedia}
          - Protocol: ${window.location.protocol}
          - User Agent: ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
        `;
        
        setError(`Camera API not available. This usually happens on mobile browsers without HTTPS.
        
Debug Info:${debugInfo}

Try:
1. Use HTTPS (ngrok with --scheme=https)
2. Access via desktop browser for testing
3. Ensure your ngrok URL uses https://`);
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: facingMode // Use current facing mode state
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Reset video ready state when setting new stream
        setIsVideoReady(false);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof Error) {
        // See https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
        // Handle common errors with friendly messages
        if (err.name === 'NotAllowedError') {
          setError("Camera permission denied. Please allow camera access and try again.");
        } else if (err.name === 'NotFoundError') {
          setError("No camera found. Please make sure your device has a camera.");
        } else if (err.name === 'OverconstrainedError') {
          setError("The requested camera constraints cannot be satisfied by the device.");
        } else if (err.name === 'NotSupportedError') {
          setError("Camera not supported on this device or browser.");
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError("Failed to access camera. Please try again.");
      }
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode]);

  // Cleanup camera stream
  const cleanupCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsVideoReady(false);
    setIsInitializing(false);
  }, [stream]);

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 with compression
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
  };

  // Confirm capture and upload
  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      cleanupCamera();
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // Flip camera between front and back
  const flipCamera = async () => {
    // First cleanup current stream
    cleanupCamera();
    
    // Toggle facing mode
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    // Camera will reinitialize automatically due to useEffect dependency
  };

  // Cancel and cleanup
  const handleCancel = () => {
    cleanupCamera();
    onCancel();
  };

  // Initialize camera on mount and when facing mode changes
  useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]); // Reinitialize when facing mode changes

  // Show error state
  if (error) {
    return (
      <div className="text-center py-8">
        <Camera className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Error</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={initializeCamera} variant="outline">
            Try Again
          </Button>
          <Button onClick={handleCancel} variant="ghost">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Camera View */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        {!capturedImage ? (
          <>
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-600 mb-2" />
                  <p className="text-sm text-gray-600">Initializing camera...</p>
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              preload="metadata"
              className="w-full h-auto max-h-96 object-cover transition-opacity duration-300"
              style={{ opacity: isVideoReady ? 1 : 0 }}
              onLoadedMetadata={() => {
                setIsInitializing(false);
                setIsVideoReady(true);
              }}
              onCanPlay={() => {
                setIsInitializing(false);
                setIsVideoReady(true);
              }}
              onError={() => {
                setError("Video playback error occurred");
                setIsInitializing(false);
              }}
            />
          </>
        ) : (
          <img
            src={capturedImage}
            alt="Captured progress photo"
            className="w-full h-auto max-h-96 object-cover"
          />
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Controls */}
      <div className="flex justify-center gap-4">
        {!capturedImage ? (
          <>
            <Button
              onClick={flipCamera}
              disabled={isInitializing}
              variant="outline"
              className="px-4"
              title={`Switch to ${facingMode === 'user' ? 'back' : 'front'} camera`}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={capturePhoto}
              disabled={isInitializing || !stream || !isVideoReady}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8"
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture
            </Button>
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={confirmCapture}
              disabled={isUploading}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Photo
                </>
              )}
            </Button>
            <Button onClick={retakePhoto} variant="outline" disabled={isUploading}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake
            </Button>
            <Button onClick={handleCancel} variant="ghost" disabled={isUploading}>
              Cancel
            </Button>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600">
        {!capturedImage ? (
          <p>
            Position yourself in the frame and click capture to take your progress photo.
            <br />
            <span className="text-xs text-gray-500">
              Using {facingMode === 'user' ? 'front' : 'back'} camera • Tap the flip button to switch
            </span>
          </p>
        ) : (
          <p>Review your photo and click save to add it to your progress gallery.</p>
        )}
      </div>
    </div>
  );
}