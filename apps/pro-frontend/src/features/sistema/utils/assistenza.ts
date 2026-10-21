// src/features/sistema/utils/assistenza.ts
//
// Accesso assistito (ADR085): indirizzo di app-frontend ed etichette.
import type { ModoAssistenza, StatoAssistenza } from '../types/assistenza';

/**
 * Indirizzo di app-frontend, dove si apre la scheda assistita.
 * VITE_APP_FRONTEND_URL se impostato; altrimenti lo si ricava da quello di
 * EDG Pro: in sviluppo la porta 5174, in produzione il sottodominio "app."
 * al posto di "pro.".
 */
export function appFrontendUrl(): string {
  const configurato = import.meta.env.VITE_APP_FRONTEND_URL as string | undefined;
  if (configurato) return configurato.replace(/\/$/, '');
  const { protocol, hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return `${protocol}//${hostname}:5174`;
  return `${protocol}//${hostname.replace(/^pro\./, 'app.')}`;
}

/** Indirizzo della scheda assistita: il codice dopo '#' non arriva ai server */
export const ingressoAssistenzaUrl = (codice: string): string => `${appFrontendUrl()}/assistenza#${codice}`;

export const MODO_LABEL: Record<ModoAssistenza, string> = {
  preparazione: 'Preparazione',
  assistenza: 'Assistenza',
};

export const STATO_LABEL: Record<StatoAssistenza, string> = {
  aperta: 'Aperta',
  uscita: 'Uscita',
  scaduta: 'Scaduta',
  chiusa: 'Chiusa da EDG',
};

const DATA_ORA = new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' });
const ORA = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });

export const formatDataOra = (value: string | null): string => (value ? DATA_ORA.format(new Date(value)) : '—');
export const formatOra = (value: string): string => ORA.format(new Date(value));
