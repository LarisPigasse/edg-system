// src/features/vigilo/utils/moduloCategoria.ts
//
// Il modulo di una categoria (2026-11-19, passo 4): lo stato dalla categoria
// o da zero, la chiave dei campi nuovi ricavata dall'etichetta (quella dei
// campi che ci sono non cambia: i soggetti vi tengono i loro valori), le
// differenze da salvare, i dati per crearla, gli errori e "cosa cambia" per i
// soggetti che ci sono. Regole pure.
import type { CampoAggiuntivo, Categoria } from '../types/configurazione';
import type { TipoSoggetto } from '../types/valori';
import { intero } from './numeri';

export type TipoCampo = CampoAggiuntivo['tipo'];
export type Contatore = 'km' | 'ore';

export interface RigaCampo {
  /** Per React */
  id: number;
  /** null = campo nuovo (la chiave si ricava dall'etichetta) */
  chiave: string | null;
  etichetta: string;
  tipo: TipoCampo;
  /** Per "elenco": le opzioni separate da virgola */
  opzioni: string;
  obbligatorio: boolean;
}

export interface ModuloCategoria {
  nome: string;
  descrizione: string;
  icona: string | null;
  ordine: string;
  contatori: Contatore[];
  campi: RigaCampo[];
}

export const LIMITI_CATEGORIA = { nome: 128, descrizione: 1024, etichetta: 64, campi: 64, opzioni: 64, ordine: 1024 } as const;

export const TIPI_CAMPO: { value: TipoCampo; label: string }[] = [
  { value: 'testo', label: 'Testo' },
  { value: 'numero', label: 'Numero' },
  { value: 'data', label: 'Data' },
  { value: 'elenco', label: 'Elenco' },
  { value: 'si-no', label: 'Sì / no' },
];

export function moduloDa(c: Categoria): ModuloCategoria {
  return {
    nome: c.nome,
    descrizione: c.descrizione ?? '',
    icona: c.icona,
    ordine: String(c.ordine),
    contatori: [...c.contatori],
    campi: [...c.campi]
      .sort((a, b) => a.ordine - b.ordine)
      .map((k, i) => ({ id: i + 1, chiave: k.chiave, etichetta: k.etichetta, tipo: k.tipo, opzioni: (k.opzioni ?? []).join(', '), obbligatorio: !!k.obbligatorio })),
  };
}

export const moduloNuovo = (): ModuloCategoria => ({ nome: '', descrizione: '', icona: null, ordine: '0', contatori: [], campi: [] });

/** La chiave di un campo dall'etichetta: "Portata massima" → "portataMassima", unica fra le usate (pura) */
export function chiaveDa(etichetta: string, usate: ReadonlySet<string>): string {
  const parole = etichetta
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  let base = parole.map((p, i) => (i === 0 ? p.toLowerCase() : p[0].toUpperCase() + p.slice(1).toLowerCase())).join('');
  if (!/^[a-z]/.test(base)) base = `campo${base}`;
  base = base.slice(0, 28);
  let chiave = base;
  for (let n = 2; usate.has(chiave); n++) chiave = `${base}${n}`;
  return chiave;
}

/** I campi nella forma del servizio, con le chiavi dei nuovi (pura) */
export function campiDa(righe: RigaCampo[]): CampoAggiuntivo[] {
  const usate = new Set(righe.filter(r => r.chiave).map(r => r.chiave!));
  return righe.map((r, i) => {
    const chiave = r.chiave ?? chiaveDa(r.etichetta, usate);
    usate.add(chiave);
    const opzioni = r.opzioni.split(',').map(o => o.trim()).filter(Boolean);
    return { chiave, etichetta: r.etichetta.trim(), tipo: r.tipo, ...(r.tipo === 'elenco' ? { opzioni } : {}), obbligatorio: r.obbligatorio, ordine: i };
  });
}

export type CampoCategoria = 'nome' | 'descrizione' | 'ordine' | 'campi';

