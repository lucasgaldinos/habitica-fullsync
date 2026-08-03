/**
 * Platform detection utilities for the Habitica Full Sync plugin.
 *
 * Detects whether the plugin is running on Obsidian mobile (capacitor/Cordova) or desktop (Electron), and provides the auto-sync platform gate.
 */

import { AutoSyncPlatform } from '../types';

/**
 * Detects whether the plugin is running on an Obsidian mobile platform.
 * Checks for `window.isMobile` (set by Obsidian mobile) and `window.cordova`.
 * @returns `true` if running on mobile; `false` on desktop (Electron) or in tests.
 */
export function isMobilePlatform(): boolean {
  const win = window as Window & { isMobile?: boolean; cordova?: unknown };
  return !!win?.isMobile || !!win?.cordova;
}

/**
 * Pure function: determines whether auto-sync should run on the current platform.
 * Uses a lookup table instead of an if-else ladder — adding a new platform option
 * requires only a new key, not new branching logic.
 */
export function shouldAutoSync(
  platformSetting: AutoSyncPlatform,
  isMobile: boolean,
): boolean {
  const platformMap: Record<AutoSyncPlatform, boolean> = {
    both: true,
    desktop: !isMobile,
    mobile: isMobile,
  };
  return platformMap[platformSetting];
}
