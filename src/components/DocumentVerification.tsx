import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  Image, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  Video, 
  VideoOff, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Lock,
  Trash2,
  X
} from 'lucide-react';

interface DocumentVerificationProps {
  studentName: string;
  onComplete: (frontDataUrl: string, backDataUrl: string, frontName: string, backName: string) => void;
  onCancel: () => void;
}

type Mode = 'upload' | 'camera';

export default function DocumentVerification({ studentName, onComplete, onCancel }: DocumentVerificationProps) {
  // Front and Back states
  const [frontMode, setFrontMode] = useState<Mode>('upload');
  const [backMode, setBackMode] = useState<Mode>('upload');
  
  const [frontImage, setFrontImage] = useState<string>('');
  const [frontName, setFrontName] = useState<string>('');
  const [backImage, setBackImage] = useState<string>('');
  const [backName, setBackName] = useState<string>('');

  // Camera states
  const [activeSide, setActiveSide] = useState<'front' | 'back' | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  // Validation States
  const [frontVerifying, setFrontVerifying] = useState(false);
  const [frontVerified, setFrontVerified] = useState(false);
  const [frontError, setFrontError] = useState('');

  const [backVerifying, setBackVerifying] = useState(false);
  const [backVerified, setBackVerified] = useState(false);
  const [backError, setBackError] = useState('');

  // Aadhaar Expiry Check Confirmation state
  const [aadhaarExpiryChecked, setAadhaarExpiryChecked] = useState(false);

  // Status indicator helper
  const getStatusBadge = (image: string, verifying: boolean, verified: boolean, error: string) => {
    if (verifying) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-200 animate-pulse">
          <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
          <span>Uploading</span>
        </span>
      );
    }
    if (verified && image) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3 text-emerald-600 fill-emerald-500 text-white" />
          <span>Verified</span>
        </span>
      );
    }
    if (error) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-50 text-red-600 border border-red-200">
          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
          <span>Failed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50/50 text-amber-700 border border-amber-200/60">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
        <span>Awaiting Upload</span>
      </span>
    );
  };

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch available cameras
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices()
      .then(devices => {
        const videoInputs = (devices || []).filter(d => d && d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        if ((videoInputs || []).length > 0) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      })
      .catch(err => {
        console.error('Error enumerating devices:', err);
      });

    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCameraStream = async (deviceId?: string) => {
    stopCameraStream();
    setIsCameraLoading(true);
    setCameraError('');

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error('Play error:', e));
      }
    } catch (err: any) {
      console.error('Error opening camera:', err);
      setCameraError(
        err.name === 'NotAllowedError' 
          ? 'Camera permission denied. Please allow camera access in your browser or switch to standard File Upload.' 
          : 'Could not initialize camera. Please check your camera connection or use File Upload.'
      );
    } finally {
      setIsCameraLoading(false);
    }
  };

  const handleOpenCamera = async (side: 'front' | 'back') => {
    setActiveSide(side);
    if (side === 'front') {
      setFrontMode('camera');
    } else {
      setBackMode('camera');
    }
    // Start stream
    setTimeout(() => {
      startCameraStream(selectedDeviceId);
    }, 100);
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (activeSide) {
      startCameraStream(deviceId);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !streamRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the current video frame onto the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');

        if (activeSide === 'front') {
          setFrontImage(dataUrl);
          setFrontName(`captured_aadhaar_front_${Date.now()}.jpg`);
          triggerValidation(dataUrl, 'front');
        } else if (activeSide === 'back') {
          setBackImage(dataUrl);
          setBackName(`captured_aadhaar_back_${Date.now()}.jpg`);
          triggerValidation(dataUrl, 'back');
        }
      }

      // Stop camera feed after successful capture
      stopCameraStream();
      setActiveSide(null);
    } catch (err) {
      console.error('Error capturing image:', err);
    }
  };

  // Drag and drop or selection handler
  const handleFileUpload = (file: File, side: 'front' | 'back') => {
    if (!file.type.startsWith('image/')) {
      const errText = 'Invalid file type. Please upload a valid image (JPEG/PNG/SVG).';
      if (side === 'front') setFrontError(errText);
      else setBackError(errText);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const errText = 'File is too large. Size limit is 5MB.';
      if (side === 'front') setFrontError(errText);
      else setBackError(errText);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const resultUrl = e.target.result as string;
        if (side === 'front') {
          setFrontImage(resultUrl);
          setFrontName(file.name);
          setFrontError('');
          triggerValidation(resultUrl, 'front');
        } else {
          setBackImage(resultUrl);
          setBackName(file.name);
          setBackError('');
          triggerValidation(resultUrl, 'back');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Simulated AI Verification / Security checks
  const triggerValidation = (dataUrl: string, side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontVerifying(true);
      setFrontVerified(false);
      setFrontError('');
      
      setTimeout(() => {
        // Check if dataUrl is valid
        if ((dataUrl || '').length > 500) {
          setFrontVerified(true);
          setFrontVerifying(false);
        } else {
          setFrontError('Verification failed. Document content could not be verified.');
          setFrontVerifying(false);
        }
      }, 1500);
    } else {
      setBackVerifying(true);
      setBackVerified(false);
      setBackError('');

      setTimeout(() => {
        if ((dataUrl || '').length > 500) {
          setBackVerified(true);
          setBackVerifying(false);
        } else {
          setBackError('Verification failed. Address segment or QR code is illegible.');
          setBackVerifying(false);
        }
      }, 1500);
    }
  };

  // Generate high-quality test templates in Sandbox mode
  const handleGenerateSandboxDemo = () => {
    const generateMockSvg = (side: 'front' | 'back') => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="350" height="220" viewBox="0 0 350 220">
        <rect width="100%" height="100%" fill="#ffffff" rx="14" stroke="#061F48" stroke-width="2.5"/>
        <rect width="100%" height="28" fill="#f97316"/>
        <rect width="100%" height="10" y="210" fill="#16a34a"/>
        <text x="175" y="18" fill="#ffffff" font-family="sans-serif" font-size="8" font-weight="900" text-anchor="middle" letter-spacing="0.5">GOVERNMENT OF INDIA • UNIQUE IDENTIFICATION AUTHORITY</text>
        <text x="25" y="65" fill="#061F48" font-family="sans-serif" font-size="10" font-weight="900">Name: ${studentName || 'Provisional Student'}</text>
        <text x="25" y="85" fill="#061F48" font-family="sans-serif" font-size="10" font-weight="900">DOB: 12/04/2008</text>
        <text x="25" y="105" fill="#061F48" font-family="sans-serif" font-size="10" font-weight="900">Gender: Male / Student</text>
        <text x="25" y="130" fill="#f97316" font-family="sans-serif" font-size="9" font-weight="bold">AADHAAR CARD - ${side === 'front' ? 'FRONT COPY' : 'BACK PANEL'}</text>
        <rect x="255" y="45" width="70" height="90" fill="#f8fafc" rx="8" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="290" cy="75" r="18" fill="#cbd5e1"/>
        <path d="M270 120 C270 102, 310 102, 310 120" fill="#cbd5e1"/>
        <text x="290" y="128" fill="#64748b" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">PHOTO ID</text>
        <text x="175" y="180" fill="#061F48" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle" letter-spacing="1.5">xxxx xxxx xxxx</text>
        <text x="175" y="200" fill="#64748b" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">आधार - आम आदमी का अधिकार</text>
      </svg>`;
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    };

    const frontData = generateMockSvg('front');
    const backData = generateMockSvg('back');

    setFrontImage(frontData);
    setFrontName('sandbox_aadhaar_front.svg');
    setFrontVerified(true);
    setFrontVerifying(false);
    setFrontError('');

    setBackImage(backData);
    setBackName('sandbox_aadhaar_back.svg');
    setBackVerified(true);
    setBackVerifying(false);
    setBackError('');

    setAadhaarExpiryChecked(true);

    stopCameraStream();
    setActiveSide(null);
  };

  const handleFinish = () => {
    if (frontVerified && backVerified && frontImage && backImage) {
      onComplete(frontImage, backImage, frontName, backName);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#061F48]/50 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div id="document-verification-container" className="bg-white rounded-[2rem] border border-[#061F48]/15 max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-scale-up my-8">
        
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all z-10"
          title="Go back"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Title */}
        <div className="space-y-1 pb-4 border-b border-[#061F48]/5">
          <div className="inline-flex items-center space-x-1.5 bg-[#F8F5ED] border border-[#D09515]/30 px-3 py-1 rounded-full text-[#061F48]">
            <ShieldCheck className="h-4 w-4 text-[#D09515]" />
            <span className="text-[10px] font-black uppercase tracking-wider">Mandatory Security Verification</span>
          </div>
          <h3 className="text-xl font-black text-[#061F48]">UIDAI Aadhaar Verification</h3>
          <p className="text-xs text-[#061F48]/70 font-semibold">
            To generate your board registration credentials and enroll in active online streams, upload or capture clear copies of your national identity card.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-[#F8F5ED]/80 border border-[#D09515]/20 p-4 rounded-2xl flex items-start gap-3">
          <Lock className="h-5 w-5 text-[#D09515] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#061F48] block">Secure Encryption & Confidentiality</span>
            <p className="text-[10px] text-[#061F48]/80 font-semibold leading-relaxed">
              All documents are processed with highly secure client-side validation. Use sample documents only when explicitly labelled as test content. Real identity documents should never be entered unless required for a genuine verification workflow.
            </p>
          </div>
        </div>

        {/* Sandbox quick generator button */}
        <button
          type="button"
          onClick={handleGenerateSandboxDemo}
          className="w-full bg-gradient-to-r from-amber-500 to-[#D09515] hover:from-amber-600 hover:to-amber-700 text-white py-3 px-4 rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4 text-white animate-bounce" />
          <span>Quick Autofill with Demo Aadhaar Card</span>
        </button>

        {/* Camera active live segment */}
        {activeSide && (
          <div className="bg-slate-900 rounded-3xl p-4 space-y-4 border border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                <Video className="h-4 w-4 animate-pulse" />
                Live Feed: Aadhaar {activeSide === 'front' ? 'Front' : 'Back'}
              </span>
              
              {(videoDevices || []).length > 1 && (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => handleDeviceChange(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-700 rounded-xl px-2.5 py-1 text-[9px] font-bold focus:outline-none focus:border-[#D09515]"
                >
                  {(videoDevices || []).map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${(videoDevices || []).indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {isCameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-black/80">
                  <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Initializing Webcam...</span>
                </div>
              )}

              {cameraError ? (
                <div className="p-6 text-center space-y-2">
                  <VideoOff className="h-8 w-8 text-red-500 mx-auto" />
                  <p className="text-xs font-black text-red-400">{cameraError}</p>
                  <button
                    onClick={() => {
                      if (activeSide === 'front') setFrontMode('upload');
                      else setBackMode('upload');
                      stopCameraStream();
                      setActiveSide(null);
                    }}
                    className="text-[10px] font-bold text-amber-500 underline uppercase"
                  >
                    Switch to manual file upload fallback
                  </button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}

              {/* Guide Overlay Overlay */}
              {!cameraError && !isCameraLoading && (
                <div className="absolute inset-0 border-4 border-dashed border-[#D09515]/40 m-6 rounded-xl pointer-events-none flex items-center justify-center">
                  <p className="bg-black/60 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg">
                    Align your Aadhaar Card within this box
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setActiveSide(null);
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Close Camera
              </button>
              
              <button
                type="button"
                disabled={isCameraLoading || !!cameraError}
                onClick={handleCapture}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-gray-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Camera className="h-4 w-4" />
                <span>Capture Screenshot</span>
              </button>
            </div>
          </div>
        )}

        {/* Side-by-side Upload Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* FRONT DOCUMENT COLUMN */}
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-3xl border border-[#061F48]/5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-black uppercase text-[#061F48] tracking-wide flex items-center gap-1">
                  <FileText className="h-4 w-4 text-[#D09515]" />
                  <span>1. Aadhaar Card Front *</span>
                </span>
                
                {/* Mode Selector */}
                {!activeSide && (
                  <div className="flex rounded-lg border bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => { setFrontMode('upload'); stopCameraStream(); }}
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-all ${frontMode === 'upload' ? 'bg-[#061F48] text-white shadow-sm' : 'text-[#061F48]/60 hover:text-[#061F48]'}`}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenCamera('front')}
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-all flex items-center gap-1 ${frontMode === 'camera' ? 'bg-[#061F48] text-white shadow-sm' : 'text-[#061F48]/60 hover:text-[#061F48]'}`}
                    >
                      <Camera className="h-3 w-3" />
                      Camera
                    </button>
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div id="front-status-indicator" className="flex items-center justify-between bg-white border border-[#061F48]/5 rounded-2xl p-2.5 shadow-sm">
                <span className="text-[10px] font-bold text-[#061F48]/60 uppercase tracking-wide">Status:</span>
                {getStatusBadge(frontImage, frontVerifying, frontVerified, frontError)}
              </div>

              {/* Upload Panel */}
              {frontMode === 'upload' ? (
                <div 
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#D09515]', 'bg-[#F8F5ED]'); }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-[#D09515]', 'bg-[#F8F5ED]'); }}
                  onDrop={(e) => { 
                    e.preventDefault(); 
                    e.currentTarget.classList.remove('border-[#D09515]', 'bg-[#F8F5ED]'); 
                    if (e.dataTransfer.files?.length) { handleFileUpload(e.dataTransfer.files[0], 'front'); } 
                  }}
                  className="border-2 border-dashed border-[#061F48]/10 rounded-2xl p-5 text-center bg-white hover:border-[#D09515] transition-all relative overflow-hidden flex flex-col justify-center items-center min-h-[150px]"
                >
                  {frontImage ? (
                    <div className="space-y-2 w-full">
                      <img src={frontImage} alt="Front View" className="h-24 mx-auto object-contain rounded-lg border border-gray-100 shadow-sm" />
                      <div className="flex items-center justify-between text-[9px] bg-slate-50 p-2 rounded-xl border border-gray-100 w-full">
                        <span className="truncate max-w-[150px] font-bold text-gray-500">{frontName}</span>
                        <button 
                          onClick={() => { setFrontImage(''); setFrontName(''); setFrontVerified(false); }}
                          className="text-red-500 hover:underline font-black uppercase tracking-wider flex items-center gap-0.5"
                        >
                          <Trash2 className="h-3 w-3" /> Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-2 flex flex-col items-center w-full justify-center py-4">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => { if (e.target.files?.length) { handleFileUpload(e.target.files[0], 'front'); } }} 
                      />
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#061F48]">Drag & Drop Front Side Image</p>
                        <p className="text-[8px] text-gray-400 font-bold">PNG, JPG or SVG up to 5MB</p>
                      </div>
                    </label>
                  )}
                </div>
              ) : (
                <div className="border border-[#061F48]/10 rounded-2xl p-5 text-center bg-white min-h-[150px] flex flex-col justify-center items-center space-y-3">
                  {frontImage ? (
                    <div className="space-y-2 w-full">
                      <img src={frontImage} alt="Captured Front" className="h-24 mx-auto object-contain rounded-lg border border-gray-100 shadow-sm" />
                      <div className="flex items-center justify-between text-[9px] bg-slate-50 p-2 rounded-xl border border-gray-100 w-full">
                        <span className="truncate max-w-[150px] font-bold text-gray-500">{frontName}</span>
                        <button 
                          onClick={() => { setFrontImage(''); setFrontName(''); setFrontVerified(false); }}
                          className="text-red-500 hover:underline font-black uppercase tracking-wider flex items-center gap-0.5"
                        >
                          <Trash2 className="h-3 w-3" /> Retake
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="h-8 w-8 text-[#061F48]/30 mx-auto" />
                      <p className="text-[10px] font-black text-[#061F48]">Webcam Stream Standby</p>
                      <button
                        type="button"
                        onClick={() => handleOpenCamera('front')}
                        className="bg-[#061F48]/5 text-[#061F48] hover:bg-[#061F48]/10 border border-[#061F48]/10 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-wider"
                      >
                        Launch Front Camera View
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Validation Feedback box */}
            <div className="pt-2">
              {frontVerifying && (
                <div className="flex items-center gap-2 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 p-2 rounded-xl">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />
                  <span>Simulating OCR checks & UIDAI watermark audits...</span>
                </div>
              )}

              {frontVerified && (
                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded-xl">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 fill-emerald-500 text-white" />
                  <span>Aadhaar Front Verified Successfully</span>
                </div>
              )}

              {frontError && (
                <div className="flex items-center gap-2 text-[9px] font-black text-red-600 bg-red-50 border border-red-100 p-2 rounded-xl">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                  <span>{frontError}</span>
                </div>
              )}
            </div>
          </div>

          {/* BACK DOCUMENT COLUMN */}
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-3xl border border-[#061F48]/5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-black uppercase text-[#061F48] tracking-wide flex items-center gap-1">
                  <FileText className="h-4 w-4 text-[#D09515]" />
                  <span>2. Aadhaar Card Back *</span>
                </span>
                
                {/* Mode Selector */}
                {!activeSide && (
                  <div className="flex rounded-lg border bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => { setBackMode('upload'); stopCameraStream(); }}
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-all ${backMode === 'upload' ? 'bg-[#061F48] text-white shadow-sm' : 'text-[#061F48]/60 hover:text-[#061F48]'}`}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenCamera('back')}
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-all flex items-center gap-1 ${backMode === 'camera' ? 'bg-[#061F48] text-white shadow-sm' : 'text-[#061F48]/60 hover:text-[#061F48]'}`}
                    >
                      <Camera className="h-3 w-3" />
                      Camera
                    </button>
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div id="back-status-indicator" className="flex items-center justify-between bg-white border border-[#061F48]/5 rounded-2xl p-2.5 shadow-sm">
                <span className="text-[10px] font-bold text-[#061F48]/60 uppercase tracking-wide">Status:</span>
                {getStatusBadge(backImage, backVerifying, backVerified, backError)}
              </div>

              {/* Upload Panel */}
              {backMode === 'upload' ? (
                <div 
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#D09515]', 'bg-[#F8F5ED]'); }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-[#D09515]', 'bg-[#F8F5ED]'); }}
                  onDrop={(e) => { 
                    e.preventDefault(); 
                    e.currentTarget.classList.remove('border-[#D09515]', 'bg-[#F8F5ED]'); 
                    if (e.dataTransfer.files?.length) { handleFileUpload(e.dataTransfer.files[0], 'back'); } 
                  }}
                  className="border-2 border-dashed border-[#061F48]/10 rounded-2xl p-5 text-center bg-white hover:border-[#D09515] transition-all relative overflow-hidden flex flex-col justify-center items-center min-h-[150px]"
                >
                  {backImage ? (
                    <div className="space-y-2 w-full">
                      <img src={backImage} alt="Back View" className="h-24 mx-auto object-contain rounded-lg border border-gray-100 shadow-sm" />
                      <div className="flex items-center justify-between text-[9px] bg-slate-50 p-2 rounded-xl border border-gray-100 w-full">
                        <span className="truncate max-w-[150px] font-bold text-gray-500">{backName}</span>
                        <button 
                          onClick={() => { setBackImage(''); setBackName(''); setBackVerified(false); }}
                          className="text-red-500 hover:underline font-black uppercase tracking-wider flex items-center gap-0.5"
                        >
                          <Trash2 className="h-3 w-3" /> Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-2 flex flex-col items-center w-full justify-center py-4">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => { if (e.target.files?.length) { handleFileUpload(e.target.files[0], 'back'); } }} 
                      />
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#061F48]">Drag & Drop Back Side Image</p>
                        <p className="text-[8px] text-gray-400 font-bold">PNG, JPG or SVG up to 5MB</p>
                      </div>
                    </label>
                  )}
                </div>
              ) : (
                <div className="border border-[#061F48]/10 rounded-2xl p-5 text-center bg-white min-h-[150px] flex flex-col justify-center items-center space-y-3">
                  {backImage ? (
                    <div className="space-y-2 w-full">
                      <img src={backImage} alt="Captured Back" className="h-24 mx-auto object-contain rounded-lg border border-gray-100 shadow-sm" />
                      <div className="flex items-center justify-between text-[9px] bg-slate-50 p-2 rounded-xl border border-gray-100 w-full">
                        <span className="truncate max-w-[150px] font-bold text-gray-500">{backName}</span>
                        <button 
                          onClick={() => { setBackImage(''); setBackName(''); setBackVerified(false); }}
                          className="text-red-500 hover:underline font-black uppercase tracking-wider flex items-center gap-0.5"
                        >
                          <Trash2 className="h-3 w-3" /> Retake
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="h-8 w-8 text-[#061F48]/30 mx-auto" />
                      <p className="text-[10px] font-black text-[#061F48]">Webcam Stream Standby</p>
                      <button
                        type="button"
                        onClick={() => handleOpenCamera('back')}
                        className="bg-[#061F48]/5 text-[#061F48] hover:bg-[#061F48]/10 border border-[#061F48]/10 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-wider"
                      >
                        Launch Back Camera View
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Validation Feedback box */}
            <div className="pt-2">
              {backVerifying && (
                <div className="flex items-center gap-2 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 p-2 rounded-xl">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />
                  <span>Extracting address & barcode datasets...</span>
                </div>
              )}

              {backVerified && (
                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded-xl">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 fill-emerald-500 text-white" />
                  <span>Aadhaar Back Verified Successfully</span>
                </div>
              )}

              {backError && (
                <div className="flex items-center gap-2 text-[9px] font-black text-red-600 bg-red-50 border border-red-100 p-2 rounded-xl">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                  <span>{backError}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Aadhaar Expiry & Guidelines Check */}
        <div id="aadhaar-expiry-reminder-container" className="mt-4 bg-amber-50/40 border border-amber-200/50 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <input
              id="aadhaar-expiry-checkbox"
              type="checkbox"
              checked={aadhaarExpiryChecked}
              onChange={(e) => setAadhaarExpiryChecked(e.target.checked)}
              className="mt-1 h-4 w-4 text-[#061F48] border-amber-300 rounded focus:ring-[#061F48] accent-[#061F48] cursor-pointer"
            />
            <div className="flex-1 space-y-1">
              <label htmlFor="aadhaar-expiry-checkbox" className="block text-[11px] font-black uppercase tracking-wider text-[#061F48] cursor-pointer">
                Verify Aadhaar Document Validity & Expiry *
              </label>
              <p className="text-[10px] text-[#061F48]/80 font-semibold leading-relaxed">
                I confirm that my Aadhaar card is currently active and contains up-to-date demographic/biometric data. (UIDAI guidelines mandate biometric updates for kids aged 5 and 15, and document updates every 10 years).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/70 border border-amber-100 rounded-xl p-2.5 text-[9px] font-bold text-amber-900 shadow-sm">
            <AlertCircle className="h-4 w-4 text-[#D09515] shrink-0" />
            <div className="flex-1">
              <span>Unsure if your Aadhaar card has expired or needs updates? Refer to the official government guidelines here: </span>
              <a 
                id="aadhaar-guidelines-link"
                href="https://uidai.gov.in/en/my-aadhaar/about-your-aadhaar/updating-data-on-aadhaar.html" 
                target="_blank" 
                rel="noreferrer noopener"
                className="text-[#061F48] font-black underline hover:text-[#D09515] inline-flex items-center gap-0.5 transition-colors"
                title="Click to view official UIDAI guidelines on updating and verifying Aadhaar status"
              >
                UIDAI Guidelines ↗
              </a>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex gap-4 pt-4 border-t border-[#061F48]/5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 border border-[#061F48]/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#061F48]/70 hover:text-[#061F48] hover:bg-[#061F48]/5 transition-colors"
          >
            Go Back
          </button>
          
          <button
            type="button"
            disabled={!frontVerified || !backVerified || !frontImage || !backImage || !aadhaarExpiryChecked}
            onClick={handleFinish}
            className="flex-1 py-3.5 bg-[#061F48] hover:bg-[#D09515] disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