export function erroriModulo(m: ModuloCategoria): Partial<Record<CampoCategoria, string>> {
  const e: Partial<Record<CampoCategoria, string>> = {};
  if (!m.nome.trim()) e.nome = 'Obbligatorio';
  else if (m.nome.trim().length > LIMITI_CATEGORIA.nome) e.nome = `Al massimo ${LIMITI_CATEGORIA.nome} caratteri`;
  if (m.descrizione.length > LIMITI_CATEGORIA.descrizione) e.descrizione = `Al massimo ${LIMITI_CATEGORIA.descrizione} caratteri`;
  const o = intero(m.ordine);
  if (o === null || Number.isNaN(o) || o > LIMITI_CATEGORIA.ordine) e.ordine = `Da 0 a ${LIMITI_CATEGORIA.ordine}`;
  const problemi: string[] = [];
  if (m.campi.some(c => !c.etichetta.trim())) problemi.push('ogni campo vuole un nome');
  const nomi = m.campi.map(c => c.etichetta.trim().toLowerCase()).filter(Boolean);
  if (new Set(nomi).size !== nomi.length) problemi.push('due campi hanno lo stesso nome');
  if (m.campi.some(c => c.tipo === 'elenco' && !c.opzioni.split(',').some(x => x.trim()))) problemi.push('un elenco vuole almeno un’opzione');
  if (problemi.length) e.campi = problemi.join('; ');
  return e;
}

const stesso = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const testo = (s: string) => (s.trim() ? s.trim() : null);

/** Un campo in forma confrontabile: stesse chiavi, stesso ordine, l'ordine conta solo come posizione */
const normale = (k: CampoAggiuntivo) => [k.chiave, k.etichetta, k.tipo, k.tipo === 'elenco' ? (k.opzioni ?? []) : null, !!k.obbligatorio];

/** Solo i campi cambiati, nella forma del servizio; vuoto = niente da salvare (pura) */
export function differenze(c: Categoria, m: ModuloCategoria): Record<string, unknown> {
  const d: Record<string, unknown> = {};
  if (m.nome.trim() !== c.nome) d.nome = m.nome.trim();
  if (testo(m.descrizione) !== (c.descrizione ?? null)) d.descrizione = testo(m.descrizione);
  if ((m.icona ?? null) !== (c.icona ?? null)) d.icona = m.icona;
  if ((intero(m.ordine) ?? 0) !== c.ordine) d.ordine = intero(m.ordine) ?? 0;
  if (!stesso([...m.contatori].sort(), [...c.contatori].sort())) d.contatori = m.contatori;
  const campi = campiDa(m.campi);
  const prima = [...c.campi].sort((a, b) => a.ordine - b.ordine);
  if (!stesso(campi.map(normale), prima.map(normale))) d.campi = campi;
  return d;
}

/** Tutti i campi per crearla (pura) */
export const datiCreazione = (m: ModuloCategoria, tipoSoggetto: TipoSoggetto): Record<string, unknown> => ({
  tipoSoggetto,
  nome: m.nome.trim(),
  descrizione: testo(m.descrizione),
  icona: m.icona,
  ordine: intero(m.ordine) ?? 0,
  contatori: m.contatori,
  campi: campiDa(m.campi),
});

/** Che cosa succede ai soggetti che ci sono, in parole (pura) */
export function effetti(c: Categoria, m: ModuloCategoria): string[] {
  const n = c.soggetti ?? 0;
  const righe: string[] = [];
  const aggiunti = m.contatori.filter(u => !c.contatori.includes(u));
  const tolti = c.contatori.filter(u => !m.contatori.includes(u));
  const chi = n === 1 ? 'al soggetto che c’è' : `ai ${n} soggetti che ci sono`;
  if (aggiunti.length && n) righe.push(`si aggiunge il contatore ${aggiunti.join(' e ')} ${chi}`);
  if (tolti.length) righe.push(`i soggetti nuovi non avranno il contatore ${tolti.join(' e ')}; quelli che ci sono lo tengono, con le sue letture`);
  const chiaviDopo = new Set(m.campi.map(r => r.chiave).filter(Boolean));
  const campiTolti = c.campi.filter(k => !chiaviDopo.has(k.chiave));
  if (campiTolti.length) righe.push(`${campiTolti.map(k => `"${k.etichetta}"`).join(', ')} non si chiede più: i valori già scritti nei soggetti restano`);
  const nuoviObbligatori = m.campi.filter(r => !r.chiave && r.obbligatorio);
  if (nuoviObbligatori.length && n) righe.push(`i soggetti che ci sono non hanno ancora ${nuoviObbligatori.map(r => `"${r.etichetta.trim()}"`).join(', ')}: si chiederà alla loro prossima modifica`);
  return righe;
}
