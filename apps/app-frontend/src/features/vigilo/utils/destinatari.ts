// src/features/vigilo/utils/destinatari.ts
//
// I destinatari degli avvisi nell'interfaccia (B8d-3): ordine stabile, frase
// che li riassume, confronto e i controlli che si possono fare subito (il
// numero massimo lo controlla il servizio, una sola fonte).
import { ORDINE_RUOLI, RUOLI_DESTINATARI } from '../constants/destinatari';
import type { Destinatario, TipoDestinatario } from '../types/destinatari';

/** Abbastanza per scoprire un errore di battitura; il servizio controlla il resto */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const emailValida = (e: string): boolean => EMAIL.test(e.trim());

const pulita = (e: string) => e.trim().toLowerCase();

/** Ruoli nell'ordine stabilito, poi gli indirizzi nell'ordine in cui sono stati aggiunti */
export const ordinati = (lista: Destinatario[]): Destinatario[] => [
  ...ORDINE_RUOLI.filter(r => lista.some(d => d.tipo === r)).map(tipo => ({ tipo })),
  ...lista.filter((d): d is { tipo: 'email'; email: string } => d.tipo === 'email').map(d => ({ tipo: 'email' as const, email: pulita(d.email) })),
];

export const haRuolo = (lista: Destinatario[], r: TipoDestinatario): boolean => lista.some(d => d.tipo === r);
export const indirizzi = (lista: Destinatario[]): string[] => lista.flatMap(d => (d.tipo === 'email' ? [d.email] : []));

/** "a, b e c" */
const elenco = (v: string[]): string => (v.length < 2 ? (v[0] ?? '') : `${v.slice(0, -1).join(', ')} e ${v[v.length - 1]}`);

/** "ufficio, referente e consulente@studio.it" */
export const fraseDestinatari = (lista: Destinatario[]): string =>
  elenco(ordinati(lista).map(d => (d.tipo === 'email' ? d.email : RUOLI_DESTINATARI[d.tipo].etichetta.toLowerCase()))) || 'nessuno';

export const stessiDestinatari = (a: Destinatario[], b: Destinatario[]): boolean => JSON.stringify(ordinati(a)) === JSON.stringify(ordinati(b));

/** Che cosa impedisce di salvare, o null */
export function erroreDestinatari(lista: Destinatario[]): string | null {
  if (!lista.length) return 'Scegli almeno un destinatario';
  const chiavi = lista.map(d => (d.tipo === 'email' ? `email:${pulita(d.email)}` : d.tipo));
  if (new Set(chiavi).size !== chiavi.length) return 'Lo stesso destinatario compare due volte';
  return null;
}
