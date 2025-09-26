'use client';

import React, { useState } from 'react';
import { useSyncStatus, useConnectionStatus } from '@floe/shared';
import { Button } from './Button';

interface SyncStatusIndicatorProps {
  userId: string;
  onForceSync?: () => Promise<void>;
  showDetails?: boolean;
  className?: string;
}

export function SyncStatusIndicator({
  userId,
  onForceSync,
  showDetails = false,
  className = ''
}: SyncStatusIndicatorProps) {
  const { status, isOnline, isRealtime, isSyncing, pendingOperations, lastSync } = useSyncStatus(userId);
  const [forceSyncing, setForceSyncing] = useState(false);

  const handleForceSync = async () => {
    if (!onForceSync || forceSyncing) return;

    try {
      setForceSyncing(true);
      await onForceSync();
    } catch (error) {
      console.error('Force sync failed:', error);
    } finally {
      setForceSyncing(false);
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-text-tertiary-light dark:text-text-tertiary-dark';
    if (isSyncing || forceSyncing) return 'text-text-secondary-light dark:text-text-secondary-dark';
    if (isRealtime) return 'text-text-primary-light dark:text-text-primary-dark';
    return 'text-text-secondary-light dark:text-text-secondary-dark';
  };

  const getStatusSymbol = () => {
    if (!isOnline) return '○'; // Offline
    if (isSyncing || forceSyncing) return '◐'; // Syncing
    if (isRealtime && pendingOperations === 0) return '●'; // Connected and synced
    if (pendingOperations > 0) return '◑'; // Has pending operations
    return '●'; // Online
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing || forceSyncing) return 'Syncing...';
    if (isRealtime && pendingOperations === 0) return 'Synced';
    if (pendingOperations > 0) return `${pendingOperations} pending`;
    return 'Online';
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!showDetails) {
    // Simple indicator
    return (
      <div className={`flex items-center space-x-xs ${className}`}>
        <span className={`text-sm ${getStatusColor()}`}>
          {getStatusSymbol()}
        </span>
        <span className={`text-xs ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    );
  }

  // Detailed view
  return (
    <div className={`space-y-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-sm">
          <span className={`text-sm ${getStatusColor()}`}>
            {getStatusSymbol()}
          </span>
          <span className={`text-xs font-mono tracking-wide uppercase ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {(onForceSync && isOnline && !isSyncing) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleForceSync}
            disabled={forceSyncing}
            loading={forceSyncing}
            className="text-xs"
          >
            Sync
          </Button>
        )}
      </div>

      {/* Details */}
      <div className="space-y-xs text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
        <div className="flex justify-between">
          <span>Connection:</span>
          <span>{isOnline ? (isRealtime ? 'Real-time' : 'Online') : 'Offline'}</span>
        </div>

        {lastSync && (
          <div className="flex justify-between">
            <span>Last sync:</span>
            <span>{formatLastSync(lastSync)}</span>
          </div>
        )}

        {pendingOperations > 0 && (
          <div className="flex justify-between">
            <span>Pending:</span>
            <span>{pendingOperations} operations</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ConnectionStatusBannerProps {
  className?: string;
}

export function ConnectionStatusBanner({ className = '' }: ConnectionStatusBannerProps) {
  const { isOnline, connectionType } = useConnectionStatus();

  if (isOnline) return null; // Don't show banner when online

  return (
    <div className={`
      bg-text-primary-light dark:bg-text-primary-dark
      text-bg-primary-light dark:text-bg-primary-dark
      text-center py-sm px-md text-xs font-mono tracking-wide uppercase
      ${className}
    `}>
      ○ Working Offline - Changes will sync when reconnected
    </div>
  );
}

interface SyncProgressProps {
  progress: number; // 0-100
  message?: string;
  className?: string;
}

export function SyncProgress({ progress, message = 'Syncing...', className = '' }: SyncProgressProps) {
  return (
    <div className={`space-y-sm ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          {message}
        </span>
        <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-px bg-border-light dark:bg-border-dark">
        <div
          className="h-full bg-text-primary-light dark:bg-text-primary-dark transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
}

interface OfflineModeToggleProps {
  isOffline: boolean;
  onToggle: (offline: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function OfflineModeToggle({
  isOffline,
  onToggle,
  disabled = false,
  className = ''
}: OfflineModeToggleProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="space-y-xs">
        <div className="text-sm text-text-primary-light dark:text-text-primary-dark">
          Offline Mode
        </div>
        <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          {isOffline ? 'Working offline only' : 'Syncing with server'}
        </div>
      </div>

      <button
        onClick={() => onToggle(!isOffline)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200 focus:outline-none
          ${isOffline
            ? 'bg-text-primary-light dark:bg-text-primary-dark'
            : 'bg-border-light dark:bg-border-dark'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full
            bg-bg-primary-light dark:bg-bg-primary-dark
            transition-transform duration-200
            ${isOffline ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}

interface SyncSettingsProps {
  settings: {
    autoSync: boolean;
    syncInterval: number;
    enableRealtime: boolean;
    enableOffline: boolean;
  };
  onChange: (settings: any) => void;
  className?: string;
}

export function SyncSettings({ settings, onChange, className = '' }: SyncSettingsProps) {
  const intervalOptions = [
    { value: 10000, label: '10 seconds' },
    { value: 30000, label: '30 seconds' },
    { value: 60000, label: '1 minute' },
    { value: 300000, label: '5 minutes' },
    { value: 600000, label: '10 minutes' }
  ];

  return (
    <div className={`space-y-lg ${className}`}>
      <div>
        <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-sm">
          Sync Settings
        </h3>
      </div>

      {/* Auto Sync */}
      <div className="flex items-center justify-between">
        <div className="space-y-xs">
          <div className="text-sm text-text-primary-light dark:text-text-primary-dark">
            Auto Sync
          </div>
          <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Automatically sync changes
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.autoSync}
          onChange={(e) => onChange({ ...settings, autoSync: e.target.checked })}
          className="h-4 w-4"
        />
      </div>

      {/* Sync Interval */}
      {settings.autoSync && (
        <div>
          <label className="block text-sm text-text-primary-light dark:text-text-primary-dark mb-xs">
            Sync Interval
          </label>
          <select
            value={settings.syncInterval}
            onChange={(e) => onChange({ ...settings, syncInterval: parseInt(e.target.value) })}
            className="w-full text-sm bg-transparent border border-border-light dark:border-border-dark px-sm py-xs"
          >
            {intervalOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Real-time */}
      <div className="flex items-center justify-between">
        <div className="space-y-xs">
          <div className="text-sm text-text-primary-light dark:text-text-primary-dark">
            Real-time Updates
          </div>
          <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Instant updates across devices
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.enableRealtime}
          onChange={(e) => onChange({ ...settings, enableRealtime: e.target.checked })}
          className="h-4 w-4"
        />
      </div>

      {/* Offline Support */}
      <div className="flex items-center justify-between">
        <div className="space-y-xs">
          <div className="text-sm text-text-primary-light dark:text-text-primary-dark">
            Offline Support
          </div>
          <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Work without internet connection
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.enableOffline}
          onChange={(e) => onChange({ ...settings, enableOffline: e.target.checked })}
          className="h-4 w-4"
        />
      </div>
    </div>
  );
}