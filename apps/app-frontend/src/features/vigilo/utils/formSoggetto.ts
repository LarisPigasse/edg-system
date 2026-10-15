// src/features/vigilo/utils/formSoggetto.ts
//
// Il modulo di un soggetto come valori da campo (tutto testo, i sì/no come
// booleani) e la conversione nel corpo della richiesta: i vuoti diventano
// null (il servizio non accetta '' per date ed elenchi), i numeri dei campi
// aggiuntivi si leggono con la virgola. Funzioni pure.
import { DATI_TIPO } from '../constants/datiTipo';
import type { CampoAggiuntivo, Categoria } from '../types/configurazione';
import type { DatiSoggetto, Soggetto } from '../types/soggetti';
import type { TipoSoggetto } from '../types/valori';

export type ValoreCampo = string | boolean;

export interface ValoriSoggetto {
  categoria: string | null;
  nome: string;
  identificativo: string;
  codice: string;
  sede: string | null;
  referente: string | null;
  note: string;
  dati: Record<string, string>;
  campi: Record<string, ValoreCampo>;
}

/** I campi aggiuntivi della categoria scelta, in ordine */
export const campiDi = (categorie: Categoria[], categoria: string | null): CampoAggiuntivo[] =>
  [...(categorie.find(c => c.uuid === categoria)?.campi ?? [])].sort((a, b) => a.ordine - b.ordine);

const comeTesto = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

/** I valori di partenza: vuoti per un nuovo soggetto, quelli che ha per la modifica */
export function valoriIniziali(s?: Soggetto, categoria: string | null = null): ValoriSoggetto {
  return {
    categoria: s ? (s.categoria?.uuid ?? null) : categoria,
    nome: s?.nome ?? '',
    identificativo: s?.identificativo ?? '',
    codice: s?.codice ?? '',
    sede: s?.sede?.uuid ?? null,
    referente: s?.referente?.uuid ?? null,
    note: s?.note ?? '',
    dati: Object.fromEntries(Object.entries(s?.dati ?? {}).map(([k, v]) => [k, comeTesto(v)])),
    campi: Object.fromEntries(Object.entries(s?.campi ?? {}).map(([k, v]) => [k, typeof v === 'boolean' ? v : comeTesto(v)])),
  };
}

const vuotoNull = (t: string) => (t.trim() ? t.trim() : null);

function valoreCampo(c: CampoAggiuntivo, v: ValoreCampo | undefined): unknown {
  if (c.tipo === 'si-no') return v === true; // mai toccato = no
  const t = typeof v === 'string' ? v.trim() : '';
  if (!t) return null;
  if (c.tipo === 'numero') {
    const n = Number(t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t);
    return Number.isFinite(n) ? n : t; // un valore sbagliato lo segnala il servizio
  }
  return t;
}

/** Il corpo della richiesta; `campi` sono quelli della categoria scelta */
export function corpoSoggetto(v: ValoriSoggetto, tipo: TipoSoggetto, campi: CampoAggiuntivo[]): Omit<DatiSoggetto, 'tipo'> {
  return {
    categoria: v.categoria,
    nome: v.nome.trim(),
    identificativo: vuotoNull(v.identificativo),
    codice: vuotoNull(v.codice),
    sede: tipo === 'sede' || tipo === 'azienda' ? null : v.sede,
    referente: tipo === 'azienda' ? null : v.referente,
    note: vuotoNull(v.note),
    dati: Object.fromEntries(DATI_TIPO[tipo].map(d => [d.chiave, vuotoNull(v.dati[d.chiave] ?? '')])),
    campi: Object.fromEntries(campi.map(c => [c.chiave, valoreCampo(c, v.campi[c.chiave])])),
  };
}

/** Che cosa manca per poter salvare (nome e campi obbligatori della categoria) */
export function mancanti(v: ValoriSoggetto, campi: CampoAggiuntivo[]): string[] {
  return [
    ...(v.nome.trim() ? [] : ['Nome']),
    ...campi
      .filter(c => c.obbligatorio && c.tipo !== 'si-no')
      .filter(c => !String(v.campi[c.chiave] ?? '').trim())
      .map(c => c.etichetta),
  ];
}
