
import React, { useState } from 'react';
import { ShoppingBag, Star, Plus, Minus, CreditCard, ShoppingCart, Check, X } from 'lucide-react';
import { ShopProduct, CartItem } from '../../types/types';
import { MOCK_MERCH_PRODUCTS } from '../../services/mockData';

const MerchStore: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showCart, setShowCart] = useState(false);

    const addToCart = (product: ShopProduct) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setShowCart(true);
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckout = () => {
        setIsCheckingOut(true);
        setTimeout(() => {
            setIsCheckingOut(false);
            setCart([]);
            setShowCart(false);
            alert("Redirecting to Shopify Checkout...");
        }, 1500);
    };

    return (
        <div className="relative min-h-[600px]">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Guild Supply Depot</h3>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Official Merchandise & Gear</p>
                </div>
                <button 
                    onClick={() => setShowCart(!showCart)}
                    className="relative p-3 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition"
                >
                    <ShoppingCart className="w-5 h-5 text-white" />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                            {cart.reduce((a, b) => a + b.quantity, 0)}
                        </span>
                    )}
                </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_MERCH_PRODUCTS.map(product => (
                    <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden group hover:border-violet-500/50 transition duration-300">
                        <div className="aspect-square bg-gray-800 relative overflow-hidden">
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500" />
                            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded border border-white/10">
                                ${product.price}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="text-[10px] font-mono text-violet-400 uppercase tracking-wider mb-1">{product.category}</div>
                            <h4 className="font-bold text-white mb-4 group-hover:text-pink-400 transition">{product.title}</h4>
                            <button 
                                onClick={() => addToCart(product)}
                                className="w-full py-2 bg-gray-800 hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-widest rounded transition flex items-center justify-center"
                            >
                                <ShoppingBag className="w-3 h-3 mr-2" /> Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cart Sidebar Overlay */}
            {showCart && (
                <div className="absolute top-0 right-0 bottom-0 w-full md:w-96 bg-[#1a1a2e] border-l border-gray-700 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#111]">
                        <h4 className="font-bold text-white uppercase tracking-wider flex items-center">
                            <ShoppingCart className="w-4 h-4 mr-2" /> Your Cart
                        </h4>
                        <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {cart.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="text-sm">Your cart is empty.</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex gap-4 bg-gray-900/50 p-3 rounded border border-gray-800">
                                    <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden shrink-0">
                                        <img src={item.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h5 className="text-sm font-bold text-white truncate">{item.title}</h5>
                                        <p className="text-xs text-violet-400 mb-2">${item.price}</p>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-700 rounded"><Minus className="w-3 h-3" /></button>
                                            <span className="text-xs font-mono">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-700 rounded"><Plus className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-400 self-start">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-700 bg-[#111]">
                        <div className="flex justify-between items-center mb-4 text-sm font-bold text-white">
                            <span>Total</span>
                            <span className="text-xl text-green-400 font-mono">${total.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isCheckingOut}
                            className={`w-full py-3 rounded font-black uppercase tracking-widest text-sm flex items-center justify-center transition ${
                                cart.length === 0 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-500 text-white'
                            }`}
                        >
                            {isCheckingOut ? 'Processing...' : (
                                <>Checkout <CreditCard className="w-4 h-4 ml-2" /></>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MerchStore;
