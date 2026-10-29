// src/features/vigilo/utils/registrazioni.ts
//
// Una registrazione in parole: che cosa è successo e con quali dettagli.
// Usate dal pannello della scadenza e dallo storico del soggetto. In più,
// dal modulo Registra ai dati della conferma di una segnalazione (B9c).
import type { DatiConferma, DatiEsecuzione, Registrazione } from '../types/scadenze';
import { giornoBreve } from './giorni';
import { euro, testoEsecuzione, testoOre } from './manodopera';

/** "Eseguita", "Rinviata al 23 ott 2026: officina piena", "Segnalata fatta, da confermare"… */
export function descrizioneRegistrazione(r: Registrazione): string {
  if (r.stato === 'da-confermare') return 'Segnalata fatta, da confermare';
  if (r.stato === 'respinta') return `Segnalazione respinta${r.motivoRifiuto ? `: ${r.motivoRifiuto}` : ''}`;
  if (r.tipo === 'rinvio') return `Rinviata${r.dataNuova ? ` al ${giornoBreve(r.dataNuova)}` : ''}${r.motivo ? `: ${r.motivo}` : ''}`;
  if (r.tipo === 'rinnovo-tacito') return 'Rinnovo tacito';
  if (r.esito === 'negativo') return `Esito negativo${r.dataNuova ? `, da rifare entro il ${giornoBreve(r.dataNuova)}` : ''}`;
  return r.esecuzione ? `Eseguita ${testoEsecuzione(r.esecuzione)}` : 'Eseguita';
}

/** "3,5 h: Mario Rossi 1,5 h, dipendente 2 h" (passo 8) */
export const testoManodopera = (r: Registrazione): string | null =>
  r.manodopera.length ? `${testoOre(r.oreManodopera)}: ${r.manodopera.map(m => `${m.nome ?? 'dipendente'} ${testoOre(m.ore)}`).join(', ')}` : null;

/**
 * "Officina Rossi · FT 123 · 3,5 h: Mario Rossi… · 250,00 € · note": gli euro
 * solo a chi li vede; con la manodopera il costo totale (importo + manodopera)
 */
export function dettagliRegistrazione(r: Registrazione): string {
  const soldi = r.manodopera.length && r.costoTotale != null ? `totale ${euro(r.costoTotale)}` : r.importo != null ? euro(r.importo) : null;
  return [r.fornitore?.nome, r.riferimento, testoManodopera(r), soldi, r.note].filter(Boolean).join(' · ');
}

/** I campi del modulo Registra che valgono per la conferma: niente esito (è positivo) né nuova data */
const CAMPI_CONFERMA = ['eseguitaIl', 'lettura', 'importo', 'fornitore', 'riferimento', 'note', 'prossima', 'allegati', 'rimettiInServizio'] as const;

export const datiConferma = (d: DatiEsecuzione): DatiConferma =>
  Object.fromEntries(CAMPI_CONFERMA.filter(k => k in d).map(k => [k, d[k]])) as unknown as DatiConferma;
