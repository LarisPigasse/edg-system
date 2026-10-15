// src/features/vigilo/utils/selezione.ts
//
// Le scelte del passo 2, senza React. Stesse regole del servizio (piano
// dell'avvio, ADR076), così l'utente non incontra mai il suo 422:
//   - una voce già presente non si sceglie (c'è già, non si copia due volte);
//   - un controllo con categorie resta selezionabile solo se almeno una delle
//     sue categorie ci sarà (scelta ora o già del cliente);
//   - togliendo una categoria, i controlli rimasti senza categorie si
//     sospendono; quando una loro categoria torna, tornano anche loro (quelli
//     tolti a mano restano tolti).
import type { ControlloProposto, GruppoTipo, Proposta } from '../types/avvio';
import type { TipoSoggetto } from '../types/valori';

export interface Selezione {
  categorie: ReadonlySet<string>;
  controlli: ReadonlySet<string>;
  /** Scelti, ma tolti in automatico perché senza categorie: tornano con la categoria */
  sospesi: ReadonlySet<string>;
}

/** Le categorie che ci saranno dopo l'avvio */
const disponibili = (p: Proposta, s: Selezione) => new Set([...p.categorieDelCliente, ...s.categorie]);

/** Perché il controllo non si può scegliere ora; null = si può */
export function motivoBlocco(c: ControlloProposto, p: Proposta, s: Selezione): string | null {
  if (!c.categorie.length) return null;
  const ci = disponibili(p, s);
  if (c.categorie.some(k => ci.has(k))) return null;
  const nomi = p.tipi.flatMap(t => t.categorie).filter(k => c.categorie.includes(k.chiave)).map(k => k.nome);
  return `Includi ${nomi.length ? nomi.join(' o ') : 'una delle sue categorie'}`;
}

/** Sospende i controlli rimasti senza categorie e riporta quelli che le hanno ritrovate */
function pota(p: Proposta, s: Selezione): Selezione {
  const controlli = new Set(s.controlli);
  const sospesi = new Set(s.sospesi);
  for (const c of p.tipi.flatMap(t => t.controlli)) {
    const bloccato = !!motivoBlocco(c, p, s);
    if (bloccato && controlli.delete(c.chiave)) sospesi.add(c.chiave);
    if (!bloccato && sospesi.delete(c.chiave)) controlli.add(c.chiave);
  }
  return { categorie: s.categorie, controlli, sospesi };
}

/** All'apertura: le voci preselezionate che il cliente non ha già */
export function selezioneIniziale(p: Proposta): Selezione {
  const categorie = new Set(p.tipi.flatMap(t => t.categorie).filter(c => c.preselezionata && !c.presente).map(c => c.chiave));
  const controlli = new Set(p.tipi.flatMap(t => t.controlli).filter(c => c.preselezionata && !c.presente).map(c => c.chiave));
  return pota(p, { categorie, controlli, sospesi: new Set() });
}

/**
 * Dopo un cambio di settori: le voci che c'erano già tengono la scelta fatta,
 * le nuove partono come consigliate.
 */
export function riportaScelte(prima: Proposta, scelte: Selezione, dopo: Proposta): Selezione {
  const consigliata = selezioneIniziale(dopo);
  const vecchieCat = new Set(prima.tipi.flatMap(t => t.categorie).map(c => c.chiave));
  const vecchiCtrl = new Set(prima.tipi.flatMap(t => t.controlli).map(c => c.chiave));
  const categorie = new Set(
    dopo.tipi.flatMap(t => t.categorie).filter(c => (vecchieCat.has(c.chiave) ? scelte.categorie.has(c.chiave) : consigliata.categorie.has(c.chiave))).map(c => c.chiave)
  );
  const controlli = new Set(
    dopo.tipi.flatMap(t => t.controlli).filter(c => (vecchiCtrl.has(c.chiave) ? scelte.controlli.has(c.chiave) : consigliata.controlli.has(c.chiave))).map(c => c.chiave)
  );
  const sospesi = new Set(
    dopo.tipi.flatMap(t => t.controlli).filter(c => (vecchiCtrl.has(c.chiave) ? scelte.sospesi.has(c.chiave) : consigliata.sospesi.has(c.chiave))).map(c => c.chiave)
  );
  return pota(dopo, { categorie, controlli, sospesi });
}

const commuta = (insieme: ReadonlySet<string>, chiave: string, dentro: boolean) => {
  const nuovo = new Set(insieme);
  if (dentro) nuovo.add(chiave);
  else nuovo.delete(chiave);
  return nuovo;
};

export const scegliCategorie = (p: Proposta, s: Selezione, chiavi: string[], dentro: boolean): Selezione =>
  pota(p, { ...s, categorie: chiavi.reduce((acc, k) => commuta(acc, k, dentro), s.categorie) });

export function scegliControlli(p: Proposta, s: Selezione, chiavi: string[], dentro: boolean): Selezione {
  const ammesse = dentro ? chiavi.filter(k => {
    const c = p.tipi.flatMap(t => t.controlli).find(x => x.chiave === k);
    return c && !c.presente && !motivoBlocco(c, p, s);
  }) : chiavi;
  // Tolto a mano: non torna più da solo
  const sospesi = dentro ? s.sospesi : chiavi.reduce((acc, k) => commuta(acc, k, false), s.sospesi);
  return { ...s, controlli: ammesse.reduce((acc, k) => commuta(acc, k, dentro), s.controlli), sospesi };
}

/** Le voci di un tipo che si possono ancora scegliere (non presenti) */
export const selezionabili = (g: GruppoTipo) => ({
  categorie: g.categorie.filter(c => !c.presente).map(c => c.chiave),
  controlli: g.controlli.filter(c => !c.presente).map(c => c.chiave),
});

export interface ConteggioTipo {
  tipo: TipoSoggetto;
  /** Scelti ora + già presenti */
  inclusi: number;
  totale: number;
  nuoviControlli: number;
  nuoveCategorie: number;
}

export function conteggi(p: Proposta, s: Selezione): ConteggioTipo[] {
  return p.tipi.map(g => ({
    tipo: g.tipo,
    inclusi: g.controlli.filter(c => c.presente || s.controlli.has(c.chiave)).length,
    totale: g.controlli.length,
    nuoviControlli: g.controlli.filter(c => !c.presente && s.controlli.has(c.chiave)).length,
    nuoveCategorie: g.categorie.filter(c => !c.presente && s.categorie.has(c.chiave)).length,
  }));
}
