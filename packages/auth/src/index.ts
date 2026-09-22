// src/features/auth/index.ts

/**
 * MODULO AUTH - Entry Point
 *
 * Gestisce autenticazione, sessioni e permessi utente.
 *
 * @example
 * ```tsx
 * // Importare hook e componenti
 * import { useAuth, LoginPage, PrivateRoute } from '@edg/auth';
 *
 * // Importare reducer per lo store
 * import { authReducer } from '@edg/auth';
 *
 * // Importare tipi
 * import type { AuthAccount, LoginRequest } from '@edg/auth';
 * ```
 */

// ============================================================================
// TYPES - Contratto dati con il backend
// ============================================================================

export type {
  AccountType,
  AuthAccount,
  LoginRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ConfirmResetPasswordRequest,
  ApiResponse,
  LoginResponse,
  RefreshTokenResponse,
  AuthState,
} from './types';

export { AUTH_STORAGE_KEYS } from './types';

// ============================================================================
// API - Chiamate HTTP all'auth-service
// ============================================================================

export { authApi } from './api';

// apiFetch: utility fetch condivisa (Bearer token + refresh automatico su 401).
// Riusabile da qualunque modulo che chiami un microservizio dietro il gateway,
// non solo auth-service — es. le pagine di gestione dati in pro-frontend.
export { apiFetch, getAuthToken, getAuthHeaders } from './services/apiFetch';

// Reazione centralizzata a una sessione non più valida (401 definitivo su una
// richiesta autenticata): pulisce lo storage e forza il redirect dedicato.
// Riusabile da un futuro controllo periodico (polling) lato app.
export { handleSessionInvalid, clearAuthStorage } from './services/sessionGuard';

// ============================================================================
// STORE - Redux slice per stato globale
// ============================================================================

export {
  // Reducer (da aggiungere allo store principale)
  authReducer,

  // Actions sincrone
  clearError,
  updateAccount,
  resetAuth,

  // Async thunks
  initializeAuth,
  login,
  logout,
  refreshAccessToken,

  // Selectors
  selectAuth,
  selectIsAuthenticated,
  selectAccount,
  selectAuthLoading,
  selectAuthInitializing,
  selectAuthError,
  selectPermissions,
  selectModules,
  selectTenantId,
} from './store';

// ============================================================================
// HOOKS - Interfaccia semplificata per i componenti
// ============================================================================

export { useAuth } from './hooks';

// ============================================================================
// COMPONENTS - Elementi UI riusabili
// ============================================================================

export { UserMenu, ConnectionStatus } from './components';
export { PrivateRoute, LoginForm } from './components';

// ============================================================================
// PAGES - Pagine complete
// ============================================================================

export { LoginPage, ForgotPasswordPage, ResetPasswordPage, ChangePasswordPage, ProfilePage, SessioneTerminataPage } from './pages';
