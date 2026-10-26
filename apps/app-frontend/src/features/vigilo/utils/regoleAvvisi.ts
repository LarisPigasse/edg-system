// src/features/vigilo/utils/regoleAvvisi.ts
//
// Le regole degli avvisi del tenant nel pannello di Configurazione (B8d-2):
// orari come 'HH:MM' ↔ TimeValue dei selettori, la durata del silenzio, gli
// stessi controlli del servizio (con i limiti che il servizio manda) e la
// frase che riassume le regole.
import type { TimeValue } from '@edg/ui';

import type { LimitiRegoleAvvisi, RegoleAvvisi } from '../types/impostazioni';
import { fraseGiorni } from './preferenzeAvvisi';

const due = (n: number) => String(n).padStart(2, '0');

/** Minuti dalla mezzanotte di un 'HH:MM' (0 se non valido) */
export const minutiDi = (orario: string): number => {
  const [h, m] = orario.split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : 0;
};

export const daOrario = (orario: string): TimeValue => ({ hours: Math.floor(minutiDi(orario) / 60), minutes: minutiDi(orario) % 60 });
export const aOrario = (t: TimeValue): string => `${due(t.hours)}:${due(t.minutes)}`;

/** Silenzio tolto: dalle = alle */
export const SILENZIO_SPENTO = { dalle: '00:00', alle: '00:00' } as const;
export const conSilenzio = (r: RegoleAvvisi): boolean => r.silenzio.dalle !== r.silenzio.alle;

/** Durata del silenzio in minuti, anche a cavallo della mezzanotte */
export const durataSilenzio = (r: RegoleAvvisi): number => (minutiDi(r.silenzio.alle) - minutiDi(r.silenzio.dalle) + 1440) % 1440;

/** "9 ore", "1 ora e 30 minuti" */
export function fraseDurata(minuti: number): string {
  const h = Math.floor(minuti / 60);
  const m = minuti % 60;
  const ore = h ? `${h} ${h === 1 ? 'ora' : 'ore'}` : '';
  const min = m ? `${m} ${m === 1 ? 'minuto' : 'minuti'}` : '';
  return [ore, min].filter(Boolean).join(' e ') || '0 minuti';
}

export interface ErroriRegole {
  orario?: string;
  giorni?: string;
  silenzio?: string;
}

/** Gli stessi controlli del servizio, campo per campo (vuoto = valide) */
export function erroriRegole(r: RegoleAvvisi, l: LimitiRegoleAvvisi): ErroriRegole {
  const e: ErroriRegole = {};
  const o = minutiDi(r.orarioRiepilogo);
  if (o < minutiDi(l.orarioRiepilogo.min) || o > minutiDi(l.orarioRiepilogo.max))
    e.orario = `Fra le ${l.orarioRiepilogo.min} e le ${l.orarioRiepilogo.max}`;
  if (!r.giorniLavorativi.length) e.giorni = 'Serve almeno un giorno lavorativo';
  if (conSilenzio(r) && durataSilenzio(r) > l.silenzioMassimoMinuti) e.silenzio = `Il silenzio dura al massimo ${fraseDurata(l.silenzioMassimoMinuti)}`;
  return e;
}

export const stesseRegole = (a: RegoleAvvisi, b: RegoleAvvisi): boolean =>
  a.orarioRiepilogo === b.orarioRiepilogo &&
  a.intervalloRichiami === b.intervalloRichiami &&
  [...a.giorniLavorativi].sort().join() === [...b.giorniLavorativi].sort().join() &&
  a.silenzio.dalle === b.silenzio.dalle &&
  a.silenzio.alle === b.silenzio.alle;

/** "ogni 8 giorni", "ogni giorno", "nessuno" */
export const fraseRichiamo = (n: number): string => (n <= 0 ? 'nessuno' : n === 1 ? 'ogni giorno' : `ogni ${n} giorni`);

/** "riepilogo alle 08:00, dal lunedì al venerdì · richiamo delle scadute ogni 8 giorni · niente email dalle 22:00 alle 07:00" */
export const fraseRegole = (r: RegoleAvvisi): string =>
  [
    `riepilogo alle ${r.orarioRiepilogo}, ${fraseGiorni(r.giorniLavorativi)}`,
    r.intervalloRichiami > 0 ? `richiamo delle scadute ${fraseRichiamo(r.intervalloRichiami)}` : 'nessun richiamo delle scadute',
    conSilenzio(r) ? `niente email dalle ${r.silenzio.dalle} alle ${r.silenzio.alle}` : 'email anche di notte',
  ].join(' · ');
