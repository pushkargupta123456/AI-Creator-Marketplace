/*
 * Theme constants shared between the server layout and the client provider.
 *
 * Deliberately NOT a 'use client' module: the root layout inlines THEME_KEY
 * into a pre-paint <script>, and importing it from a client module would hand
 * the server a client-reference proxy instead of the string.
 */

/** What the user chose. `system` (the default) follows the device setting. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** What is actually on screen. */
export type ResolvedTheme = 'light' | 'dark';

export const THEME_KEY = 'cre8r.theme';
