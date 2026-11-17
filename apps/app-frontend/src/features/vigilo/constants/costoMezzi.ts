// src/features/vigilo/constants/costoMezzi.ts — costo dei mezzi (stima, tappa 1)
import type { TipoSoggetto } from '../types/valori';
import type { BloccoCosto, ModoPossesso, PeriodoAndamento, TipoGraficoAndamento } from '../types/costoMezzi';

/** I tipi di soggetto con un costo di possesso (come il servizio) */
export const TIPI_CON_POSSESSO: readonly TipoSoggetto[] = ['veicolo', 'macchina', 'attrezzatura'];

export const MODI_POSSESSO: { value: ModoPossesso; label: string; description: string }[] = [
  { value: 'acquisto', label: 'Acquistato', description: 'Vigilo stima la quota mensile da prezzo, anni di uso e valore finale.' },
  { value: 'leasing', label: 'Leasing', description: 'Il canone mensile del contratto.' },
  { value: 'noleggio', label: 'Noleggio', description: 'Il canone mensile del noleggio.' },
];

/** Come si dice il modo nel riepilogo: "acquistato", "in leasing", "a noleggio" */
export const MODO_IN_PAROLE: Record<ModoPossesso, string> = { acquisto: 'acquistato', leasing: 'in leasing', noleggio: 'a noleggio' };

/** Anni di uso proposti nel menu (il servizio accetta da 1 a 32) */
export const ANNI_POSSESSO = Array.from({ length: 32 }, (_, i) => i + 1);

/** Mezzi in vista nel riquadro di Spese e consumi prima di "Mostra tutti" */
export const MEZZI_IN_VISTA = 16;

/** I blocchi in parole, dopo "soprattutto" */
export const BLOCCHI_IN_PAROLE: Record<BloccoCosto, string> = { possesso: 'possesso', manutenzione: 'manutenzione e guasti', uso: 'rifornimenti e uso' };

/** Colore dei mezzi sopra la media della categoria */
export const COLORE_SOPRA_MEDIA = 'text-orange-700 [.dark_&]:text-orange-400';

/** Colore delle cifre chiave del costo (al mese, per km o ora) quando non sono sopra la media */
export const COLORE_CIFRA_CHIAVE = 'text-action-primary';

/** Andamento dei costi (2026-11-16): i colori delle tre linee, uguali nel grafico e nella tabella */
export const COLORI_ANDAMENTO = { possesso: 'var(--color-action-primary)', manutenzione: '#ea580c', uso: '#0891b2' } as const;

/** I tre blocchi dell'andamento */
export type BloccoAndamento = keyof typeof COLORI_ANDAMENTO;

/** I loro nomi, uguali nel grafico e nella tabella */
export const NOMI_BLOCCHI: Record<BloccoAndamento, string> = { possesso: 'Possesso', manutenzione: 'Manutenzione e guasti', uso: 'Rifornimenti e uso' };

/** I periodi dell'andamento, in ordine nell'elenco */
export const PERIODI_ANDAMENTO: { value: PeriodoAndamento; label: string }[] = [
  { value: 'chiusi', label: 'Ultimi 12 mesi chiusi' },
  { value: '12m', label: 'Ultimi 12 mesi' },
  { value: 'anno', label: 'Anno in corso' },
  { value: 'prec', label: 'Anno precedente' },
  { value: 'inizio', label: 'Da quando c\'è' },
  { value: 'personalizzato', label: 'Dal… al…' },
];

/** I tipi di grafico dell'andamento */
export const GRAFICI_ANDAMENTO: { value: TipoGraficoAndamento; label: string }[] = [
  { value: 'linee', label: 'Linee' },
  { value: 'barre', label: 'Barre impilate' },
  { value: 'aree', label: 'Aree cumulate' },
  { value: 'ciambella', label: 'Ciambella delle quote' },
];

/** Colore delle etichette del costo (Possesso, Totale…): distinte dalle note grigie */
export const COLORE_ETICHETTA_COSTO = 'text-cyan-700 [.dark_&]:text-cyan-400';
