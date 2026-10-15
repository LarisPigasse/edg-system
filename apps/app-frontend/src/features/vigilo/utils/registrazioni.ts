// src/features/vigilo/utils/registrazioni.ts
//
// Una registrazione in parole: che cosa è successo e con quali dettagli.
// Usate dal pannello della scadenza e dallo storico del soggetto.
import type { Registrazione } from '../types/scadenze';
import { giornoBreve } from './giorni';

/** "Eseguita", "Rinviata al 23 ott 2026: officina piena"… */
export function descrizioneRegistrazione(r: Registrazione): string {
  if (r.tipo === 'rinvio') return `Rinviata${r.dataNuova ? ` al ${giornoBreve(r.dataNuova)}` : ''}${r.motivo ? `: ${r.motivo}` : ''}`;
  if (r.tipo === 'rinnovo-tacito') return 'Rinnovo tacito';
  if (r.esito === 'negativo') return `Esito negativo${r.dataNuova ? `, da rifare entro il ${giornoBreve(r.dataNuova)}` : ''}`;
  return 'Eseguita';
}

/** "Officina Rossi · FT 123 · 250,00 € · note" (gli importi solo a chi li vede) */
export const dettagliRegistrazione = (r: Registrazione): string =>
  [r.fornitore?.nome, r.riferimento, r.importo != null ? r.importo.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }) : null, r.note]
    .filter(Boolean)
    .join(' · ');
