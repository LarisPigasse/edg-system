// src/features/vigilo/constants/costoMezzi.ts — costo dei mezzi (stima, tappa 1)
import type { TipoSoggetto } from '../types/valori';
import type { BloccoCosto, ModoPossesso } from '../types/costoMezzi';

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
