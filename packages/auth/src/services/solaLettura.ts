// packages/auth/src/services/solaLettura.ts
//
// Assistenza in sola lettura (AA4): il personale EDG vede EDG App come un
// utente del cliente e non può modificare nulla. Il controllo vero è nel
// gateway (sessionGuard); qui si applica la stessa regola prima di chiamare
// la rete, così chi guarda ha subito un messaggio chiaro e nessuna
// richiesta parte invano. L'uscita dall'assistenza resta sempre permessa.
import { isAssistedTab, readAssistenza } from './tokenStore';

/** Stesso messaggio del gateway (codice ASSISTENZA_SOLA_LETTURA) */
export const MESSAGGIO_SOLA_LETTURA = 'In assistenza puoi solo guardare: le modifiche non sono permesse';

const LETTURE = new Set(['GET', 'HEAD', 'OPTIONS']);
const USCITA_ASSISTENZA = /\/auth\/assistenza\/fine\/?(\?|$)/;

/** true se questa scheda è un'Assistenza in sola lettura */
export function isSolaLettura(): boolean {
  return isAssistedTab() && readAssistenza()?.assistenza.modo === 'assistenza';
}

/** true se la richiesta modificherebbe qualcosa mentre si è in sola lettura */
export function scritturaBloccata(method: string | undefined, url: string): boolean {
  if (LETTURE.has((method ?? 'GET').toUpperCase()) || USCITA_ASSISTENZA.test(url)) return false;
  return isSolaLettura();
}
