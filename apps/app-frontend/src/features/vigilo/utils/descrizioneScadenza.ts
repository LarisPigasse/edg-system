// src/features/vigilo/utils/descrizioneScadenza.ts
//
// Le parti di una scadenza come testo, per la tabella e per il PDF.
import { MOTIVI_CHIUSURA } from '../constants/elencoScadenze';
import { NATURE_TESTO } from '../constants/nature';
import type { Scadenza } from '../types/scadenze';
import { giornoBreve } from './giorni';
import { misura } from './misure';

/** "Iveco Stralis FT456CD" o "Promemoria" */
export const soggettoDi = (s: Scadenza) => (s.soggetto ? [s.soggetto.nome, s.soggetto.identificativo].filter(Boolean).join(' ') : 'Promemoria');

export const naturaDi = (s: Scadenza) => (s.controllo ? NATURE_TESTO[s.controllo.natura] : 'Promemoria');

/** "23 set 2026", "a 16.000 km", "23 set 2026 o a 16.000 km" */
export function quandoDi(s: Scadenza): string {
  const parti = [
    s.scadeIl ? giornoBreve(s.scadeIl) : null,
    s.sogliaUso !== null && s.contatore ? `a ${misura(s.sogliaUso, s.contatore.unita)}` : null,
  ].filter(Boolean);
  return parti.length ? parti.join(' o ') : '—';
}

/** "Chiusa il 14 ott 2026 · eseguita e rinnovata" */
export const chiusuraDi = (s: Scadenza) =>
  s.chiusa ? `${giornoBreve(s.chiusa.il.slice(0, 10))} · ${MOTIVI_CHIUSURA[s.chiusa.motivo] ?? s.chiusa.motivo}` : '';
