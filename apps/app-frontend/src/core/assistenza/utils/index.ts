// src/core/assistenza/utils/index.ts — testi degli accessi dell'assistenza EDG (AA5)
import type { AccessoAssistenza } from '../types';

const GIORNO_ORA = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** "4 nov 2026, 10:05" */
export const quandoAccesso = (iso: string): string => GIORNO_ORA.format(new Date(iso));

/** "12 min", "1 h", "1 h 4 min" (mai meno di 1 minuto) */
export function minutiTesto(minuti: number): string {
  const m = Math.max(1, Math.round(minuti));
  const ore = Math.floor(m / 60);
  const resto = m % 60;
  if (!ore) return `${m} min`;
  return resto ? `${ore} h ${resto} min` : `${ore} h`;
}

/** Quanto è durato (o da quanto è in corso) l'accesso */
export function durataAccesso(a: Pick<AccessoAssistenza, 'stato' | 'inizio' | 'fine'>, adesso: number = Date.now()): string {
  const fine = a.fine ? new Date(a.fine).getTime() : adesso;
  const testo = minutiTesto((fine - new Date(a.inizio).getTime()) / 60_000);
  return a.stato === 'aperta' ? `in corso da ${testo}` : testo;
}

/** "3 accessi · 1 in corso" */
export function conteggioAccessi(accessi: Pick<AccessoAssistenza, 'stato'>[]): string {
  const n = accessi.length;
  const inCorso = accessi.filter(a => a.stato === 'aperta').length;
  return [`${n} ${n === 1 ? 'accesso' : 'accessi'}`, inCorso ? `${inCorso} in corso` : null].filter(Boolean).join(' · ');
}
