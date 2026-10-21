// packages/auth/src/services/tokenStore.ts
//
// Punto unico da cui si leggono i token (ADR085).
//
// Due sessioni possono convivere nello stesso browser:
//   - la sessione NORMALE dell'utente: localStorage (ricordami) o
//     sessionStorage, chiavi AUTH_STORAGE_KEYS;
//   - la sessione ASSISTITA del personale EDG: solo sessionStorage della
//     scheda aperta da EDG Pro, chiavi proprie, senza refresh token.
// Nella scheda assistita la sessione assistita ha la precedenza e la normale
// non si tocca mai: niente refresh (userebbe il refresh token della sessione
// normale e riporterebbe la scheda nel tenant di EDG), niente pulizia.

import { AUTH_STORAGE_KEYS, type AuthAccount, type AssistenzaInfo } from '../types';

/** Chiavi della sessione assistita (sessionStorage della scheda) */
export const ASSISTENZA_STORAGE_KEYS = {
  ACCESS_TOKEN: 'edg_assist_access_token',
  ACCOUNT: 'edg_assist_account',
  INFO: 'edg_assist_info',
} as const;

/** Pagine dell'accesso assistito (le registra l'applicazione) */
export const ASSISTENZA_PATHS = {
  INGRESSO: '/assistenza',
  TERMINATA: '/assistenza/terminata',
} as const;

// ─── Sessione assistita ──────────────────────────────────────────────────────

export interface SessioneAssistita {
  accessToken: string;
  account: AuthAccount;
  assistenza: AssistenzaInfo;
}

/** Sessione assistita della scheda, null se non c'è o se è già scaduta */
export function readAssistenza(): SessioneAssistita | null {
  try {
    const accessToken = sessionStorage.getItem(ASSISTENZA_STORAGE_KEYS.ACCESS_TOKEN);
    const account = sessionStorage.getItem(ASSISTENZA_STORAGE_KEYS.ACCOUNT);
    const info = sessionStorage.getItem(ASSISTENZA_STORAGE_KEYS.INFO);
    if (!accessToken || !account || !info) return null;
    return { accessToken, account: JSON.parse(account) as AuthAccount, assistenza: JSON.parse(info) as AssistenzaInfo };
  } catch {
    return null;
  }
}

/** true se questa scheda è in una sessione assistita */
export function isAssistedTab(): boolean {
  try {
    return sessionStorage.getItem(ASSISTENZA_STORAGE_KEYS.ACCESS_TOKEN) !== null;
  } catch {
    return false;
  }
}

export function saveAssistenza(sessione: SessioneAssistita): void {
  sessionStorage.setItem(ASSISTENZA_STORAGE_KEYS.ACCESS_TOKEN, sessione.accessToken);
  sessionStorage.setItem(ASSISTENZA_STORAGE_KEYS.ACCOUNT, JSON.stringify(sessione.account));
  sessionStorage.setItem(ASSISTENZA_STORAGE_KEYS.INFO, JSON.stringify(sessione.assistenza));
}

/** Aggiorna solo l'account della sessione assistita (es. updateAccount) */
export function saveAssistenzaAccount(account: AuthAccount): void {
  sessionStorage.setItem(ASSISTENZA_STORAGE_KEYS.ACCOUNT, JSON.stringify(account));
}

export function clearAssistenza(): void {
  for (const key of Object.values(ASSISTENZA_STORAGE_KEYS)) sessionStorage.removeItem(key);
}

/** Millisecondi che restano alla sessione assistita (0 se scaduta) */
export function msRimasti(assistenza: Pick<AssistenzaInfo, 'scade'>, adesso: number = Date.now()): number {
  return Math.max(0, new Date(assistenza.scade).getTime() - adesso);
}

// ─── Token correnti ──────────────────────────────────────────────────────────

/** Access token da usare: quello assistito se la scheda lo è, poi il normale */
export function readAccessToken(): string | null {
  const assistito = isAssistedTab() ? sessionStorage.getItem(ASSISTENZA_STORAGE_KEYS.ACCESS_TOKEN) : null;
  return (
    assistito ||
    localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) ||
    sessionStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) ||
    null
  );
}

/** Refresh token della sessione normale; null nella scheda assistita */
export function readRefreshToken(): string | null {
  if (isAssistedTab()) return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN) || sessionStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN) || null;
}
