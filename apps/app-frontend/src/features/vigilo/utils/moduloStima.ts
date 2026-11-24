// src/features/vigilo/utils/moduloStima.ts
//
// Il modulo della stima dei costi di un servizio (2026-11-17, fase 2): i
// campi come si scrivono (testo, all'italiana) e la richiesta di calcolo che
// ne deriva, con gli errori per campo secondo i limiti del servizio. Regole pure.
import type { Limite, ParametriStima, RichiestaCalcolo, TipoServizio } from '../types/stima';
import { costoUnitario, importo, testoNumero } from './numeri';

export interface RigaExtra {
  id: number;
  descrizione: string;
  importo: string;
}

export interface ModuloStima {
  tipo: TipoServizio;
  descrizione: string;
  mezzo: string | null;
  /** Parte variabile: €/km in movimento (a km) o €/h motore (a ore) */
  costoMezzo: string;
  /** Parte fissa: € per ora di impiego */
  costoMezzoOra: string;
  km: string;
  ritornoAVuoto: boolean;
  kmAutostrada: string;
  oreLavoro: string;
  oreAggiuntive: string;
  persona: string | null;
  costoOrario: string;
  pernottamenti: string;
  pedaggi: string;
  extra: RigaExtra[];
}

export const MODULO_VUOTO: ModuloStima = {
  tipo: 'km',
  descrizione: '',
  mezzo: null,
  costoMezzo: '',
  costoMezzoOra: '',
  km: '',
  ritornoAVuoto: false,
  kmAutostrada: '',
  oreLavoro: '',
  oreAggiuntive: '',
  persona: null,
  costoOrario: '',
  pernottamenti: '',
  pedaggi: '',
  extra: [],
};

export type Campo = 'costoMezzo' | 'costoMezzoOra' | 'km' | 'kmAutostrada' | 'oreLavoro' | 'oreAggiuntive' | 'costoOrario' | 'pernottamenti' | 'pedaggi' | `extra-${number}`;

const testoLimite = (l: Limite) => `Da ${testoNumero(l.min)} a ${testoNumero(l.max)}`;

/** La richiesta di calcolo e gli errori per campo; la richiesta è null se manca il dato principale o c'è un errore (pura) */
export function richiestaDa(m: ModuloStima, limiti: ParametriStima['limiti']): { richiesta: RichiestaCalcolo | null; errori: Partial<Record<Campo, string>> } {
  const errori: Partial<Record<Campo, string>> = {};
  const leggi = (campo: Campo, testo: string, l: Limite, intero = false, unitario = false): number | null => {
    const v = unitario ? costoUnitario(testo) : importo(testo);
    if (v === null) return null;
    if (Number.isNaN(v) || v < l.min || v > l.max || (intero && !Number.isInteger(v))) {
      errori[campo] = testoLimite(l);
      return null;
    }
    return v;
  };
  const aKm = m.tipo === 'km';
  const km = aKm ? leggi('km', m.km, limiti.km) : null;
  const kmAutostrada = aKm ? leggi('kmAutostrada', m.kmAutostrada, limiti.km) : null;
  if (aKm && km !== null && kmAutostrada !== null && kmAutostrada > km) errori.kmAutostrada = 'Non più dei km del viaggio';
  const oreLavoro = aKm ? null : leggi('oreLavoro', m.oreLavoro, limiti.ore);
  const oreAggiuntive = leggi('oreAggiuntive', m.oreAggiuntive, limiti.ore);
  const pernottamenti = aKm ? null : leggi('pernottamenti', m.pernottamenti, limiti.pernottamenti, true);
  // al millesimo, come i costi per km o per ora che calcola Vigilo
  const costoMezzo = leggi('costoMezzo', m.costoMezzo, limiti.costoMezzo, false, true);
  const costoMezzoOra = leggi('costoMezzoOra', m.costoMezzoOra, limiti.costoMezzo);
  const costoOrario = leggi('costoOrario', m.costoOrario, limiti.costoOrarioConducente);
  const pedaggi = leggi('pedaggi', m.pedaggi, limiti.importo);
  const extra = m.extra.flatMap(e => {
    const v = leggi(`extra-${e.id}`, e.importo, limiti.importo);
    return v === null ? [] : [{ descrizione: e.descrizione.trim(), importo: v }];
  });

  // il dato principale: i km o le ore di lavoro
  const principale = aKm ? km : oreLavoro;
  if (principale === null || principale <= 0 || Object.keys(errori).length) return { richiesta: null, errori };
  return {
    richiesta: {
      tipo: m.tipo,
      mezzo: m.mezzo,
      costoMezzo,
      costoMezzoOra,
      ...(aKm ? { km: km!, ritornoAVuoto: m.ritornoAVuoto, kmAutostrada } : { oreLavoro: oreLavoro!, pernottamenti: pernottamenti ?? 0 }),
      oreAggiuntive: oreAggiuntive ?? 0,
      persona: m.persona,
      costoOrario,
      pedaggi,
      extra,
    },
    errori,
  };
}

const testo = (n: number | null | undefined) => (n == null ? '' : testoNumero(n, 3));

/** Il modulo da una stima salvata: per duplicarla come nuova (pura) */
export function moduloDa(dati: RichiestaCalcolo, descrizione: string): ModuloStima {
  return {
    ...MODULO_VUOTO,
    tipo: dati.tipo,
    descrizione,
    mezzo: dati.mezzo ?? null,
    costoMezzo: testo(dati.costoMezzo),
    costoMezzoOra: testo(dati.costoMezzoOra),
    km: testo(dati.km),
    ritornoAVuoto: !!dati.ritornoAVuoto,
    kmAutostrada: testo(dati.kmAutostrada),
    oreLavoro: testo(dati.oreLavoro),
    oreAggiuntive: testo(dati.oreAggiuntive),
    persona: dati.persona ?? null,
    costoOrario: testo(dati.costoOrario),
    pernottamenti: testo(dati.pernottamenti),
    pedaggi: testo(dati.pedaggi),
    extra: (dati.extra ?? []).map((e, i) => ({ id: i + 1, descrizione: e.descrizione, importo: testo(e.importo) })),
  };
}

/** I costi che Vigilo propone per il servizio: quello del mezzo e il costo orario */
export interface ProposteStima {
  /** null = nessun mezzo scelto; valore = parte variabile, fissoOra = parte fissa per ora di impiego */
  costoMezzo: { valore: number | null; fissoOra: number | null; base: string | null; nome: string } | null;
  costoOrario: { valore: number | null; fonte: 'persona' | 'media'; nome?: string } | null;
}

/**
 * La richiesta con i costi lasciati come proposti messi a null: il servizio li
 * riprende da Vigilo e la stima li registra come "dal mezzo" o "dalla persona",
 * non come scritti a mano (pura)
 */
export function conProposte(r: RichiestaCalcolo, p: ProposteStima): RichiestaCalcolo {
  return {
    ...r,
    costoMezzo: r.costoMezzo != null && r.costoMezzo === p.costoMezzo?.valore ? null : r.costoMezzo,
    costoMezzoOra: r.costoMezzoOra != null && r.costoMezzoOra === p.costoMezzo?.fissoOra ? null : r.costoMezzoOra,
    costoOrario: r.costoOrario != null && r.costoOrario === p.costoOrario?.valore ? null : r.costoOrario,
  };
}
