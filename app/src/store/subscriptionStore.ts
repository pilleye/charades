import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Capacitor } from '@capacitor/core';
import { NativePurchases, PURCHASE_TYPE, type Transaction } from '@capgo/native-purchases';

// Product ID - must match App Store Connect
export const PRODUCT_ID = 'charades_premium_yearly';

export type SubscriptionStatus =
  | 'unknown'
  | 'checking'
  | 'active'
  | 'expired'
  | 'not_subscribed';

interface SubscriptionState {
  // Status
  status: SubscriptionStatus;
  isInitialized: boolean;
  error: string | null;

  // Product info (fetched from store)
  productTitle: string | null;
  productPrice: string | null;

  // Actions
  initialize: () => Promise<void>;
  purchase: () => Promise<boolean>;
  restore: () => Promise<boolean>;
  setStatus: (status: SubscriptionStatus) => void;
  setError: (error: string | null) => void;
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
      productTitle: null,
      productPrice: null,

      setStatus: (status) => set({ status }),
      setError: (error) => set({ error }),

      initialize: async () => {
        // Only run on native iOS
        if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
          console.log('[IAP] Not on iOS, skipping initialization');
          set({ isInitialized: true, status: 'not_subscribed' });
          return;
        }

        // Prevent double initialization
        if (get().isInitialized) {
          console.log('[IAP] Already initialized');
          return;
        }

        set({ status: 'checking' });

        try {
          // Get products from App Store
          const { products } = await NativePurchases.getProducts({
            productIdentifiers: [PRODUCT_ID],
            productType: PURCHASE_TYPE.SUBS,
          });

          console.log('[IAP] Products loaded:', products);

          if (products.length > 0) {
            const product = products[0];
            set({
              productTitle: product.title || 'Premium',
              productPrice: product.priceString || '$0.99',
            });
          }

          // Check current purchases (active subscriptions)
          const { purchases } = await NativePurchases.getPurchases();
          console.log('[IAP] Current purchases:', purchases);

          const hasActiveSubscription = purchases.some(
            (t) => t.productIdentifier === PRODUCT_ID && isSubscriptionActive(t)
          );

          set({
            isInitialized: true,
            status: hasActiveSubscription ? 'active' : 'not_subscribed',
          });

          console.log('[IAP] Initialized, premium:', hasActiveSubscription);
        } catch (error) {
          console.error('[IAP] Initialization error:', error);
          set({
            isInitialized: true,
            status: 'not_subscribed',
            error: error instanceof Error ? error.message : 'Failed to initialize',
          });
        }
      },

      purchase: async () => {
        if (!Capacitor.isNativePlatform()) {
          set({ error: 'Purchases only available on device' });
          return false;
        }

        try {
          set({ error: null });

          const transaction = await NativePurchases.purchaseProduct({
            productIdentifier: PRODUCT_ID,
            productType: PURCHASE_TYPE.SUBS,
          });

          console.log('[IAP] Purchase result:', transaction);

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
          console.log('[IAP] Restored purchases:', purchases);

          const hasActiveSubscription = purchases.some(
            (t) => t.productIdentifier === PRODUCT_ID && isSubscriptionActive(t)
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
        // Only persist status to remember subscription between sessions
        status: state.status,
      }),
    }
  )
);

// Helper hook to check premium status
export const useIsPremium = () => {
  const status = useSubscriptionStore((state) => state.status);
  return status === 'active';
};
