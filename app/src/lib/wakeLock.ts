// Keep Awake API to prevent screen from sleeping during gameplay
import { KeepAwake } from '@capacitor-community/keep-awake';

let isKeepAwakeActive = false;

export const wakeLockManager = {
  async enable(): Promise<boolean> {
    try {
      await KeepAwake.keepAwake();
      isKeepAwakeActive = true;
      console.log('Keep awake active');
      return true;
    } catch (error) {
      console.error('Failed to enable keep awake:', error);
      return false;
    }
  },

  async disable(): Promise<void> {
    try {
      await KeepAwake.allowSleep();
      isKeepAwakeActive = false;
      console.log('Keep awake disabled');
    } catch (error) {
      console.error('Failed to disable keep awake:', error);
    }
  },

  handleVisibilityChange: async () => {
    // Capacitor's keep awake handles visibility changes automatically
    // No manual intervention needed
  },

  isActive(): boolean {
    return isKeepAwakeActive;
  },
};
