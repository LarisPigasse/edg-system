// src/features/vigilo/utils/costoMezzi.ts
//
// Il costo dei mezzi in parole e cifre (stima): costo per km, ora o
// mese, il confronto con la categoria ("+40% rispetto alla media di
// Autocarri, soprattutto manutenzione e guasti"), il gruppo con cui si confronta,
// i litri di carburante e il consumo. Pure.
import { BLOCCHI_IN_PAROLE } from '../constants/costoMezzi';
import { TIPI } from '../constants/tipiSoggetto';
import type { ConfrontoCosto, CostoMezzo } from '../types/costoMezzi';
import { consumo, costoUnita, euroBrevi, litri, variazioneTesto } from './resoconti';

/** "0,184 €/km" · "12,500 €/h" · "640 €/mese" */
export function costoPerUnitaTesto(c: Pick<CostoMezzo, 'base' | 'costoPerUnita'>): string | null {
  if (c.costoPerUnita == null) return null;
  return c.base === 'mese' ? `${euroBrevi(c.costoPerUnita)}/mese` : costoUnita(c.costoPerUnita, c.base);
}

/** Con chi si confronta: la categoria, o il tipo se non ce l'ha ("Autocarri oltre 3,5 t", "Veicoli") */
export const gruppoDi = (c: Pick<CostoMezzo, 'categoria' | 'tipo'>): string => c.categoria?.nome ?? TIPI[c.tipo].plurale;

/** Lo scostamento più significativo fra totale e manutenzione */
const principale = (c: CostoMezzo): { quale: 'totale' | 'manutenzione'; x: ConfrontoCosto } | null => {
  const { totale, manutenzione } = c.confronto;
  if (totale && (!manutenzione || totale.scostamento >= manutenzione.scostamento || !c.confronto.segnalato)) return { quale: 'totale', x: totale };
  return manutenzione ? { quale: 'manutenzione', x: manutenzione } : null;
};

/**
 * Il confronto in parole:
 *   "+40% rispetto alla media di Autocarri oltre 3,5 t, soprattutto manutenzione e guasti"
 *   "in linea con la media di Furgoni"  ·  "pochi mezzi simili per un confronto"
 */
export function confrontoTesto(c: CostoMezzo, soglia: number, conGruppo = true): string {
  const p = principale(c);
  if (!p) return 'pochi mezzi simili per un confronto';
  // nelle tabelle il gruppo è già scritto sotto il nome del mezzo
  const media = `la media ${conGruppo ? `di ${gruppoDi(c)}` : c.categoria ? 'della categoria' : 'del tipo'}`;
  const cosa = p.quale === 'manutenzione' ? ' per manutenzione e guasti' : '';
  if (Math.abs(p.x.scostamento) <= soglia && !c.confronto.segnalato) return `in linea con ${media}${cosa}`;
  const motivo = c.confronto.segnalato && c.confronto.soprattutto ? `, soprattutto ${BLOCCHI_IN_PAROLE[c.confronto.soprattutto]}` : '';
  return `${variazioneTesto(p.x.scostamento)} rispetto al${media}${cosa}${motivo}`;
}

/** "410 l di carburante · 8,4 l/100 km" · "nessun rifornimento" (il consumo solo se l'uso basta) */
export function rifornimentiTesto(c: Pick<CostoMezzo, 'rifornimenti' | 'base'>, breve = false): string {
  const r = c.rifornimenti;
  if (!r.totale && !r.litri) return 'nessun rifornimento';
  if (!r.litri) return 'senza carburante';
  // breve, nelle schede: "41.381 l · 35,8 l/100 km"
  const quanto = breve ? litri(r.litri) : `${litri(r.litri)} di carburante`;
  return r.consumo != null && c.base !== 'mese' ? `${quanto} · ${consumo(r.consumo, c.base)}` : quanto;
}

/** "3 guasti" · "nessun guasto" */
export const guastiTesto = (n: number): string => (n ? `${n} ${n === 1 ? 'guasto' : 'guasti'}` : 'nessun guasto');
