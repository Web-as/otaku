import { lazy } from 'react';

// Lazy load pages for better performance
export const LazyQuestsPage = lazy(() => import('../page_components/QuestsPage'));
export const LazyCollectiblesPage = lazy(() => import('../page_components/CollectiblesPage'));
export const LazyLeaderboardPage = lazy(() => import('../page_components/LeaderboardPage'));
export const LazyAdminPage = lazy(() => import('../page_components/AdminPage'));
export const LazyScannerPage = lazy(() => import('../page_components/ScannerPage'));
export const LazySettingsPage = lazy(() => import('../page_components/SettingsPage'));
export const LazyAssistantPage = lazy(() => import('../page_components/AssistantPage'));
