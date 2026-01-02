// Wake Lock API to prevent screen from sleeping during gameplay

let wakeLock: WakeLockSentinel | null = null;

export const wakeLockManager = {
  async enable(): Promise<boolean> {
    if (!('wakeLock' in navigator)) {
      console.warn('Wake Lock API not supported in this browser');
      return false;
    }

    try {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake lock active');

      // Re-enable wake lock when document becomes visible again
      document.addEventListener(
        'visibilitychange',
        this.handleVisibilityChange
      );

      return true;
    } catch (error) {
      console.error('Failed to enable wake lock:', error);
      return false;
    }
  },

  async disable(): Promise<void> {
    if (wakeLock) {
      try {
        await wakeLock.release();
        wakeLock = null;
        console.log('Wake lock released');
      } catch (error) {
        console.error('Failed to release wake lock:', error);
      }
    }

    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );
  },

  handleVisibilityChange: async () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake lock re-enabled after visibility change');
      } catch (error) {
        console.error('Failed to re-enable wake lock:', error);
      }
    }
  },

  isActive(): boolean {
    return wakeLock !== null && !wakeLock.released;
  },
};
