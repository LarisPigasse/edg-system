// src/features/vigilo/utils/formPossesso.ts
//
// Il costo di possesso nel modulo del mezzo: i valori come testo nei campi,
// i dati da mandare al servizio e il confronto con ciò che è salvato. Le
// regole (limiti, quota, avviso) sono del servizio: qui solo la forma. Pure.
import type { DatiPossesso, ModoPossesso, Possesso } from '../types/costoMezzi';
import { importo, intero } from './numeri';

/** 'nessuno' = costo di possesso non indicato */
export type SceltaPossesso = ModoPossesso | 'nessuno';

export interface ValoriPossesso {
  modo: SceltaPossesso;
  prezzo: string;
  anni: string;
  valoreFinale: string;
  canone: string;
  /** 'AAAA-MM-GG' o '' */
  dal: string;
}

const testo = (n: number | undefined): string => (n == null ? '' : n.toLocaleString('it-IT', { maximumFractionDigits: 2 }));

/** I campi dal possesso salvato */
export const valoriPossesso = (p: Possesso | null | undefined): ValoriPossesso => ({
  modo: p?.modo ?? 'nessuno',
  prezzo: testo(p?.prezzo),
  anni: p?.anni ? String(p.anni) : '',
  valoreFinale: p?.modo === 'acquisto' ? testo(p.valoreFinale ?? 0) : '',
  canone: testo(p?.canone),
  dal: p?.dal ?? '',
});

/**
 * I dati da mandare: null = non indicato; undefined = i campi non sono
 * ancora numeri (es. "12a"), il servizio non va interpellato.
 */
export function datiPossesso(v: ValoriPossesso): DatiPossesso | null | undefined {
  if (v.modo === 'nessuno') return null;
  const dal = v.dal || null;
  if (v.modo === 'acquisto') {
    const prezzo = importo(v.prezzo);
    const anni = intero(v.anni);
    const valoreFinale = importo(v.valoreFinale);
    if ([prezzo, anni, valoreFinale].some(n => Number.isNaN(n))) return undefined;
    return { modo: v.modo, prezzo: prezzo ?? undefined, anni: anni ?? undefined, valoreFinale: valoreFinale ?? 0, dal };
  }
  const canone = importo(v.canone);
  if (Number.isNaN(canone)) return undefined;
  return { modo: v.modo, canone: canone ?? undefined, dal };
}

/** I dati sono diversi da quelli salvati? */
export function possessoCambiato(salvato: Possesso | null | undefined, dati: DatiPossesso | null): boolean {
  if (!salvato || !dati) return (salvato ?? null) !== dati;
  const campi: (keyof DatiPossesso)[] = ['modo', 'prezzo', 'anni', 'valoreFinale', 'canone'];
  return campi.some(k => (salvato[k] ?? null) !== (dati[k] ?? null)) || (salvato.dal ?? null) !== (dati.dal ?? null);
}
