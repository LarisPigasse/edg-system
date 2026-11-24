// src/features/vigilo/utils/moduloControllo.ts
//
// Il modulo di modifica di un controllo (2026-11-19, passo 2a): lo stato dal
// controllo, le differenze da mandare al servizio (solo i campi cambiati) e
// gli errori per campo; la cadenza con le sue regole (utils/cadenza.ts, passo
// 2b). Regole pure.
import type { Cadenza } from '../types/cadenza';
import type { Controllo } from '../types/configurazione';
import type { DatoRegistrazione, Richiesta } from '../types/scadenze';
import type { Natura, Predefiniti, Rinnovo, TipoSoggetto } from '../types/valori';
import { erroriCadenza, normalizzata } from './cadenza';
import { intero } from './numeri';

export const DATI_REGISTRAZIONE: { chiave: DatoRegistrazione; nome: string }[] = [
  { chiave: 'importo', nome: 'Importo' },
  { chiave: 'fornitore', nome: 'Fornitore' },
  { chiave: 'riferimento', nome: 'Riferimento (fattura, verbale…)' },
  { chiave: 'lettura', nome: 'Lettura del contatore' },
  { chiave: 'allegato', nome: 'Documento' },
  { chiave: 'manodopera', nome: 'Manodopera interna' },
];

/** "natura" = il dato segue la regola della natura del controllo (assente nell'oggetto) */
export type SceltaRegistrazione = Richiesta | 'natura';

export interface ModuloControllo {
  nome: string;
  natura: Natura;
  descrizione: string;
  riferimentoNormativo: string;
  /** uuid; vuoto = tutti i soggetti del tipo */
  categorie: string[];
  cadenza: Cadenza;
  preavvisiGiorni: number[];
  preavvisiUso: number[];
  tolleranzaGiorni: string;
  tolleranzaUso: string;
  avvisaAncheSeFermo: boolean;
  registrazione: Record<DatoRegistrazione, SceltaRegistrazione>;
  rinnovo: Rinnovo;
  rinviabile: boolean;
  automatico: boolean;
  ordine: string;
}

export const LIMITI_CONTROLLO = { nome: 128, descrizione: 1024, riferimento: 256, giorni: 1024, uso: 1 << 24, ordine: 1024 } as const;

/** Il modulo dal controllo com'è (pura) */
export function moduloDa(c: Controllo): ModuloControllo {
  return {
    nome: c.nome,
    natura: c.natura,
    descrizione: c.descrizione ?? '',
    riferimentoNormativo: c.riferimentoNormativo ?? '',
    categorie: c.categorie.map(k => k.uuid),
    cadenza: normalizzata(c.cadenza),
    preavvisiGiorni: c.preavvisi.giorni,
    preavvisiUso: c.preavvisi.uso,
    tolleranzaGiorni: String(c.tolleranza.giorni),
    tolleranzaUso: String(c.tolleranza.uso),
    avvisaAncheSeFermo: !!c.avvisaAncheSeFermo,
    registrazione: Object.fromEntries(DATI_REGISTRAZIONE.map(d => [d.chiave, c.registrazione?.[d.chiave] ?? 'natura'])) as Record<DatoRegistrazione, SceltaRegistrazione>,
    rinnovo: c.rinnovo,
    rinviabile: c.rinviabile,
    automatico: c.automatico,
    ordine: String(c.ordine),
  };
}

export type CampoControllo = 'nome' | 'tolleranzaGiorni' | 'tolleranzaUso' | 'ordine' | 'descrizione' | 'riferimentoNormativo' | 'cadenza';

/** Gli errori per campo (pura) */
export function erroriModulo(m: ModuloControllo, conUso: boolean): Partial<Record<CampoControllo, string>> {
  const e: Partial<Record<CampoControllo, string>> = {};
  if (!m.nome.trim()) e.nome = 'Obbligatorio';
  else if (m.nome.trim().length > LIMITI_CONTROLLO.nome) e.nome = `Al massimo ${LIMITI_CONTROLLO.nome} caratteri`;
  if (m.descrizione.length > LIMITI_CONTROLLO.descrizione) e.descrizione = `Al massimo ${LIMITI_CONTROLLO.descrizione} caratteri`;
  if (m.riferimentoNormativo.length > LIMITI_CONTROLLO.riferimento) e.riferimentoNormativo = `Al massimo ${LIMITI_CONTROLLO.riferimento} caratteri`;
  const fra = (testo: string, max: number) => {
    const n = intero(testo);
    return n === null || Number.isNaN(n) || n > max ? `Da 0 a ${max.toLocaleString('it-IT')}` : undefined;
  };
  const tg = fra(m.tolleranzaGiorni, LIMITI_CONTROLLO.giorni);
  if (tg) e.tolleranzaGiorni = tg;
  if (conUso) {
    const tu = fra(m.tolleranzaUso, LIMITI_CONTROLLO.uso);
    if (tu) e.tolleranzaUso = tu;
  }
  const o = fra(m.ordine, LIMITI_CONTROLLO.ordine);
  if (o) e.ordine = o;
  const ec = erroriCadenza(m.cadenza);
  if (ec.length) e.cadenza = ec.join('. ');
  return e;
}

