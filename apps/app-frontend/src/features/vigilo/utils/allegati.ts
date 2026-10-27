// src/features/vigilo/utils/allegati.ts — documenti (B9a)
import type { AppartenenzaAllegato, VoceAllegato } from '../types/allegati';
import { aGiorno, giornoBreve } from './giorni';

/** "820 KB", "1,4 MB" */
export function dimensioneLeggibile(byte: number): string {
  if (byte < 1024) return `${byte} byte`;
  if (byte < 1024 * 1024) return `${Math.round(byte / 1024).toLocaleString('it-IT')} KB`;
  return `${(byte / (1024 * 1024)).toLocaleString('it-IT', { maximumFractionDigits: 1 })} MB`;
}

export const eImmagine = (tipo: string): boolean => tipo.startsWith('image/');

/** "14 ott 2026 · Mario Rossi · 1,4 MB" */
export function dettaglioAllegato(a: VoceAllegato): string {
  return [giornoBreve(aGiorno(new Date(a.caricatoIl))), a.caricatoDa, dimensioneLeggibile(a.dimensione)].filter(Boolean).join(' · ');
}

/** Il titolo di un gruppo; dentro una scadenza il titolo della scadenza non si ripete */
export function titoloAppartenenza(di: AppartenenzaAllegato, dentroScadenza = false): string {
  const quando = di.eseguitaIl ? giornoBreve(di.eseguitaIl) : '?';
  if (di.entita === 'soggetto') return 'Del soggetto';
  if (di.entita === 'scadenza') return dentroScadenza ? 'Della scadenza' : (di.titolo ?? 'Scadenza');
  return dentroScadenza ? `Registrazione del ${quando}` : `${di.titolo ?? 'Scadenza'} · registrazione del ${quando}`;
}

export interface GruppoAllegati {
  chiave: string;
  titolo: string;
  voci: VoceAllegato[];
}

/** Per appartenenza: prima quelli del soggetto o della scadenza, poi gli altri dal più recente */
export function gruppiAllegati(voci: VoceAllegato[], dentroScadenza = false): GruppoAllegati[] {
  const mappa = new Map<string, GruppoAllegati>();
  for (const v of voci) {
    const chiave = `${v.di.entita}:${v.di.uuid}`;
    if (!mappa.has(chiave)) mappa.set(chiave, { chiave, titolo: titoloAppartenenza(v.di, dentroScadenza), voci: [] });
    mappa.get(chiave)!.voci.push(v);
  }
  const primo = (g: GruppoAllegati) => Number(g.chiave.startsWith(dentroScadenza ? 'scadenza:' : 'soggetto:'));
  return [...mappa.values()].sort((a, b) => primo(b) - primo(a));
}
