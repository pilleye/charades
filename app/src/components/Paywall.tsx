'use client';

import React, { useState, useEffect } from 'react';
import { useSubscriptionStore, PRODUCT_ID_FULL, PRODUCT_ID_DISCOUNT } from '@/store/subscriptionStore';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { XMarkIcon } from './ui/Icons';
import { FREE_TIER_CARD_LIMIT, DEFAULT_DECKS } from '@/data/decks';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'custom_words' | 'full_deck' | 'locked_deck';
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const Paywall: React.FC<PaywallProps> = ({ isOpen, onClose, trigger }) => {
  const {
    purchase,
    restore,
    products,
    status,
    error,
    offerEndTime,
    checkAndReactivateOffer
  } = useSubscriptionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Initialize/Check offer on modal open
  useEffect(() => {
    if (isOpen) {
      checkAndReactivateOffer();
    }
  }, [isOpen, checkAndReactivateOffer]);

  // Timer tick
  useEffect(() => {
    if (!offerEndTime) return;

    const tick = () => {
      const remaining = Math.max(0, offerEndTime - Date.now());
      setTimeLeft(remaining);
    };

    tick(); // Initial
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [offerEndTime]);

  const isOfferActive = timeLeft > 0;
  // If it's a short reactivation (<= 5 mins), treat it as a "Flash Sale"
  const isFlashSale = isOfferActive && (offerEndTime! - timeLeft < (Date.now() - 1000) && timeLeft <= 5 * 60 * 1000); 
  
  // Determine active product and price
  const activeProductId = isOfferActive ? PRODUCT_ID_DISCOUNT : PRODUCT_ID_FULL;
  const productPrice = products[activeProductId]?.price || (isOfferActive ? '$4.99' : '$9.99');

  const handlePurchase = async () => {
    setIsLoading(true);
    const success = await purchase(activeProductId);
    setIsLoading(false);
    if (success) {
      onClose();
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    const success = await restore();
    setIsRestoring(false);
    if (success) {
      onClose();
    }
  };

  let triggerMessage = `Access to more than ${FREE_TIER_CARD_LIMIT} cards requires`;
  if (trigger === 'custom_words') {
    triggerMessage = 'Adding custom words requires';
  } else if (trigger === 'locked_deck') {
    triggerMessage = 'Access to this premium deck requires';
  }

  const totalWords = Object.values(DEFAULT_DECKS).reduce((acc, deck) => acc + deck.length, 0);
  const roundedWords = Math.floor(totalWords / 100) * 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative text-center">
        <button
          onClick={onClose}
          className="absolute -top-2 -left-2 p-2 text-slate-300 transition-colors hover:text-slate-500 active:scale-95"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
          <span className="text-3xl">&#9733;</span>
        </div>

        <h2 className="mb-2 text-2xl font-black tracking-wide text-slate-800 uppercase">
          Unlock Premium
        </h2>

        {isOfferActive && (
          <div className="mb-4 inline-block rounded-full bg-red-100 px-4 py-1">
             <span className="animate-pulse text-xs font-bold text-red-600 uppercase tracking-widest">
               {timeLeft <= 5 * 60 * 1000 ? '⚡ FLASH SALE' : 'Special Offer'} Ends in {formatTime(timeLeft)}
             </span>
          </div>
        )}

        <p className="mb-6 text-sm text-slate-500">
          {triggerMessage} a Premium subscription
        </p>

        <div className="mb-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
              &#10003;
            </span>
            <span className="font-semibold text-slate-700">
              All decks with {roundedWords.toLocaleString()}+ words
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
              &#10003;
            </span>
            <span className="font-semibold text-slate-700">
              Add unlimited custom words
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
              &#10003;
            </span>
            <span className="font-semibold text-slate-700">
              All future decks included
            </span>
          </div>
          
          <div className={`flex items-center gap-3 transition-all duration-500 ${isOfferActive ? 'scale-105 transform' : ''}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 shadow-sm">
              <span className="text-sm">★</span>
            </span>
            <div className="flex flex-col">
              {isOfferActive ? (
                // Discount View
                <>
                   <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 line-through decoration-slate-400">
                      $9.99
                    </span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                      SAVE 50%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-800">
                      {productPrice}
                    </span>
                    <span className="text-sm text-slate-500">/ year</span>
                  </div>
                </>
              ) : (
                // Full Price View
                 <div className="flex flex-col">
                    <span className="text-lg font-black text-slate-800">
                      {productPrice}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                       / year
                    </span>
                 </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center">
            <p className="text-xs font-bold text-red-500">{error}</p>
          </div>
        )}

        <Button
          variant="success"
          size="xl"
          fullWidth
          onClick={handlePurchase}
          disabled={isLoading || status === 'checking'}
          className="mb-3 relative overflow-hidden"
        >
          {isLoading ? 'Processing...' : (isOfferActive ? 'CLAIM OFFER' : 'SUBSCRIBE')}
          {isOfferActive && !isLoading && (
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}
        </Button>

        <button
          onClick={handleRestore}
          disabled={isRestoring}
          className="w-full py-3 text-sm font-bold text-slate-400 transition-colors hover:text-slate-600"
        >
          {isRestoring ? 'Restoring...' : 'Restore Purchase'}
        </button>

        <p className="mt-4 text-xs text-slate-400">
          Subscription automatically renews yearly.
        </p>
      </div>
    </Modal>
  );
};
