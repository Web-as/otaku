
import React, { useState } from 'react';
import { X, CreditCard, Zap, ShieldCheck, Check, Download, AlertCircle, Bitcoin } from 'lucide-react';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState<'selection' | 'processing' | 'success'>('selection');
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'crypto' | 'paypal'>('card');

    if (!isOpen) return null;

    const handlePurchase = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('success');
            // Trigger the actual download logic from the parent after a brief success message
            setTimeout(() => {
                onComplete();
            }, 1500);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans">
            <div className="w-full max-w-lg bg-gray-900 border border-violet-500/30 rounded-lg shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div className="px-6 py-4 bg-[#111] border-b border-gray-800 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-bold text-white uppercase tracking-wider">Secure Checkout</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 'selection' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-white italic">Gildija Core: Founder's Edition</h3>
                                    <p className="text-xs text-gray-400 font-mono mt-1">v2.4.0-BETA • Lifetime License</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-500 line-through decoration-red-500 mr-2">€29.99</span>
                                    <span className="text-3xl font-black text-pink-500">$1.00</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${selectedMethod === 'card' ? 'bg-violet-900/20 border-violet-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`} onClick={() => setSelectedMethod('card')}>
                                    <div className="flex items-center space-x-3">
                                        <CreditCard className="w-5 h-5 text-gray-300" />
                                        <span className="font-bold text-sm text-white">Credit Card</span>
                                    </div>
                                    <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center">
                                        {selectedMethod === 'card' && <div className="w-2 h-2 rounded-full bg-violet-500"></div>}
                                    </div>
                                </label>
                                <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${selectedMethod === 'crypto' ? 'bg-violet-900/20 border-violet-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`} onClick={() => setSelectedMethod('crypto')}>
                                    <div className="flex items-center space-x-3">
                                        <Bitcoin className="w-5 h-5 text-gray-300" />
                                        <span className="font-bold text-sm text-white">Crypto (ETH/BTC)</span>
                                    </div>
                                    <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center">
                                        {selectedMethod === 'crypto' && <div className="w-2 h-2 rounded-full bg-violet-500"></div>}
                                    </div>
                                </label>
                            </div>

                            <div className="bg-blue-900/20 border border-blue-500/20 p-3 rounded flex items-start space-x-3">
                                <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                <p className="text-[10px] text-gray-300 leading-relaxed">
                                    By purchasing the Beta, you secure a <strong>Lifetime License</strong>. The price will increase upon full release.
                                </p>
                            </div>

                            <button 
                                onClick={handlePurchase}
                                className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black uppercase tracking-widest rounded-sm shadow-lg shadow-violet-900/40 transition transform active:scale-95"
                            >
                                Confirm Purchase • $1.00
                            </button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="relative w-16 h-16 mb-6">
                                <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-t-pink-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                                <Zap className="absolute inset-0 m-auto w-6 h-6 text-pink-500 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Processing Transaction...</h3>
                            <p className="text-xs text-gray-500 font-mono">Securing your license key on the blockchain...</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                <Check className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white italic mb-2">WELCOME TO THE GUILD</h3>
                            <p className="text-sm text-gray-400 mb-6 max-w-xs">
                                Your transaction was successful. The Core Installer is starting now.
                            </p>
                            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-green-500 h-full w-full animate-[shimmer_1s_infinite]"></div>
                            </div>
                            <p className="text-[10px] text-gray-600 font-mono mt-2 uppercase">Initializing Download...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
