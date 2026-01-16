import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Capacitor } from '@capacitor/core';
import { NativePurchases, PURCHASE_TYPE, type Transaction } from '@capgo/native-purchases';

// Product IDs
export const PRODUCT_ID_FULL = 'charades_premium_yearly_999';
export const PRODUCT_ID_DISCOUNT = 'charades_premium_yearly_499';
const ALL_PRODUCT_IDS = [PRODUCT_ID_FULL, PRODUCT_ID_DISCOUNT];

export type SubscriptionStatus =
  | 'unknown'
  | 'checking'
  | 'active'
  | 'expired'
  | 'not_subscribed';

interface ProductInfo {
  id: string;
  title: string;
  price: string;
}

interface SubscriptionState {
  // Status
  status: SubscriptionStatus;
  isInitialized: boolean;
  error: string | null;

  // Product info (fetched from store)
  products: Record<string, ProductInfo>;

  // Flash Sale Logic
  offerEndTime: number | null; // Timestamp when the discount expires

  // Actions
  initialize: () => Promise<void>;
  purchase: (productId: string) => Promise<boolean>;
  restore: () => Promise<boolean>;
  setStatus: (status: SubscriptionStatus) => void;
  setError: (error: string | null) => void;
  activateOffer: (durationMs: number) => void;
  checkAndReactivateOffer: () => void;
}

// Helper to check if a subscription is active
const isSubscriptionActive = (transaction: Transaction): boolean => {
  if (!transaction.expirationDate) return false;
  const expirationDate = new Date(transaction.expirationDate);
  return expirationDate > new Date();
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      status: 'unknown',
      isInitialized: false,
      error: null,
      products: {},
      offerEndTime: null,

      setStatus: (status) => set({ status }),
      setError: (error) => set({ error }),

      activateOffer: (durationMs) => {
        set({ offerEndTime: Date.now() + durationMs });
      },

      checkAndReactivateOffer: () => {
        const { offerEndTime, activateOffer } = get();
        const now = Date.now();

        // 1. First time user? Activate standard 15 min offer
        if (!offerEndTime) {
          activateOffer(15 * 60 * 1000);
          return;
        }

        // 2. Offer currently active? Do nothing.
        if (offerEndTime > now) {
          return;
        }

        // 3. Offer expired. Check cooldown (e.g., 1 hour)
        const COOLDOWN = 60 * 60 * 1000;
        if (now - offerEndTime < COOLDOWN) {
          return;
        }

        // 4. Random Chance (30%)
        const isLucky = Math.random() < 0.3;

        if (isLucky) {
          // Reactivate for shorter time (5 mins) to increase urgency
          activateOffer(5 * 60 * 1000);
        } else {
          // Failed roll. Reset "last expiration" to now to restart cooldown.
          // This prevents spamming open/close to force a lucky roll.
          set({ offerEndTime: now });
        }
      },

      initialize: async () => {
        // Only run on native iOS
        if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
          set({ isInitialized: true, status: 'not_subscribed' });
          return;
        }

        // Prevent double initialization
        if (get().isInitialized) {
          return;
        }

        set({ status: 'checking' });

        try {
          // Get products from App Store
          const { products: storeProducts } = await NativePurchases.getProducts({
            productIdentifiers: ALL_PRODUCT_IDS,
            productType: PURCHASE_TYPE.SUBS,
          });

          const productsMap: Record<string, ProductInfo> = {};
          storeProducts.forEach((p) => {
            productsMap[p.identifier] = {
              id: p.identifier,
              title: p.title || 'Premium',
              price: p.priceString || '$9.99',
            };
          });

          set({ products: productsMap });

          // Check current purchases (active subscriptions)
          const { purchases } = await NativePurchases.getPurchases();

          const hasActiveSubscription = purchases.some(
            (t) => ALL_PRODUCT_IDS.includes(t.productIdentifier) && isSubscriptionActive(t)
          );

          set({
            isInitialized: true,
            status: hasActiveSubscription ? 'active' : 'not_subscribed',
          });
        } catch (error) {
          console.error('[IAP] Initialization error:', error);
          set({
            isInitialized: true,
            status: 'not_subscribed',
            error: error instanceof Error ? error.message : 'Failed to initialize',
          });
        }
      },

      purchase: async (productId: string) => {
        if (!Capacitor.isNativePlatform()) {
          set({ error: 'Purchases only available on device' });
          return false;
        }

        try {
          set({ error: null });

          const transaction = await NativePurchases.purchaseProduct({
            productIdentifier: productId,
            productType: PURCHASE_TYPE.SUBS,
          });

          if (transaction && transaction.transactionId) {
            set({ status: 'active', error: null });
            return true;
          }

          return false;
        } catch (error) {
          console.error('[IAP] Purchase error:', error);

          const err = error as { code?: string; message?: string };
          // Check if user cancelled
          if (err.code === 'USER_CANCELLED' || err.message?.includes('cancel')) {
            // User cancelled - not an error
            return false;
          }

          set({ error: err.message || 'Purchase failed' });
          return false;
        }
      },

      restore: async () => {
        if (!Capacitor.isNativePlatform()) {
          set({ error: 'Restore only available on device' });
          return false;
        }

        try {
          set({ error: null, status: 'checking' });

          // Restore purchases from App Store
          await NativePurchases.restorePurchases();

          // Check purchases after restore
          const { purchases } = await NativePurchases.getPurchases();

          const hasActiveSubscription = purchases.some(
            (t) => ALL_PRODUCT_IDS.includes(t.productIdentifier) && isSubscriptionActive(t)
          );

          if (hasActiveSubscription) {
            set({ status: 'active' });
            return true;
          } else {
            set({ status: 'not_subscribed' });
            return false;
          }
        } catch (error) {
          console.error('[IAP] Restore error:', error);
          const err = error as { message?: string };
          set({
            status: 'not_subscribed',
            error: err.message || 'Restore failed',
          });
          return false;
        }
      },
    }),
    {
      name: 'charades-subscription',
      partialize: (state) => ({
        // Persist status and offer timer
        status: state.status,
        offerEndTime: state.offerEndTime,
      }),
    }
  )
);

// Helper hook to check premium status
export const useIsPremium = () => {
  const status = useSubscriptionStore((state) => state.status);
  return status === 'active';
};
