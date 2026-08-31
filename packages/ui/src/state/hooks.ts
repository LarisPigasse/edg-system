// packages/ui/src/state/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleDarkMode,
  setDarkMode,
  toggleFooter,
  setFooterVisible,
  toggleUserMenu,
  setUserMenuOpen,
  closeUserMenu,
  toggleSettingsMenu,
  setSettingsMenuOpen,
  closeSettingsMenu,
  toggleMobileMenu,
  setMobileMenuOpen,
  closeMobileMenu,
  closeAllMenus,
  resetUISettings,
  selectDarkMode,
  selectFooterVisible,
  selectUserMenuOpen,
  selectSettingsMenuOpen,
  selectMobileMenuOpen,
} from './slices';

/**
 * Stato UI condiviso: tema, footer e menu.
 *
 * Il pacchetto NON conosce lo store dell'applicazione: i selector di `uiSlice`
 * sono scritti nella forma `(state: { ui: UIState })`, quindi funzionano con
 * qualunque store che monti `uiSliceReducer` sotto la chiave `ui`.
 * È l'unico vincolo che @edg/ui impone a chi lo usa.
 */
export const useUISettings = () => {
  const dispatch = useDispatch();

  const darkMode = useSelector(selectDarkMode);
  const footerVisible = useSelector(selectFooterVisible);
  const userMenuOpen = useSelector(selectUserMenuOpen);
  const settingsMenuOpen = useSelector(selectSettingsMenuOpen);
  const mobileMenuOpen = useSelector(selectMobileMenuOpen);

  return {
    darkMode,
    footerVisible,
    userMenuOpen,
    settingsMenuOpen,
    mobileMenuOpen,

    toggleDarkMode: () => dispatch(toggleDarkMode()),
    setDarkMode: (value: boolean) => dispatch(setDarkMode(value)),

    toggleFooter: () => dispatch(toggleFooter()),
    setFooterVisible: (value: boolean) => dispatch(setFooterVisible(value)),

    toggleUserMenu: () => dispatch(toggleUserMenu()),
    setUserMenuOpen: (value: boolean) => dispatch(setUserMenuOpen(value)),
    closeUserMenu: () => dispatch(closeUserMenu()),

    toggleSettingsMenu: () => dispatch(toggleSettingsMenu()),
    setSettingsMenuOpen: (value: boolean) => dispatch(setSettingsMenuOpen(value)),
    closeSettingsMenu: () => dispatch(closeSettingsMenu()),

    toggleMobileMenu: () => dispatch(toggleMobileMenu()),
    setMobileMenuOpen: (value: boolean) => dispatch(setMobileMenuOpen(value)),
    closeMobileMenu: () => dispatch(closeMobileMenu()),
    closeAllMenus: () => dispatch(closeAllMenus()),

    resetUISettings: () => dispatch(resetUISettings()),
  };
};
