// src/features/vigilo/utils/preferenzeAvvisi.ts
//
// Le preferenze degli avvisi nel modulo della pagina "I miei avvisi" (B8d-1):
// la bozza che l'utente modifica, la sua traduzione verso il servizio e le
// frasi che spiegano quando partono le email, scritte con le regole vere del
// tenant ("alle 08:00, dal lunedì al venerdì").
import { TIPI_SOGGETTO, type TipoSoggetto } from '../types/valori';
import type { FrequenzaAvvisi, PreferenzeAvvisi, RegoleEmailTenant } from '../types/avvisi';

/** Ciò che l'utente modifica: i tipi sono quelli spuntati (tutti spuntati = nessun filtro per tipo) */
export interface BozzaPreferenze {
  frequenza: FrequenzaAvvisi;
  urgentiSubito: boolean;
  modo: 'tutto' | 'alcuni';
  tipi: TipoSoggetto[];
  sedi: string[];
}

export const bozzaDa = (p: PreferenzeAvvisi): BozzaPreferenze => ({
  frequenza: p.frequenza,
  urgentiSubito: p.urgentiSubito,
  modo: p.filtri.tipi.length || p.filtri.sedi.length ? 'alcuni' : 'tutto',
  tipi: p.filtri.tipi.length ? [...p.filtri.tipi] : [...TIPI_SOGGETTO],
  sedi: [...p.filtri.sedi],
});

export const daBozza = (b: BozzaPreferenze): PreferenzeAvvisi => {
  const tutti = b.tipi.length === TIPI_SOGGETTO.length;
  return {
    frequenza: b.frequenza,
    urgentiSubito: b.urgentiSubito,
    filtri:
      b.modo === 'tutto'
        ? { tipi: [], sedi: [] }
        : { tipi: tutti ? [] : TIPI_SOGGETTO.filter(t => b.tipi.includes(t)), sedi: [...new Set(b.sedi)].sort() },
  };
};

/** Stesse preferenze? (le sedi si confrontano senza badare all'ordine) */
export const ugualiPreferenze = (a: PreferenzeAvvisi, b: PreferenzeAvvisi): boolean =>
  a.frequenza === b.frequenza &&
  a.urgentiSubito === b.urgentiSubito &&
  a.filtri.tipi.join() === b.filtri.tipi.join() &&
  [...a.filtri.sedi].sort().join() === [...b.filtri.sedi].sort().join();

/** Che cosa impedisce di salvare la bozza, o null */
export function erroreBozza(b: BozzaPreferenze, limiteSedi: number): string | null {
  if (b.modo === 'alcuni' && !b.tipi.length) return 'Scegli almeno un tipo di soggetto';
  if (b.sedi.length > limiteSedi) return `Si possono scegliere al massimo ${limiteSedi} sedi`;
  return null;
}

// --- frasi ---

const GIORNI = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];

/** "a, b e c" */
const elenco = (v: string[]): string => (v.length < 2 ? (v[0] ?? '') : `${v.slice(0, -1).join(', ')} e ${v[v.length - 1]}`);

/** "dal lunedì al venerdì", "tutti i giorni", "il lunedì e il giovedì" (1 = lunedì ... 7 = domenica) */
export function fraseGiorni(giorni: number[]): string {
  const g = [...new Set(giorni)].filter(x => x >= 1 && x <= 7).sort((a, b) => a - b);
  if (g.length === 7) return 'tutti i giorni';
  const consecutivi = g.length >= 3 && g.every((x, i) => i === 0 || x === g[i - 1] + 1);
  if (consecutivi) return `dal ${GIORNI[g[0] - 1]} al ${GIORNI[g[g.length - 1] - 1]}`;
  return elenco(g.map(x => `il ${GIORNI[x - 1]}`));
}

/** "Di notte, dalle 22:00 alle 07:00, le email aspettano la mattina." — vuoto se il tenant non ha silenzio */
export const fraseSilenzio = (r: RegoleEmailTenant): string =>
  r.silenzio.dalle === r.silenzio.alle ? '' : `Dalle ${r.silenzio.dalle} alle ${r.silenzio.alle} non parte nessuna email: aspettano la fine del silenzio.`;

/** Che cosa succede con ciascuna frequenza, con le regole del tenant */
export function fraseFrequenza(f: FrequenzaAvvisi, r: RegoleEmailTenant): string {
  const primo = GIORNI[(Math.min(...r.giorniLavorativi) || 1) - 1];
  switch (f) {
    case 'riepilogo-giornaliero':
      return `Un'email con gli avvisi del giorno, alle ${r.orarioRiepilogo}, ${fraseGiorni(r.giorniLavorativi)}. Solo se c'è qualcosa.`;
    case 'riepilogo-settimanale':
      return `Un'email a settimana con gli avvisi dei sette giorni, il ${primo} alle ${r.orarioRiepilogo}.`;
    case 'subito':
      return `Un'email per ogni avviso, appena nasce. ${fraseSilenzio(r)}`.trim();
    default:
      return 'Nessuna email: gli avvisi li trovi nella campanella e in questa pagina.';
  }
}
