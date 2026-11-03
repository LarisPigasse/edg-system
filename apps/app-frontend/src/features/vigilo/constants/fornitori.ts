// src/features/vigilo/constants/fornitori.ts
//
// La rubrica dei fornitori (F1): lunghezze dei campi (le stesse di
// vigilo-service, fornitore.routes), filtri di stato e righe per pagina.
import type { StatoFornitori } from '../types/fornitori';

export const LIMITI_FORNITORE = { nome: 128, telefono: 64, email: 256, indirizzo: 256, referente: 128, note: 4096 } as const;

export const FILTRI_STATO_FORNITORI: { value: StatoFornitori; label: string }[] = [
  { value: 'attivi', label: 'Attivi' },
  { value: 'disattivati', label: 'Disattivati' },
  { value: 'tutti', label: 'Tutti' },
];

/** Righe dell'elenco per pagina ("Mostra altri") */
export const RIGHE_FORNITORI = 32;

/** Registrazioni per pagina nel dettaglio del fornitore */
export const RIGHE_STORICO_FORNITORE = 8;
