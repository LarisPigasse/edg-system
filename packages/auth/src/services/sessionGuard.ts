// src/services/sessionGuard.ts
//
// Punto unico di reazione a una sessione non più valida: account bloccato o
// disattivato, sessione revocata da un amministratore, o refresh token ormai
// scaduto. Chiamato dai wrapper di fetch che riconoscono questo caso preciso
// — una richiesta che aveva comunque allegato un token Bearer, tornata 401 e
// non risolta nemmeno dopo il tentativo di refresh silenzioso — vedi
// apiFetch.ts e api/authApi.ts.
//
// Il reset è "duro" (window.location, non una navigate() di React Router):
// azzera anche stato Redux, timer e chiamate in corso di qualunque pagina
// fosse aperta, invece di lasciare in giro stato residuo di una sessione che
// il backend considera già chiusa. Corretto qui perché l'evento è raro e
// serio (non una normale transizione di pagina), non per pigrizia.

import { AUTH_STORAGE_KEYS } from '../types';

const SESSION_ENDED_PATH = '/sessione-terminata';

/** Rimuove tutti i dati di autenticazione da entrambi gli storage. */
export function clearAuthStorage(): void {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    storage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    storage.removeItem(AUTH_STORAGE_KEYS.ACCOUNT);
    storage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
  }
}

// Evita reindirizzamenti duplicati se più chiamate falliscono in parallelo
// nello stesso istante (es. una pagina che lancia più fetch simultanee).
let handling = false;

/**
 * Da chiamare quando una richiesta autenticata torna 401 in modo definitivo
 * (anche dopo un eventuale tentativo di refresh): pulisce lo storage e forza
 * un reset completo dell'app sulla pagina dedicata, passando il motivo
 * ricevuto dal backend (es. "Account disattivato", "Sessione revocata")
 * come query string — la pagina lo usa per mostrare un messaggio coerente.
 */
export function handleSessionInvalid(reason?: string): void {
  if (handling) return;
  if (window.location.pathname === SESSION_ENDED_PATH) return;
  handling = true;

  clearAuthStorage();

  const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  window.location.href = `${SESSION_ENDED_PATH}${query}`;
}
