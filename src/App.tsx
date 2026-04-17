/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  RefreshCw, 
  Package, 
  Store, 
  MessageSquare, 
  Menu, 
  Bell, 
  Search,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowRightLeft,
  PlusCircle,
  MapPin,
  Send,
  Camera,
  Zap,
  Fingerprint,
  Usb,
  X,
  ShoppingCart,
  Trash2,
  User,
  ShieldCheck,
  History,
  Upload,
  Image as ImageIcon,
  FileText,
  CreditCard as PaymentIcon,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { getGeminiResponse } from './services/gemini';
import Markdown from 'react-markdown';

// --- Constants ---
const SERVICE_PRICES: Record<string, Record<string, number>> = {
  'SIM Registration': {
    'Vodacom': 1000,
    'Airtel': 500,
    'Tigo': 500,
    'Halotel': 500,
    'TTCL': 500,
    'Yas': 500
  },
  'SIM Swap': {
    'Vodacom': 2000,
    'Airtel': 2000,
    'Tigo': 2000,
    'Halotel': 2000,
    'TTCL': 2000,
    'Yas': 2000
  }
};

// --- Types ---
type View = 'dashboard' | 'sim-reg' | 'sim-swap' | 'bundles' | 'merchant' | 'assistant' | 'self-care' | 'partner-apps';

interface CartItem {
  id: number;
  name: string;
  price: number;
  network: string;
  category: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
  details: string;
}

// --- Components ---

const DocumentCapture = ({ label, onCapture }: { label: string, onCapture: (file: string) => void }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setIsCapturing(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPreview(dataUrl);
        onCapture(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        onCapture(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-slate-700">{label}</p>
      
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-50">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button 
            onClick={() => { setPreview(null); onCapture(''); }}
            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-full text-slate-900 hover:bg-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : isCapturing ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-black">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button 
              onClick={captureImage}
              className="p-4 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all"
            >
              <Camera className="w-6 h-6" />
            </button>
            <button 
              onClick={stopCamera}
              className="p-4 bg-white/20 backdrop-blur text-white rounded-full hover:bg-white/30 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={startCamera}
            className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
          >
            <div className="p-3 bg-white rounded-xl text-slate-400 group-hover:text-emerald-600 shadow-sm">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-900">Capture Image</span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
          >
            <div className="p-3 bg-white rounded-xl text-slate-400 group-hover:text-emerald-600 shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-900">Upload Doc</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,.pdf" 
              onChange={handleFileUpload} 
            />
          </button>
        </div>
      )}
    </div>
  );
};

const CameraScanner = ({ onScan, onClose }: { onScan: (val: string) => void, onClose: () => void }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
        
        const track = s.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;
        if (capabilities.torch) {
          setHasTorch(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }
    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !isTorchOn }]
      } as any);
      setIsTorchOn(!isTorchOn);
    } catch (err) {
      console.error("Torch error:", err);
    }
  };

  const capture = () => {
    // Simulate OCR scan
    const mockICCID = "89254" + Math.random().toString().slice(2, 12);
    onScan(mockICCID);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="p-4 flex justify-between items-center text-white">
        <h3 className="font-bold">Scan SIM Serial (ICCID)</h3>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 relative overflow-hidden bg-slate-900">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-32 border-2 border-emerald-500 rounded-lg relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-500 -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-500 translate-x-1 -translate-y-1"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-500 -translate-x-1 translate-y-1"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-500 translate-x-1 translate-y-1"></div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-black flex justify-center items-center gap-8">
        {hasTorch && (
          <button 
            onClick={toggleTorch}
            className={cn(
              "p-4 rounded-full transition-all",
              isTorchOn ? "bg-yellow-400 text-black" : "bg-white/10 text-white"
            )}
          >
            <Zap className="w-6 h-6" />
          </button>
        )}
        <button 
          onClick={capture}
          className="w-20 h-20 bg-white rounded-full border-4 border-slate-400 flex items-center justify-center active:scale-95 transition-transform"
        >
          <div className="w-16 h-16 bg-white rounded-full border-2 border-slate-900"></div>
        </button>
        <div className="w-14"></div> {/* Spacer for symmetry */}
      </div>
    </div>
  );
};

const HardwareStatus = () => {
  const [otgConnected, setOtgConnected] = useState(false);
  const [fingerprintReady, setFingerprintReady] = useState(false);

  return (
    <div className="flex gap-4 mb-6">
      <button 
        onClick={() => setOtgConnected(!otgConnected)}
        className={cn(
          "flex-1 p-3 rounded-xl border flex items-center gap-3 transition-all",
          otgConnected ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-400"
        )}
      >
        <Usb className="w-5 h-5" />
        <span className="text-xs font-bold uppercase">{otgConnected ? "OTG Connected" : "Connect OTG"}</span>
      </button>
      <button 
        onClick={() => setFingerprintReady(!fingerprintReady)}
        className={cn(
          "flex-1 p-3 rounded-xl border flex items-center gap-3 transition-all",
          fingerprintReady ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-400"
        )}
      >
        <Fingerprint className="w-5 h-5" />
        <span className="text-xs font-bold uppercase">{fingerprintReady ? "Scanner Ready" : "Check Scanner"}</span>
      </button>
    </div>
  );
};

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon: Icon, trend }: { label: string, value: string, icon: any, trend?: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 card-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className={cn(
          "text-xs font-bold px-2 py-1 rounded-full",
          trend.startsWith('+') ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        )}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
  </div>
);

