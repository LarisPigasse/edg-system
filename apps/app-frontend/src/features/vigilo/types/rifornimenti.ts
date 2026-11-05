// src/features/vigilo/types/rifornimenti.ts — rifornimenti e spese d'uso dei mezzi (vigilo-service, /rifornimenti, tappa 2)
import type { TipoSoggetto } from './valori';

/** Le voci di spesa d'uso (come il servizio): carburante e AdBlue con i litri */
export type VoceRifornimento = 'carburante' | 'adblue' | 'pedaggi' | 'altro';

export interface Rifornimento {
  uuid: string;
  soggetto: { uuid: string; nome: string; identificativo: string | null; tipo: TipoSoggetto } | null;
  fattoIl: string;
  voce: VoceRifornimento;
  nomeVoce: string;
  litri: number | null;
  /** Solo a chi ha vigilo.costi o a chi l'ha scritto */
  importo?: number;
  prezzoAlLitro?: number | null;
  fornitore: { uuid: string; nome: string } | null;
  riferimento: string | null;
  note: string | null;
  /** Km o ore letti al rifornimento: una lettura del contatore principale */
  lettura: { valore: number; unita: 'km' | 'ore'; anomala: boolean } | null;
  /** L'ha scritto chi guarda */
  mio: boolean;
  /** Chi guarda può correggerlo ed eliminarlo */
  modificabile: boolean;
  creatoIl: string;
}

/** Il corpo di POST e PATCH */
export interface DatiRifornimento {
  soggetto?: string;
  fattoIl: string;
  voce: VoceRifornimento;
  litri: number | null;
  /** Obbligatorio nel nuovo; in correzione si omette se chi corregge non lo vede */
  importo?: number;
  lettura: number | null;
  /** Solo con vigilo.write */
  fornitore?: string | null;
  riferimento: string | null;
  note: string | null;
}
