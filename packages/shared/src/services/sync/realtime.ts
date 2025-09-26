import { supabase } from '@floe/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import type { Card, SmartSpace, Profile } from '../../types';

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export interface RealtimeEvent<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  old: Partial<T> | null;
  new: Partial<T> | null;
  errors: string[] | null;
}

export interface RealtimeCallbacks {
  onCardChange?: (event: RealtimeEvent<Card>) => void;
  onSmartSpaceChange?: (event: RealtimeEvent<SmartSpace>) => void;
  onProfileChange?: (event: RealtimeEvent<Profile>) => void;
  onPresenceChange?: (users: any[]) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export class RealtimeManager {
  private static subscriptions = new Map<string, RealtimeSubscription>();
  private static isConnected = false;
  private static connectionListeners: Array<(connected: boolean) => void> = [];

  // Subscribe to real-time changes for a user
  static subscribeToUserData(userId: string, callbacks: RealtimeCallbacks): string {
    const subscriptionId = `user_${userId}_${Date.now()}`;

    try {
      const channel = supabase
        .channel(subscriptionId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cards',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            this.handleDatabaseChange('cards', payload, callbacks.onCardChange);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'smart_spaces',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            this.handleDatabaseChange('smart_spaces', payload, callbacks.onSmartSpaceChange);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`
          },
          (payload) => {
            this.handleDatabaseChange('profiles', payload, callbacks.onProfileChange);
          }
        )
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const users = Object.keys(state).map(userId => state[userId][0]);
          callbacks.onPresenceChange?.(users);
        })
        .subscribe((status) => {
          this.handleConnectionStatus(status, callbacks);
        });

      // Track user presence
      channel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
        device: this.getDeviceInfo()
      });

      const subscription: RealtimeSubscription = {
        channel,
        unsubscribe: () => {
          channel.unsubscribe();
          this.subscriptions.delete(subscriptionId);
        }
      };

      this.subscriptions.set(subscriptionId, subscription);
      return subscriptionId;

    } catch (error) {
      console.error('Failed to subscribe to realtime updates:', error);
      callbacks.onError?.(error instanceof Error ? error : new Error('Subscription failed'));
      return '';
    }
  }

  // Subscribe to specific smart space changes
  static subscribeToSmartSpace(spaceId: string, callbacks: RealtimeCallbacks): string {
    const subscriptionId = `space_${spaceId}_${Date.now()}`;

    try {
      const channel = supabase
        .channel(subscriptionId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cards',
            filter: `smart_space_ids.cs.{${spaceId}}`
          },
          (payload) => {
            this.handleDatabaseChange('cards', payload, callbacks.onCardChange);
          }
        )
        .subscribe((status) => {
          this.handleConnectionStatus(status, callbacks);
        });

      const subscription: RealtimeSubscription = {
        channel,
        unsubscribe: () => {
          channel.unsubscribe();
          this.subscriptions.delete(subscriptionId);
        }
      };

      this.subscriptions.set(subscriptionId, subscription);
      return subscriptionId;

    } catch (error) {
      console.error('Failed to subscribe to smart space updates:', error);
      callbacks.onError?.(error instanceof Error ? error : new Error('Smart space subscription failed'));
      return '';
    }
  }

  // Unsubscribe from a specific subscription
  static unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  // Unsubscribe from all subscriptions
  static unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  // Get connection status
  static getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Add connection status listener
  static addConnectionListener(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  // Broadcast a message to all users in a smart space
  static async broadcastToSmartSpace(spaceId: string, message: any): Promise<void> {
    const channel = supabase.channel(`space_broadcast_${spaceId}`);

    try {
      await channel.send({
        type: 'broadcast',
        event: 'space_update',
        payload: {
          space_id: spaceId,
          message,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to broadcast message:', error);
      throw error;
    }
  }

  // Send typing indicator
  static async sendTypingIndicator(userId: string, isTyping: boolean): Promise<void> {
    const channel = supabase.channel('typing_indicators');

    try {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: userId,
          is_typing: isTyping,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  }

  private static handleDatabaseChange(table: string, payload: any, callback?: (event: RealtimeEvent) => void): void {
    if (!callback) return;

    try {
      const event: RealtimeEvent = {
        eventType: payload.eventType,
        table,
        old: payload.old || null,
        new: payload.new || null,
        errors: payload.errors || null
      };

      callback(event);
    } catch (error) {
      console.error(`Failed to handle ${table} change:`, error);
    }
  }

  private static handleConnectionStatus(status: string, callbacks: RealtimeCallbacks): void {
    const wasConnected = this.isConnected;
    this.isConnected = status === 'SUBSCRIBED';

    if (this.isConnected && !wasConnected) {
      callbacks.onConnected?.();
      this.notifyConnectionListeners(true);
    } else if (!this.isConnected && wasConnected) {
      callbacks.onDisconnected?.();
      this.notifyConnectionListeners(false);
    }
  }

  private static notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Connection listener error:', error);
      }
    });
  }

  private static getDeviceInfo(): string {
    if (typeof navigator !== 'undefined') {
      // Web environment
      return `${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} Web`;
    } else {
      // Assume mobile app
      return 'Mobile App';
    }
  }

  // Health check for connection
  static async healthCheck(): Promise<boolean> {
    try {
      const channel = supabase.channel('health_check');
      const startTime = Date.now();

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          channel.unsubscribe();
          resolve(false);
        }, 5000); // 5 second timeout

        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout);
            channel.unsubscribe();
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Auto-reconnection utility
export class RealtimeReconnectionManager {
  private static reconnectInterval: NodeJS.Timeout | null = null;
  private static maxReconnectAttempts = 5;
  private static reconnectDelay = 2000; // Start with 2 seconds
  private static currentAttempt = 0;

  static startAutoReconnect(callbacks: RealtimeCallbacks): void {
    this.stopAutoReconnect();

    const attemptReconnect = async () => {
      if (this.currentAttempt >= this.maxReconnectAttempts) {
        console.warn('Max reconnection attempts reached');
        return;
      }

      this.currentAttempt++;
      console.log(`Attempting reconnection ${this.currentAttempt}/${this.maxReconnectAttempts}`);

      try {
        const isHealthy = await RealtimeManager.healthCheck();

        if (isHealthy) {
          console.log('Reconnection successful');
          this.currentAttempt = 0;
          this.reconnectDelay = 2000; // Reset delay
          callbacks.onConnected?.();
        } else {
          // Exponential backoff
          this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
          this.reconnectInterval = setTimeout(attemptReconnect, this.reconnectDelay);
        }
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
        this.reconnectInterval = setTimeout(attemptReconnect, this.reconnectDelay);
      }
    };

    this.reconnectInterval = setTimeout(attemptReconnect, this.reconnectDelay);
  }

  static stopAutoReconnect(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    this.currentAttempt = 0;
  }
}