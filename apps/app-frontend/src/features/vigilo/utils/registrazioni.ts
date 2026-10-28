// src/features/vigilo/utils/registrazioni.ts
//
// Una registrazione in parole: che cosa è successo e con quali dettagli.
// Usate dal pannello della scadenza e dallo storico del soggetto. In più,
// dal modulo Registra ai dati della conferma di una segnalazione (B9c).
import type { DatiConferma, DatiEsecuzione, Registrazione } from '../types/scadenze';
import { giornoBreve } from './giorni';

/** "Eseguita", "Rinviata al 23 ott 2026: officina piena", "Segnalata fatta, da confermare"… */
export function descrizioneRegistrazione(r: Registrazione): string {
  if (r.stato === 'da-confermare') return 'Segnalata fatta, da confermare';
  if (r.stato === 'respinta') return `Segnalazione respinta${r.motivoRifiuto ? `: ${r.motivoRifiuto}` : ''}`;
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

/** I campi del modulo Registra che valgono per la conferma: niente esito (è positivo) né nuova data */
const CAMPI_CONFERMA = ['eseguitaIl', 'lettura', 'importo', 'fornitore', 'riferimento', 'note', 'prossima', 'allegati'] as const;

export const datiConferma = (d: DatiEsecuzione): DatiConferma =>
  Object.fromEntries(CAMPI_CONFERMA.filter(k => k in d).map(k => [k, d[k]])) as unknown as DatiConferma;
