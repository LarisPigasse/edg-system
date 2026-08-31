// packages/ui/src/state/index.ts
export { useUISettings } from './hooks';
export { default as persistenceMiddleware, storageUtils } from './middleware/persistenceMiddleware';
export { APP_DATA, MESSAGES } from './constants';
export {
  initializeFromStorage,
  initializeTheme,
  toggleDarkMode,
  setDarkMode,
  toggleFooter,
  setFooterVisible,
  closeAllMenus,
  resetUISettings,
  selectDarkMode,
  selectFooterVisible,
  selectUIState,
  uiSliceReducer,
} from './slices';
