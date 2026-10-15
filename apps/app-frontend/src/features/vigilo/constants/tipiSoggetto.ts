// src/features/vigilo/constants/tipiSoggetto.ts
//
// Come si chiamano e con che icona si mostrano i tipi di soggetto: un solo
// punto per tutte le pagine di Vigilo.
import { Briefcase, Building2, Factory, Truck, Users, Wrench, type LucideIcon } from '@edg/ui';

import type { TipoSoggetto } from '../types/valori';

interface DescrizioneTipo {
  /** "Veicoli" */
  plurale: string;
  /** "veicolo" */
  singolare: string;
  /** "il primo veicolo" */
  primo: string;
  /** Come si chiama l'identificativo: "Targa" (lo stesso del servizio) */
  identificativo: string;
  /** Il nome è femminile: "la sede è archiviata" */
  femminile: boolean;
  icona: LucideIcon;
}

export const TIPI: Record<TipoSoggetto, DescrizioneTipo> = {
  veicolo: { plurale: 'Veicoli', singolare: 'veicolo', primo: 'il primo veicolo', identificativo: 'Targa', femminile: false, icona: Truck },
  macchina: { plurale: 'Macchine', singolare: 'macchina', primo: 'la prima macchina', identificativo: 'Matricola', femminile: true, icona: Factory },
  attrezzatura: { plurale: 'Attrezzature', singolare: 'attrezzatura', primo: 'la prima attrezzatura', identificativo: 'Matricola', femminile: true, icona: Wrench },
  sede: { plurale: 'Sedi', singolare: 'sede', primo: 'la prima sede', identificativo: 'Codice', femminile: true, icona: Building2 },
  persona: { plurale: 'Persone', singolare: 'persona', primo: 'la prima persona', identificativo: 'Codice fiscale', femminile: true, icona: Users },
  azienda: { plurale: 'Azienda', singolare: 'azienda', primo: "i dati dell'azienda", identificativo: 'Partita IVA', femminile: true, icona: Briefcase },
};