const stesso = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Solo i campi cambiati, nella forma del servizio (pura); vuoto = niente da salvare */
export function differenze(c: Controllo, m: ModuloControllo): Record<string, unknown> {
  const d: Record<string, unknown> = {};
  const testo = (s: string) => (s.trim() ? s.trim() : null);
  if (m.nome.trim() !== c.nome) d.nome = m.nome.trim();
  if (m.natura !== c.natura) d.natura = m.natura;
  if (testo(m.descrizione) !== (c.descrizione ?? null)) d.descrizione = testo(m.descrizione);
  if (testo(m.riferimentoNormativo) !== (c.riferimentoNormativo ?? null)) d.riferimentoNormativo = testo(m.riferimentoNormativo);
  if (!stesso([...m.categorie].sort(), c.categorie.map(k => k.uuid).sort())) d.categorie = m.categorie;
  if (!stesso(normalizzata(m.cadenza), normalizzata(c.cadenza))) d.cadenza = normalizzata(m.cadenza);
  // senza una cadenza a uso, niente preavvisi né tolleranza a uso
  const aUso = !!m.cadenza.uso;
  const preavvisi = { giorni: m.preavvisiGiorni, uso: aUso ? m.preavvisiUso : [] };
  if (!stesso(preavvisi, c.preavvisi)) d.preavvisi = preavvisi;
  const tolleranza = { giorni: intero(m.tolleranzaGiorni) ?? 0, uso: aUso ? (intero(m.tolleranzaUso) ?? 0) : 0 };
  if (!stesso(tolleranza, c.tolleranza)) d.tolleranza = tolleranza;
  if (m.avvisaAncheSeFermo !== !!c.avvisaAncheSeFermo) d.avvisaAncheSeFermo = m.avvisaAncheSeFermo;
  const registrazione = Object.fromEntries(DATI_REGISTRAZIONE.flatMap(x => (m.registrazione[x.chiave] === 'natura' ? [] : [[x.chiave, m.registrazione[x.chiave]]])));
  const primaRegistrazione = Object.fromEntries(DATI_REGISTRAZIONE.flatMap(x => (c.registrazione?.[x.chiave] ? [[x.chiave, c.registrazione[x.chiave]]] : [])));
  if (!stesso(registrazione, primaRegistrazione)) d.registrazione = registrazione;
  if (m.rinnovo !== c.rinnovo) d.rinnovo = m.rinnovo;
  if (m.rinviabile !== c.rinviabile) d.rinviabile = m.rinviabile;
  if (m.automatico !== c.automatico) d.automatico = m.automatico;
  if ((intero(m.ordine) ?? 0) !== c.ordine) d.ordine = intero(m.ordine) ?? 0;
  return d;
}

/** Cambiamenti che toccano le scadenze: per questi serve l'anteprima (pura) */
export const toccaLeScadenze = (d: Record<string, unknown>): boolean =>
  ['categorie', 'preavvisi', 'tolleranza', 'automatico', 'cadenza'].some(k => k in d);

/** Il punto di partenza di un controllo nuovo: ogni anno dalla data in cui è fatto, i preavvisi dell'azienda, automatico (pura) */
export function moduloNuovo(predefiniti: Predefiniti | null): ModuloControllo {
  return {
    nome: '',
    natura: 'adempimento',
    descrizione: '',
    riferimentoNormativo: '',
    categorie: [],
    cadenza: { tempo: { valore: 1, unita: 'anni' }, uso: null, ancoraggio: 'esecuzione', fineMese: false, prima: null, finestra: null, fasce: null },
    preavvisiGiorni: predefiniti?.preavvisi.giorni ?? [32, 8, 1],
    preavvisiUso: predefiniti?.preavvisi.uso ?? [],
    tolleranzaGiorni: String(predefiniti?.tolleranza.giorni ?? 0),
    tolleranzaUso: String(predefiniti?.tolleranza.uso ?? 0),
    avvisaAncheSeFermo: false,
    registrazione: Object.fromEntries(DATI_REGISTRAZIONE.map(d => [d.chiave, 'natura'])) as Record<DatoRegistrazione, SceltaRegistrazione>,
    rinnovo: 'conferma',
    rinviabile: true,
    automatico: true,
    ordine: '0',
  };
}

/** Una copia di un controllo: tutto uguale, "(copia)" nel nome (pura) */
export const moduloCopia = (c: Controllo): ModuloControllo => ({ ...moduloDa(c), nome: `${c.nome} (copia)`.slice(0, LIMITI_CONTROLLO.nome) });

/** Tutti i campi per creare il controllo, nella forma del servizio (pura) */
export function datiCreazione(m: ModuloControllo, tipoSoggetto: TipoSoggetto): Record<string, unknown> {
  const aUso = !!m.cadenza.uso;
  const testo = (s: string) => (s.trim() ? s.trim() : null);
  return {
    nome: m.nome.trim(),
    natura: m.natura,
    tipoSoggetto,
    descrizione: testo(m.descrizione),
    riferimentoNormativo: testo(m.riferimentoNormativo),
    categorie: m.categorie,
    cadenza: normalizzata(m.cadenza),
    preavvisi: { giorni: m.preavvisiGiorni, uso: aUso ? m.preavvisiUso : [] },
    tolleranza: { giorni: intero(m.tolleranzaGiorni) ?? 0, uso: aUso ? (intero(m.tolleranzaUso) ?? 0) : 0 },
    avvisaAncheSeFermo: m.avvisaAncheSeFermo,
    registrazione: Object.fromEntries(DATI_REGISTRAZIONE.flatMap(x => (m.registrazione[x.chiave] === 'natura' ? [] : [[x.chiave, m.registrazione[x.chiave]]]))),
    rinnovo: m.rinnovo,
    rinviabile: m.rinviabile,
    automatico: m.automatico,
    ordine: intero(m.ordine) ?? 0,
  };
}
