// src/features/vigilo/constants/avvisi.ts
//
// Le parole della pagina "I miei avvisi" (B8d-1): gli stati dell'elenco e le
// frequenze delle email, nello stesso ordine del servizio.
import type { FrequenzaAvvisi, StatoElencoAvvisi } from '../types/avvisi';

/** Voci per pagina dell'elenco ("Mostra altri") */
export const AVVISI_PER_PAGINA = 32;

export const STATI_ELENCO_AVVISI: { value: StatoElencoAvvisi; label: string; vuoto: string }[] = [
  { value: 'tutti', label: 'Tutti', vuoto: 'Nessun avviso, per ora.' },
  { value: 'da-leggere', label: 'Da leggere', vuoto: 'Nessun avviso da leggere.' },
  { value: 'non-attuali', label: 'Non più attuali', vuoto: 'Nessun avviso superato: quando una scadenza si sistema, i suoi avvisi finiscono qui.' },
];

export const FREQUENZE_EMAIL: { value: FrequenzaAvvisi; label: string }[] = [
  { value: 'riepilogo-giornaliero', label: 'Riepilogo giornaliero' },
  { value: 'riepilogo-settimanale', label: 'Riepilogo settimanale' },
  { value: 'subito', label: 'Ogni avviso subito' },
  { value: 'mai', label: 'Nessuna email' },
];

/** Scelte del richiamo delle scadute, in giorni (0 = nessuno): potenze di 2 dentro i limiti del servizio (0-64) */
export const RICHIAMI = [0, 1, 2, 4, 8, 16, 32, 64] as const;

/** I giorni della settimana come le caselle dei giorni lavorativi (1 = lunedì) */
export const GIORNI_BREVI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'] as const;
