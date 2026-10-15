// src/features/vigilo/constants/statiSoggetto.ts
//
// Lo stato di un soggetto, con parole valide per ogni tipo (decisione del
// 2026-10-14): Attivo · Sospeso · Archiviato, accordati al nome del tipo
// ("la sede è archiviata"). I codici del servizio restano in-servizio,
// fermo, dismesso: a schermo non compaiono mai. Non è urgenza: niente
// colori delle fasce, solo il peso del testo.
import type { FiltroStato, StatoSoggetto } from '../types/soggetti';
import type { TipoSoggetto } from '../types/valori';
import { TIPI } from './tipiSoggetto';

interface AspettoStato {
  maschile: string;
  femminile: string;
  /** Che cosa vuol dire, per il tooltip */
  info: string;
  testo: string;
}

export const STATI_SOGGETTO: Record<StatoSoggetto, AspettoStato> = {
  'in-servizio': {
    maschile: 'Attivo',
    femminile: 'Attiva',
    info: 'Vigilo segue le sue scadenze.',
    testo: 'text-text-secondary',
  },
  fermo: {
    maschile: 'Sospeso',
    femminile: 'Sospesa',
    info: "Momentaneamente fuori uso, ad esempio un mezzo fermo in officina o una persona in aspettativa: le scadenze continuano.",
    testo: 'font-semibold text-text-primary',
  },
  dismesso: {
    maschile: 'Archiviato',
    femminile: 'Archiviata',
    info: "Non più in uso (venduto, demolito, uscito dall'azienda): le scadenze aperte si chiudono, lo storico resta.",
    testo: 'text-text-disabled',
  },
};

/** "Attivo", "Archiviata"… accordato al tipo */
export const etichettaStato = (stato: StatoSoggetto, tipo: TipoSoggetto) =>
  TIPI[tipo].femminile ? STATI_SOGGETTO[stato].femminile : STATI_SOGGETTO[stato].maschile;

export const FILTRI_STATO: { value: FiltroStato; label: string }[] = [
  { value: 'attivi', label: 'Attivi e sospesi' },
  { value: 'in-servizio', label: 'Attivi' },
  { value: 'fermo', label: 'Sospesi' },
  { value: 'dismesso', label: 'Archiviati' },
];
