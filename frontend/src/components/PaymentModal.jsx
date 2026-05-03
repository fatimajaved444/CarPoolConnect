import React, { useState } from 'react';
import { X, CreditCard, Banknote, Loader2, Lock } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, onConfirm, totalAmount, seats }) => {
  const [method, setMethod] = useState('online');
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });

  if (!isOpen) return null;

  const isValidCard = cardDetails.number.length >= 16 && cardDetails.expiry.length >= 4 && cardDetails.cvc.length >= 3;

  const handleConfirm = () => {
    if (method === 'online' && !isValidCard) {
      alert("Please enter valid card details");
      return;
    }
    
    if (method === 'online') {
      setProcessing(true);
      // Simulate API call for online payment
      setTimeout(() => {
        setProcessing(false);
        onConfirm(method);
      }, 1500);
    } else {
      onConfirm(method);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Payment Details</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-indigo-800 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-indigo-700">Rs {Math.round(totalAmount)}</span>
            </div>
            <p className="text-xs text-indigo-500 text-right">for {seats} seat{seats > 1 ? 's' : ''}</p>
          </div>

          <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</p>
          
          <div className="space-y-3 mb-8">
            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${method === 'online' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-200'}`}>
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <CreditCard className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">Pay Online</p>
                <p className="text-xs text-gray-500">Credit/Debit Card or Wallet</p>
              </div>
              <input type="radio" name="payment" value="online" checked={method === 'online'} onChange={() => setMethod('online')} className="h-5 w-5 text-indigo-600 focus:ring-indigo-500" />
            </label>

            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${method === 'cash' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-200'}`}>
              <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                <Banknote className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">Cash on Pickup</p>
                <p className="text-xs text-gray-500">Pay directly to the driver</p>
              </div>
              <input type="radio" name="payment" value="cash" checked={method === 'cash'} onChange={() => setMethod('cash')} className="h-5 w-5 text-indigo-600 focus:ring-indigo-500" />
            </label>
          </div>

          {method === 'online' && (
            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-slate-800">Enter Card Details</p>
                <Lock size={14} className="text-emerald-600" />
              </div>
              
              <div>
                <input 
                  type="text" 
                  placeholder="Card Number" 
                  maxLength={19}
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails(p => ({ ...p, number: e.target.value.replace(/\D/g, '') }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  maxLength={5}
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails(p => ({ ...p, expiry: e.target.value }))}
                  className="w-1/2 px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
                <input 
                  type="password" 
                  placeholder="CVC" 
                  maxLength={4}
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails(p => ({ ...p, cvc: e.target.value.replace(/\D/g, '') }))}
                  className="w-1/2 px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
              <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                <Lock size={10} /> Secure encrypted payment
              </p>
            </div>
          )}

          <button 
            onClick={handleConfirm} 
            disabled={processing}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Processing...
              </>
            ) : (
              method === 'online' ? `Pay Rs ${Math.round(totalAmount)}` : 'Confirm Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
