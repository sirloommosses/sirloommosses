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
  Send
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
    'Airtel': 1500,
    'Tigo': 1500,
    'Halotel': 1000,
    'TTCL': 1000,
    'Yas': 1000
  }
};

// --- Types ---
type View = 'dashboard' | 'sim-reg' | 'sim-swap' | 'bundles' | 'merchant' | 'assistant';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
  details: string;
}

// --- Components ---

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

const DashboardView = () => {
  const transactions: Transaction[] = [
    { id: '1', type: 'SIM Registration', amount: 'TZS 1000', status: 'success', date: '2 mins ago', details: '0712345678' },
    { id: '2', type: 'Bundle Sale', amount: 'TZS 5000', status: 'success', date: '15 mins ago', details: '2GB Monthly' },
    { id: '3', type: 'Till Creation', amount: 'TZS 0', status: 'pending', date: '1 hour ago', details: 'Sam\'s Shop' },
    { id: '4', type: 'SIM Swap', amount: 'TZS 500', status: 'failed', date: '2 hours ago', details: 'Invalid ID' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Sales" value="TZS 124,500" icon={CreditCard} trend="+12%" />
        <StatCard label="SIMs Registered" value="48" icon={UserPlus} trend="+5" />
        <StatCard label="Bundles Sold" value="156" icon={Package} trend="+24%" />
        <StatCard label="Active Tills" value="12" icon={Store} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
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

        <div className="bg-emerald-900 text-white rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden">
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
  const [formData, setFormData] = useState({
    network: '',
    firstName: '',
    lastName: '',
    idNumber: '',
    phoneNumber: '',
    simSerial: '',
    location: ''
  });

  const [isLocating, setIsLocating] = useState(false);

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

  const nextStep = () => setStep(s => s + 1);
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
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                      <Smartphone className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={prevStep}
                    className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={nextStep}
                    className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    Complete Registration
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
                  onClick={() => { setStep(1); setFormData({ network: '', firstName: '', lastName: '', idNumber: '', phoneNumber: '', simSerial: '', location: '' }); }}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Register Another SIM
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const SIMSwapView = () => {
  const [selectedNetwork, setSelectedNetwork] = useState('Vodacom');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const networks = [
    { id: 'vodacom', name: 'Vodacom', color: 'bg-red-700' },
    { id: 'airtel', name: 'Airtel', color: 'bg-red-600' },
    { id: 'tigo', name: 'Tigo', color: 'bg-blue-600' },
    { id: 'halotel', name: 'Halotel', color: 'bg-orange-500' },
    { id: 'ttcl', name: 'TTCL', color: 'bg-blue-700' }
  ];

  const handleSwap = () => {
    setIsRequesting(true);
    // Simulate payment request
    setTimeout(() => {
      alert(`Payment request of TZS ${SERVICE_PRICES['SIM Swap'][selectedNetwork]} sent to ${phoneNumber}`);
      setIsRequesting(false);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-100 card-shadow p-8">
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
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
              placeholder="89254..."
            />
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
    </div>
  );
};

const BundlesView = () => {
  const categories = ['Data', 'Voice', 'SMS', 'Integrated'];
  const [activeCat, setActiveCat] = useState('Data');
  const [selectedNetwork, setSelectedNetwork] = useState('Vodacom');

  const networks = [
    { id: 'vodacom', name: 'Vodacom', color: 'bg-red-600' },
    { id: 'airtel', name: 'Airtel', color: 'bg-red-500' },
    { id: 'tigo', name: 'Tigo', color: 'bg-blue-600' },
    { id: 'halotel', name: 'Halotel', color: 'bg-orange-500' },
    { id: 'ttcl', name: 'TTCL', color: 'bg-blue-700' }
  ];

  const bundles = [
    { id: 1, name: 'Daily 500MB', price: '500', validity: '24 Hours', cat: 'Data' },
    { id: 2, name: 'Daily 1GB', price: '1000', validity: '24 Hours', cat: 'Data' },
    { id: 3, name: 'Weekly 5GB', price: '5000', validity: '7 Days', cat: 'Data' },
    { id: 4, name: 'Monthly 15GB', price: '15000', validity: '30 Days', cat: 'Data' },
    { id: 5, name: 'Daily 50 Mins', price: '500', validity: '24 Hours', cat: 'Voice' },
    { id: 6, name: 'Weekly 300 Mins', price: '3000', validity: '7 Days', cat: 'Voice' },
    { id: 7, name: 'Daily 100 SMS', price: '200', validity: '24 Hours', cat: 'SMS' },
    { id: 8, name: 'Uni Bundle (Data+Voice)', price: '1000', validity: '24 Hours', cat: 'Integrated' },
  ];

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
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 card-shadow self-end">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all",
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
              <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors">
                Sell Now
              </button>
            </div>
          </div>
        ))}
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
            <button className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors">
              Process {selectedNetwork} Payment
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
            <button className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors">
              Submit Merchant Application
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sim-reg', label: 'SIM Registration', icon: UserPlus },
    { id: 'sim-swap', label: 'SIM Swap', icon: RefreshCw },
    { id: 'bundles', label: 'Sell Bundles', icon: Package },
    { id: 'merchant', label: 'Merchant Services', icon: Store },
    { id: 'assistant', label: 'Smart Assistant', icon: MessageSquare },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'sim-reg': return <SIMRegistrationView />;
      case 'sim-swap': return <SIMSwapView />;
      case 'bundles': return <BundlesView />;
      case 'merchant': return <MerchantView />;
      case 'assistant': return <AssistantView />;
      default: return <DashboardView />;
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
    </div>
  );
}
