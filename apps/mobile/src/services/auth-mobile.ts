import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import { supabase } from '@floe/supabase';

export class MobileAuthService {
  private static readonly BIOMETRIC_KEY = 'biometric_enabled';

  // Biometric authentication
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(this.BIOMETRIC_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled state:', error);
      return false;
    }
  }

  static async enableBiometric(): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric authentication for Floe',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        await SecureStore.setItemAsync(this.BIOMETRIC_KEY, 'true');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error enabling biometric authentication:', error);
      return false;
    }
  }

  static async disableBiometric(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.BIOMETRIC_KEY);
    } catch (error) {
      console.error('Error disabling biometric authentication:', error);
    }
  }

  static async authenticateWithBiometric(): Promise<boolean> {
    try {
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Floe',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch (error) {
      console.error('Error with biometric authentication:', error);
      return false;
    }
  }

  // OAuth with deep linking
  static async signInWithApple(): Promise<{ success: boolean; error?: string }> {
    try {
      if (Platform.OS !== 'ios') {
        return { success: false, error: 'Apple sign-in is only available on iOS' };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'floe://auth/callback',
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  static async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'floe://auth/callback',
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Deep link handling
  static handleAuthCallback(url: string): void {
    if (url.includes('auth/callback')) {
      // The session will be automatically handled by the AuthContext
      // through the onAuthStateChange listener
      console.log('Auth callback received:', url);
    }
  }

  // Secure storage for session tokens (handled by Supabase automatically)
  static async storeSecurely(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error storing secure item:', error);
    }
  }

  static async getSecurely(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting secure item:', error);
      return null;
    }
  }

  static async deleteSecurely(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error deleting secure item:', error);
    }
  }
}