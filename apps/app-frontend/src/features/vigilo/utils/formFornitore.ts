// src/features/vigilo/utils/formFornitore.ts
//
// Il modulo di un fornitore come valori da campo e la conversione nel corpo
// della richiesta (i vuoti come null, l'email in minuscolo). Il tipo è
// obbligatorio e si sceglie fra quelli attivi del catalogo; un tipo
// disattivato che il fornitore ha già resta fra le scelte. Funzioni pure.
import { LIMITI_FORNITORE } from '../constants/fornitori';
import type { DatiFornitore, Fornitore, TipoFornitore, TipoFornitoreRif } from '../types/fornitori';

export interface ValoriFornitore {
  nome: string;
  tipo: string | null;
  telefono: string;
  email: string;
  indirizzo: string;
  referente: string;
  note: string;
}

/** Vuoti per un fornitore nuovo, quelli che ha per la modifica */
export const valoriIniziali = (f?: Fornitore | null): ValoriFornitore => ({
  nome: f?.nome ?? '',
  tipo: f?.tipo?.chiave ?? null,
  telefono: f?.telefono ?? '',
  email: f?.email ?? '',
  indirizzo: f?.indirizzo ?? '',
  referente: f?.referente ?? '',
  note: f?.note ?? '',
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** L'errore da mostrare sotto il campo email, o undefined */
export const erroreEmail = (email: string): string | undefined => {
  const e = email.trim();
  if (!e) return undefined;
  if (e.length > LIMITI_FORNITORE.email) return `Al massimo ${LIMITI_FORNITORE.email} caratteri`;
  return EMAIL.test(e) ? undefined : 'Un indirizzo email, es. officina@esempio.it';
};

/** Che cosa manca per salvare, in parole ("nome", "tipo") */
export function mancanti(v: ValoriFornitore): string[] {
  return [!v.nome.trim() && 'nome', !v.tipo && 'tipo'].filter((x): x is string => !!x);
}

export const salvabile = (v: ValoriFornitore): boolean => mancanti(v).length === 0 && !erroreEmail(v.email);

const oNull = (s: string): string | null => s.trim() || null;

export const corpoFornitore = (v: ValoriFornitore): DatiFornitore => ({
  nome: v.nome.trim(),
  tipo: v.tipo ?? '',
  telefono: oNull(v.telefono),
  email: oNull(v.email)?.toLowerCase() ?? null,
  indirizzo: oNull(v.indirizzo),
  referente: oNull(v.referente),
  note: oNull(v.note),
});

/** Le scelte del tipo: gli attivi, più quello che il fornitore ha già se è stato disattivato */
export function opzioniTipo(tipi: TipoFornitore[], attuale?: TipoFornitoreRif | null): { value: string; label: string }[] {
  const attivi = tipi.filter(t => t.attivo).map(t => ({ value: t.chiave, label: t.nome }));
  return attuale && !attuale.attivo && !attivi.some(o => o.value === attuale.chiave)
    ? [...attivi, { value: attuale.chiave, label: `${attuale.nome} (disattivato)` }]
    : attivi;
}