// --- Views ---

const DashboardView = ({ 
  scannedSerials, 
  onScanClick, 
  onActionClick 
}: { 
  scannedSerials: string[], 
  onScanClick: () => void,
  onActionClick: (view: View) => void
}) => {
  const transactions: Transaction[] = [
    { id: '1', type: 'SIM Registration', amount: 'TZS 1000', status: 'success', date: '2 mins ago', details: '0712345678' },
    { id: '2', type: 'Bundle Sale', amount: 'TZS 5000', status: 'success', date: '15 mins ago', details: '2GB Monthly' },
    { id: '3', type: 'Till Creation', amount: 'TZS 0', status: 'pending', date: '1 hour ago', details: 'Sam\'s Shop' },
    { id: '4', type: 'SIM Swap', amount: 'TZS 500', status: 'failed', date: '2 hours ago', details: 'Invalid ID' },
  ];

  return (
    <div className="space-y-8">
      {/* SME Upgrade Bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-100">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <Zap className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base">Upgrade to SME Agent Account</h4>
            <p className="text-emerald-50 text-xs">Unlock higher commissions, bulk SIM registration, and priority support.</p>
          </div>
        </div>
        <button 
          onClick={() => alert("Upgrade request submitted! Our SME team will contact you within 24 hours to complete the verification.")}
          className="bg-white text-emerald-700 px-6 py-2 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all whitespace-nowrap"
        >
          Upgrade Now
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Total Sales" value="TZS 124,500" icon={CreditCard} trend="+12%" />
        <StatCard label="SIMs Registered" value="48" icon={UserPlus} trend="+5" />
        <StatCard label="Bundles Sold" value="156" icon={Package} trend="+24%" />
        <StatCard label="Active Tills" value="12" icon={Store} />
        <button 
          onClick={() => onActionClick('self-care')}
          className="bg-white p-6 rounded-2xl border border-slate-100 card-shadow text-left hover:border-emerald-500 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Self-Care Portal</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">Manage Account</h3>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Scan Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 card-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Quick SIM Capture</h3>
              <div className="flex gap-2">
                <Usb className="w-4 h-4 text-slate-400" />
                <Fingerprint className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={onScanClick}
                className="flex-1 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-emerald-100 transition-all group"
              >
                <div className="p-4 bg-white rounded-full text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-emerald-900">Scan SIM Serial</p>
                  <p className="text-xs text-emerald-600 mt-1">Uses device camera & torch</p>
                </div>
              </button>
              <div className="flex-1 flex flex-col gap-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Scans</p>
                {scannedSerials.length > 0 ? (
                  <div className="space-y-2">
                    {scannedSerials.map((serial, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-mono text-sm font-bold text-slate-700">{serial}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => onActionClick('sim-reg')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                            title="Register"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onActionClick('sim-swap')}
                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg"
                            title="Swap"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl p-4">
                    <p className="text-sm text-slate-400 italic">No recent scans</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Banner */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-emerald-600 rounded-xl">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Need Direct Support?</h4>
                <p className="text-slate-400 text-sm">Call us directly for urgent assistance</p>
              </div>
            </div>
            <a 
              href="tel:+255780585781"
              className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all relative z-10"
            >
              +255 780 585 781
            </a>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg">Recent Transactions</h3>
              <button className="text-emerald-600 text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Service</th>
                    <th className="px-6 py-4 font-semibold">Details</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{tx.type}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{tx.details}</td>
                      <td className="px-6 py-4 font-mono font-medium">{tx.amount}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                          tx.status === 'success' ? "bg-emerald-100 text-emerald-700" :
                          tx.status === 'pending' ? "bg-amber-100 text-amber-700" :
                          "bg-rose-100 text-rose-700"
                        )}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-emerald-900 text-white rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden h-fit">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Agent Commission</h3>
            <p className="text-emerald-200 text-sm mb-6">You've earned TZS 12,400 this week. Keep going!</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-emerald-800 pb-2">
                <span className="text-emerald-300 text-sm">SIM Reg</span>
                <span className="font-bold">TZS 4,800</span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-800 pb-2">
                <span className="text-emerald-300 text-sm">Bundles</span>
                <span className="font-bold">TZS 6,200</span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-800 pb-2">
                <span className="text-emerald-300 text-sm">Merchant</span>
                <span className="font-bold">TZS 1,400</span>
              </div>
            </div>
          </div>
          <button className="mt-8 bg-white text-emerald-900 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-colors relative z-10">
            Withdraw Earnings
          </button>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-800 rounded-full opacity-50 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

const SIMRegistrationView = () => {
  const [step, setStep] = useState(1);
  const [showScanner, setShowScanner] = useState(false);
  const [isFingerprinting, setIsFingerprinting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    network: '',
    firstName: '',
    lastName: '',
    idNumber: '',
    phoneNumber: '',
    simSerial: '',
    location: '',
    idDocument: ''
  });

  const [isLocating, setIsLocating] = useState(false);

  const handleFingerprint = () => {
    setIsFingerprinting(true);
    setTimeout(() => {
      setIsFingerprinting(false);
      alert("Fingerprint captured successfully!");
    }, 2000);
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          location: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
        }));
        setIsLocating(false);
      }, (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsLocating(false);
    }
  };

  const networks = [
    { id: 'yas', name: 'Yas', color: 'bg-yellow-400' },
    { id: 'airtel', name: 'Airtel', color: 'bg-red-600' },
    { id: 'halotel', name: 'Halotel', color: 'bg-orange-500' },
    { id: 'vodacom', name: 'Vodacom', color: 'bg-red-700' },
    { id: 'ttcl', name: 'TTCL', color: 'bg-blue-600' }
  ];

  const nextStep = () => {
    if (step === 3) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setStep(4);
      }, 2000);
    } else {
      setStep(s => s + 1);
    }
  };
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-2xl font-bold text-slate-900">SIM Registration</h2>
          <p className="text-slate-500 mt-1">Register a new subscriber to the network.</p>
          
          <div className="flex items-center gap-4 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                  step >= i ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
                )}>
                  {i}
                </div>
                {i < 4 && <div className={cn("w-12 h-0.5", step > i ? "bg-emerald-600" : "bg-slate-100")} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          <HardwareStatus />
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <label className="text-sm font-bold text-slate-700 block">Select Network</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {networks.map((net) => (
                    <button
                      key={net.id}
                      onClick={() => {
                        setFormData({...formData, network: net.name});
                        nextStep();
                      }}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center group",
                        formData.network === net.name 
                          ? "border-emerald-500 bg-emerald-50" 
                          : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-full mx-auto mb-2", net.color)}></div>
                      <span className="font-bold text-sm">{net.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">ID / Passport Number</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="12345678"
                    value={formData.idNumber}
                    onChange={e => setFormData({...formData, idNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Customer Location</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="City, Street or Coordinates"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                    <button 
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50"
                    >
                      <MapPin className={cn("w-5 h-5", isLocating && "animate-pulse")} />
                    </button>
                  </div>
                </div>
                <DocumentCapture 
                  label="Upload or Capture ID Document" 
                  onCapture={(file) => setFormData({...formData, idDocument: file})} 
                />
                <div className="flex gap-4">
                  <button 
                    onClick={prevStep}
                    className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={nextStep}
                    className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Phone Number ({formData.network})</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="07XX XXX XXX"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">SIM Serial Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="89254..."
                      value={formData.simSerial}
                      onChange={e => setFormData({...formData, simSerial: e.target.value})}
                    />
                    <button 
                      onClick={() => setShowScanner(true)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  <button 
                    onClick={handleFingerprint}
                    disabled={isFingerprinting}
                    className={cn(
                      "w-full py-4 rounded-xl border-2 flex items-center justify-center gap-3 font-bold transition-all",
                      isFingerprinting ? "bg-slate-50 border-slate-200 text-slate-400" : "bg-white border-emerald-100 text-emerald-700 hover:border-emerald-500"
                    )}
                  >
                    <Fingerprint className={cn("w-6 h-6", isFingerprinting && "animate-pulse")} />
                    {isFingerprinting ? "Scanning Fingerprint..." : "Scan Customer Fingerprint"}
                  </button>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={prevStep}
                    className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>Complete Registration</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Registration Successful!</h3>
                  <p className="text-slate-500 mt-2">Subscriber {formData.firstName} {formData.lastName} has been registered to {formData.phoneNumber} on <strong>{formData.network}</strong>.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Transaction ID</span>
                    <span className="font-mono font-bold">#REG-982341</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Service Fee</span>
                    <span className="font-bold">TZS {SERVICE_PRICES['SIM Registration'][formData.network] || 500}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Commission Earned</span>
                    <span className="text-emerald-600 font-bold">TZS 1000.00</span>
                  </div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm text-emerald-800 font-medium">Payment request sent to customer</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 uppercase">Automatic</span>
                </div>
                <button 
                  onClick={() => { setStep(1); setFormData({ network: '', firstName: '', lastName: '', idNumber: '', phoneNumber: '', simSerial: '', location: '', idDocument: '' }); }}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Register Another SIM
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {showScanner && (
        <CameraScanner 
          onScan={(val) => setFormData({...formData, simSerial: val})} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
};

const SIMSwapView = () => {
  const [selectedNetwork, setSelectedNetwork] = useState('Vodacom');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [simSerial, setSimSerial] = useState('');

  const networks = [
    { id: 'vodacom', name: 'Vodacom', color: 'bg-red-700' },
    { id: 'airtel', name: 'Airtel', color: 'bg-red-600' },
    { id: 'tigo', name: 'Tigo', color: 'bg-blue-600' },
    { id: 'halotel', name: 'Halotel', color: 'bg-orange-500' },
    { id: 'ttcl', name: 'TTCL', color: 'bg-blue-700' },
    { id: 'yas', name: 'Yas', color: 'bg-emerald-600' }
  ];

  const handleSwap = () => {
    if (!phoneNumber || !simSerial) {
      alert("Please enter phone number and SIM serial.");
      return;
    }
    setIsRequesting(true);
    // Simulate payment request
    setTimeout(() => {
      alert(`SIM Swap request successful! Payment request of TZS ${SERVICE_PRICES['SIM Swap'][selectedNetwork]} sent to ${phoneNumber}. New SIM will be active shortly.`);
      setIsRequesting(false);
      setPhoneNumber('');
      setSimSerial('');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-100 card-shadow p-8">
        <HardwareStatus />
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">SIM Swap</h2>
              <p className="text-slate-500">Replace a lost or damaged SIM card.</p>
            </div>
          </div>
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            {networks.map(net => (
              <button
                key={net.id}
                onClick={() => setSelectedNetwork(net.name)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                  selectedNetwork === net.name ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500"
                )}
              >
                {net.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Original Phone Number</label>
            <input 
              type="tel" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
              placeholder="07XX XXX XXX"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Reason for Swap</label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all appearance-none bg-white">
                <option>Lost SIM Card</option>
                <option>Damaged SIM Card</option>
                <option>Upgrade to 5G</option>
                <option>Stolen Phone</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Service Fee</label>
              <div className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 font-bold text-rose-600">
                TZS {SERVICE_PRICES['SIM Swap'][selectedNetwork]}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">New SIM Serial Number</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                placeholder="89254..."
                value={simSerial}
                onChange={e => setSimSerial(e.target.value)}
              />
              <button 
                onClick={() => setShowScanner(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-xs text-rose-800 leading-relaxed">
              <strong>Security Warning:</strong> Ensure you have verified the customer's original ID document before proceeding. SIM swap is a sensitive operation.
            </p>
          </div>

          <button 
            onClick={handleSwap}
            disabled={isRequesting}
            className="w-full bg-rose-600 text-white font-bold py-4 rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-100 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRequesting ? "Sending Request..." : "Initiate SIM Swap & Request Payment"}
            {!isRequesting && <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {showScanner && (
        <CameraScanner 
          onScan={(val) => setSimSerial(val)} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
};

const BundlesView = ({ onAddToCart }: { onAddToCart: (item: CartItem) => void }) => {
  const categories = ['Data', 'Voice', 'SMS', 'Integrated', 'SME', 'M2M'];
  const [activeCat, setActiveCat] = useState('Data');
  const [selectedNetwork, setSelectedNetwork] = useState('Vodacom');
  const [sellingBundle, setSellingBundle] = useState<number | null>(null);

  const networks = [
    { id: 'vodacom', name: 'Vodacom', color: 'bg-red-600' },
    { id: 'airtel', name: 'Airtel', color: 'bg-red-500' },
    { id: 'tigo', name: 'Tigo', color: 'bg-blue-600' },
    { id: 'halotel', name: 'Halotel', color: 'bg-orange-500' },
    { id: 'ttcl', name: 'TTCL', color: 'bg-blue-700' },
    { id: 'yas', name: 'Yas', color: 'bg-emerald-600' }
  ];

  const bundles = [
    { id: 1, name: 'Daily 500MB', price: 500, validity: '24 Hours', cat: 'Data' },
    { id: 2, name: 'Daily 1GB', price: 1000, validity: '24 Hours', cat: 'Data' },
    { id: 3, name: 'Weekly 5GB', price: 5000, validity: '7 Days', cat: 'Data' },
    { id: 4, name: 'Monthly 15GB', price: 15000, validity: '30 Days', cat: 'Data' },
    { id: 5, name: 'Daily 50 Mins', price: 500, validity: '24 Hours', cat: 'Voice' },
    { id: 6, name: 'Weekly 300 Mins', price: 3000, validity: '7 Days', cat: 'Voice' },
    { id: 7, name: 'Daily 100 SMS', price: 200, validity: '24 Hours', cat: 'SMS' },
    { id: 8, name: 'Uni Bundle (Data+Voice)', price: 1000, validity: '24 Hours', cat: 'Integrated' },
    { id: 9, name: 'SME 10GB Monthly', price: 12000, validity: '30 Days', cat: 'SME' },
    { id: 10, name: 'SME 50GB Monthly', price: 45000, validity: '30 Days', cat: 'SME' },
    { id: 11, name: 'M2M Basic (100MB)', price: 2000, validity: '30 Days', cat: 'M2M' },
    { id: 12, name: 'M2M Pro (1GB)', price: 8000, validity: '30 Days', cat: 'M2M' },
  ];

  const handleSellNow = (bundle: any) => {
    setSellingBundle(bundle.id);
    setTimeout(() => {
      setSellingBundle(null);
      alert(`Successfully sold ${bundle.name} for ${selectedNetwork}! TZS ${bundle.price} deducted from balance.`);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sell Bundles</h2>
          <p className="text-slate-500">Select a package to sell to a customer.</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 card-shadow overflow-x-auto">
            {networks.map(net => (
              <button
                key={net.id}
                onClick={() => setSelectedNetwork(net.name)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  selectedNetwork === net.name ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {net.name}
              </button>
            ))}
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 card-shadow overflow-x-auto max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                  activeCat === cat ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.filter(b => b.cat === activeCat).map(bundle => (
          <div key={bundle.id} className="bg-white p-6 rounded-2xl border border-slate-100 card-shadow hover:border-emerald-200 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Package className="w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{selectedNetwork}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{bundle.validity}</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{bundle.name}</h3>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">Price</p>
                <p className="text-2xl font-black text-slate-900">TZS {bundle.price}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onAddToCart({ ...bundle, network: selectedNetwork, category: bundle.cat })}
                  className="bg-slate-100 text-slate-900 p-2 rounded-lg hover:bg-emerald-100 transition-colors"
                  title="Add to Cart"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleSellNow(bundle)}
                  disabled={sellingBundle === bundle.id}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {sellingBundle === bundle.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Selling...
                    </>
                  ) : "Sell Now"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SelfCareView = ({ cart, onRemove }: { cart: CartItem[], onRemove: (idx: number) => void }) => {
  const [activeTab, setActiveTab] = useState<'account' | 'cart' | 'history'>('account');
  const [checkoutState, setCheckoutState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [showProfileCapture, setShowProfileCapture] = useState(false);
  const [formData, setFormData] = useState({ profileImage: '' });
  
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const handleCheckout = () => {
    setCheckoutState('processing');
    setTimeout(() => {
      setCheckoutState('success');
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {checkoutState === 'idle' && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveTab('account')}
            className={cn(
              "flex-1 min-w-[150px] p-6 rounded-2xl border transition-all text-left",
              activeTab === 'account' ? "bg-white border-emerald-500 card-shadow" : "bg-slate-50 border-transparent text-slate-500"
            )}
          >
            <div className={cn("p-3 rounded-xl w-fit mb-4", activeTab === 'account' ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400")}>
              <User className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">My Account</h3>
            <p className="text-sm mt-1">Check balance & profile.</p>
          </button>
          <button 
            onClick={() => setActiveTab('cart')}
            className={cn(
              "flex-1 min-w-[150px] p-6 rounded-2xl border transition-all text-left relative",
              activeTab === 'cart' ? "bg-white border-emerald-500 card-shadow" : "bg-slate-50 border-transparent text-slate-500"
            )}
          >
            {cart.length > 0 && (
              <span className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
            <div className={cn("p-3 rounded-xl w-fit mb-4", activeTab === 'cart' ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400")}>
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">My Cart</h3>
            <p className="text-sm mt-1">Review & checkout.</p>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 min-w-[150px] p-6 rounded-2xl border transition-all text-left",
              activeTab === 'history' ? "bg-white border-emerald-500 card-shadow" : "bg-slate-50 border-transparent text-slate-500"
            )}
          >
            <div className={cn("p-3 rounded-xl w-fit mb-4", activeTab === 'history' ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400")}>
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">History</h3>
            <p className="text-sm mt-1">Past transactions.</p>
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 card-shadow p-8">
        <AnimatePresence mode="wait">
          {checkoutState === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="py-20 text-center space-y-6"
            >
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
                  <PaymentIcon className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Processing Payment</h2>
                <p className="text-slate-500 max-w-xs mx-auto">Directing request for {cart.length} items to your mobile wallet. Please check your phone.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl max-w-sm mx-auto border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Items in Request</p>
                <div className="space-y-1">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.name}</span>
                      <span className="font-bold text-slate-900">TZS {item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {checkoutState === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 text-center space-y-6"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Payment Successful!</h2>
                <p className="text-slate-500">Your items have been activated. Thank you for using SAMUSA.</p>
              </div>
              <button 
                onClick={() => { setCheckoutState('idle'); setActiveTab('history'); }}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                View History
              </button>
            </motion.div>
          )}

          {checkoutState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {activeTab === 'account' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-2xl font-black relative group overflow-hidden">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} className="w-full h-full object-cover" />
                      ) : "JD"}
                      <button 
                        onClick={() => setShowProfileCapture(true)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">John Doe</h2>
                      <p className="text-slate-500">0712 345 678 • Premium Member</p>
                    </div>
                  </div>

                  {showProfileCapture && (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <DocumentCapture 
                        label="Capture Profile Photo" 
                        onCapture={(img) => {
                          setFormData({...formData, profileImage: img});
                          setShowProfileCapture(false);
                        }} 
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-500 text-xs font-bold uppercase mb-1">Airtime Balance</p>
                      <p className="text-2xl font-black text-slate-900">TZS 4,500</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-500 text-xs font-bold uppercase mb-1">Data Balance</p>
                      <p className="text-2xl font-black text-slate-900">12.4 GB</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-500 text-xs font-bold uppercase mb-1">Points</p>
                      <p className="text-2xl font-black text-emerald-600">850 pts</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Recharge', 'Transfer', 'SOS', 'KYC Update'].map(action => (
                        <button key={action} className="p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all">
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cart' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Shopping Cart</h2>
                    <span className="text-slate-500 text-sm font-medium">{cart.length} items</span>
                  </div>

                  {cart.length > 0 ? (
                    <>
                      <div className="divide-y divide-slate-100">
                        {cart.map((item, idx) => (
                          <div key={idx} className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Package className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{item.name}</p>
                                <p className="text-xs text-slate-500 uppercase font-bold">{item.network} • {item.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <p className="font-black text-slate-900">TZS {item.price}</p>
                              <button 
                                onClick={() => onRemove(idx)}
                                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-6 border-t border-slate-100 flex flex-col items-end gap-4">
                        <div className="text-right">
                          <p className="text-slate-500 text-sm">Total Amount</p>
                          <p className="text-3xl font-black text-slate-900">TZS {total}</p>
                        </div>
                        <button 
                          onClick={handleCheckout}
                          className="w-full md:w-64 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                        >
                          Checkout Now
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <ShoppingCart className="w-10 h-10" />
                      </div>
                      <p className="text-slate-500 font-medium">Your cart is empty.</p>
                      <button className="text-emerald-600 font-bold hover:underline">Browse Bundles</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Transaction History</h2>
                  <div className="space-y-4">
                    {[
                      { name: 'Weekly 5GB', date: 'Oct 24, 2023', price: '5000', status: 'Success' },
                      { name: 'Airtime Topup', date: 'Oct 20, 2023', price: '2000', status: 'Success' },
                      { name: 'Daily 1GB', date: 'Oct 15, 2023', price: '1000', status: 'Success' },
                    ].map((tx, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-lg text-slate-400">
                            <History className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{tx.name}</p>
                            <p className="text-xs text-slate-500">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">TZS {tx.price}</p>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase">{tx.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 pt-8 border-t border-slate-100">
                <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 text-center md:text-left">
                      <h3 className="text-2xl font-bold">Need Assistance?</h3>
                      <p className="text-emerald-100/80">Our support team is available 24/7 to help you with any issues.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                      <a 
                        href="tel:+255780585781"
                        className="flex items-center justify-center gap-3 bg-white text-emerald-900 px-6 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-xl shadow-black/20"
                      >
                        <Phone className="w-5 h-5" />
                        +255 780 585 781
                      </a>
                      <button className="flex items-center justify-center gap-3 bg-emerald-800 text-white px-6 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all border border-emerald-700">
                        <MessageSquare className="w-5 h-5" />
                        Live Chat
                      </button>
                    </div>
                  </div>
                  <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-800 rounded-full opacity-20 blur-3xl"></div>
                  <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-400 rounded-full opacity-10 blur-3xl"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MerchantView = () => {
  const [activeTab, setActiveTab] = useState<'lipa' | 'till' | 'request'>('lipa');
  const [selectedNetwork, setSelectedNetwork] = useState('M-PESA');
  const [requestData, setRequestData] = useState({
    phone: '',
    amount: '',
    service: 'SIM Registration'
  });
  const [isSending, setIsSending] = useState(false);
  const [isProcessingLipa, setIsProcessingLipa] = useState(false);
  const [isSubmittingTill, setIsSubmittingTill] = useState(false);

  const networks = [
    { id: 'mpesa', name: 'M-PESA', color: 'bg-emerald-600' },
    { id: 'airtel', name: 'Airtel Money', color: 'bg-red-600' },
    { id: 'yas', name: 'Yas Money', color: 'bg-yellow-400' },
    { id: 'halotel', name: 'Halopesa', color: 'bg-orange-500' }
  ];

  const handleSendRequest = () => {
    setIsSending(true);
    setTimeout(() => {
      alert(`Payment request of TZS ${requestData.amount} for ${requestData.service} sent to ${requestData.phone}`);
      setIsSending(false);
      setRequestData({ phone: '', amount: '', service: 'SIM Registration' });
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex gap-4">
        <button 
          onClick={() => setActiveTab('lipa')}
          className={cn(
            "flex-1 p-6 rounded-2xl border transition-all text-left",
            activeTab === 'lipa' ? "bg-white border-emerald-500 card-shadow" : "bg-slate-50 border-transparent text-slate-500"
          )}
        >
          <div className={cn("p-3 rounded-xl w-fit mb-4", activeTab === 'lipa' ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400")}>
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Lipa Number</h3>
          <p className="text-sm mt-1">Direct payment to a specific phone number.</p>
        </button>
        <button 
          onClick={() => setActiveTab('till')}
          className={cn(
            "flex-1 p-6 rounded-2xl border transition-all text-left",
            activeTab === 'till' ? "bg-white border-emerald-500 card-shadow" : "bg-slate-50 border-transparent text-slate-500"
          )}
        >
          <div className={cn("p-3 rounded-xl w-fit mb-4", activeTab === 'till' ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400")}>
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Till Creation</h3>
          <p className="text-sm mt-1">Register a new merchant till for a business.</p>
        </button>
        <button 
          onClick={() => setActiveTab('request')}
          className={cn(
            "flex-1 p-6 rounded-2xl border transition-all text-left",
            activeTab === 'request' ? "bg-white border-emerald-500 card-shadow" : "bg-slate-50 border-transparent text-slate-500"
          )}
        >
          <div className={cn("p-3 rounded-xl w-fit mb-4", activeTab === 'request' ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400")}>
            <Send className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Payment Request</h3>
          <p className="text-sm mt-1">Send an automatic payment request to a customer.</p>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 card-shadow p-8">
        {activeTab === 'lipa' ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Lipa na {selectedNetwork}</h2>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                {networks.map(net => (
                  <button
                    key={net.id}
                    onClick={() => setSelectedNetwork(net.name)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      selectedNetwork === net.name ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {net.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Recipient Number ({selectedNetwork})</label>
                <input type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="07XX XXX XXX" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Amount (TZS)</label>
                <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Reference / Reason</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Payment for..." />
            </div>
            <button 
              onClick={() => {
                setIsProcessingLipa(true);
                setTimeout(() => {
                  alert(`Successfully processed ${selectedNetwork} payment!`);
                  setIsProcessingLipa(false);
                }, 2000);
              }}
              disabled={isProcessingLipa}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessingLipa ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Payment...
                </>
              ) : `Process ${selectedNetwork} Payment`}
            </button>
          </div>
        ) : activeTab === 'till' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">New Merchant Registration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Business Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Sam's Groceries" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Business Type</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white">
                  <option>Retail / Shop</option>
                  <option>Restaurant / Cafe</option>
                  <option>Transport / Logistics</option>
                  <option>Professional Services</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Owner ID Number</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="12345678" />
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <p className="text-xs text-emerald-800">
                <strong>Note:</strong> Merchant till creation requires physical verification of business premises within 48 hours of application.
              </p>
            </div>
            <button 
              onClick={() => {
                setIsSubmittingTill(true);
                setTimeout(() => {
                  alert("Merchant application submitted successfully! Our team will visit your premises for verification.");
                  setIsSubmittingTill(false);
                }, 2000);
              }}
              disabled={isSubmittingTill}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmittingTill ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting Application...
                </>
              ) : "Submit Merchant Application"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Send Payment Request</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Customer Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" 
                  placeholder="07XX XXX XXX"
                  value={requestData.phone}
                  onChange={e => setRequestData({...requestData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Service Type</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                  value={requestData.service}
                  onChange={e => setRequestData({...requestData, service: e.target.value})}
                >
                  <option>SIM Registration</option>
                  <option>SIM Swap</option>
                  <option>Bundle Purchase</option>
                  <option>Merchant Service</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Amount (TZS)</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" 
                placeholder="0.00"
                value={requestData.amount}
                onChange={e => setRequestData({...requestData, amount: e.target.value})}
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed">
                This will send a Push USSD / STK Push request to the customer's phone. They will need to enter their PIN to authorize the payment.
              </p>
            </div>
            <button 
              onClick={handleSendRequest}
              disabled={isSending || !requestData.phone || !requestData.amount}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSending ? "Sending Request..." : "Send Payment Request"}
              {!isSending && <Send className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AssistantView = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Hello! I'm SAMUSA, your Smart Agent Assistant. How can I help you today? I can guide you through SIM registration, swaps, bundle sales, or merchant services." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await getGeminiResponse(userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error: Could not connect to the smart brain. Please check your API key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
      <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">SAMUSA Assistant</h3>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Online & Ready</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex w-full",
            msg.role === 'user' ? "justify-end" : "justify-start"
          )}>
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-emerald-600 text-white rounded-tr-none" 
                : "bg-slate-100 text-slate-800 rounded-tl-none"
            )}>
              <Markdown>
                {msg.text}
              </Markdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-50">
        <div className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ask SAMUSA anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <ArrowRightLeft className="w-6 h-6 rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showGlobalScanner, setShowGlobalScanner] = useState(false);
  const [scannedSerials, setScannedSerials] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Hello! I'm your live support assistant. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const response = await getGeminiResponse(userMsg);
      setChatMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Error: Could not connect to support. Please try again later." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
    alert(`${item.name} added to cart!`);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleGlobalScan = (serial: string) => {
    setScannedSerials(prev => [serial, ...prev].slice(0, 5));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sim-reg', label: 'SIM Registration', icon: UserPlus },
    { id: 'sim-swap', label: 'SIM Swap', icon: RefreshCw },
    { id: 'bundles', label: 'Sell Bundles', icon: Package },
    { id: 'merchant', label: 'Merchant Services', icon: Store },
    { id: 'self-care', label: 'Self-Care', icon: ShieldCheck },
    { id: 'assistant', label: 'Smart Assistant', icon: MessageSquare },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return (
        <DashboardView 
          scannedSerials={scannedSerials} 
          onScanClick={() => setShowGlobalScanner(true)}
          onActionClick={(v) => setActiveView(v)}
        />
      );
      case 'sim-reg': return <SIMRegistrationView />;
      case 'sim-swap': return <SIMSwapView />;
      case 'bundles': return <BundlesView onAddToCart={addToCart} />;
      case 'merchant': return <MerchantView />;
      case 'self-care': return <SelfCareView cart={cart} onRemove={removeFromCart} />;
      case 'assistant': return <AssistantView />;
      default: return (
        <DashboardView 
          scannedSerials={scannedSerials} 
          onScanClick={() => setShowGlobalScanner(true)}
          onActionClick={(v) => setActiveView(v)}
        />
      );
    }
  };

  return (
    <div className="min-h-screen flex text-slate-900">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transition-transform duration-300 lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight leading-none">SAMUSA</h1>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Smart Agent</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <SidebarItem 
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeView === item.id}
                onClick={() => {
                  setActiveView(item.id as View);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
              />
            ))}
          </nav>

          <div className="mt-auto p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                JD
              </div>
              <div>
                <p className="text-sm font-bold">John Doe</p>
                <p className="text-xs text-slate-500">Agent ID: #8821</p>
              </div>
            </div>
            <button className="w-full py-2 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 capitalize">
              {menuItems.find(m => m.id === activeView)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input type="text" placeholder="Search services..." className="bg-transparent border-none outline-none text-sm w-40" />
            </div>
            <button 
              onClick={() => setShowGlobalScanner(true)}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center gap-2 border border-emerald-100"
            >
              <Camera className="w-5 h-5" />
              <span className="text-sm font-bold hidden sm:inline">Quick Scan</span>
            </button>
            <button 
              onClick={() => setActiveView('self-care')}
              className="p-2 text-slate-400 hover:text-slate-900 relative"
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                  {cart.length}
                </span>
              )}
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-900 relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {showGlobalScanner && (
        <CameraScanner 
          onScan={handleGlobalScan} 
          onClose={() => setShowGlobalScanner(false)} 
        />
      )}

      {/* Floating Live Chat Button */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
        <AnimatePresence>
          {showLiveChat && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="w-80 h-[450px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col card-shadow"
            >
              <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">SAMUSA Support</p>
                    <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">Online • Ready to help</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLiveChat(false)} 
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div ref={chatScrollRef} className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex gap-3",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      msg.role === 'user' ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                    </div>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm border max-w-[80%] shadow-sm",
                      msg.role === 'user' 
                        ? "bg-emerald-600 text-white border-emerald-500 rounded-tr-none" 
                        : "bg-white text-slate-700 border-slate-100 rounded-tl-none"
                    )}>
                      <div className="prose prose-sm max-w-none">
                        <Markdown>
                          {msg.text}
                        </Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none flex gap-1 border border-slate-100 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-slate-50 border-none outline-none text-sm px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                  />
                  <button 
                    onClick={handleChatSend}
                    disabled={isChatLoading}
                    className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowLiveChat(!showLiveChat)}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 relative group",
            showLiveChat ? "bg-slate-900 text-white" : "bg-emerald-600 text-white"
          )}
        >
          {showLiveChat ? (
            <X className="w-8 h-8" />
          ) : (
            <>
              <MessageSquare className="w-8 h-8" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-4 border-slate-50 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
              </span>
            </>
          )}
          <div className="absolute right-full mr-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat with Support
          </div>
        </button>
      </div>
    </div>
  );
}
