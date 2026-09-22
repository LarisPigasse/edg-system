// src/features/sistema/api/useEntityDirectory.ts

/**
 * Elenco di operatori e anagrafiche (system-service) con etichette pronte
 * per questa feature: usato sia da EntityLinkSelect (selettore di
 * collegamento in creazione/modifica account) sia da AccountPage (colonna
 * "Collegato a" in tabella). Un solo punto di caricamento e di formattazione
 * delle etichette, cosi' le due viste restano sempre coerenti tra loro.
 */
import { useEffect, useState } from 'react';
import { systemApi } from './systemApi';

export interface OperatoreOption {
  uuidOperatore: string;
  nome: string;
  cognome: string;
}

// Mirror di features/base/types (TipoAnagrafica): gli agenti sono operatori
// interni di reparto, non un tipo di anagrafica - vedi discussione del
// 17/09/2026.
export type TipoAnagraficaOption = 'partner' | 'cliente';

export const TIPO_ANAGRAFICA_LABELS: Record<TipoAnagraficaOption, string> = {
  cliente: 'Cliente',
  partner: 'Partner',
};

export interface AnagraficaOption {
  uuidAnagrafica: string;
  ragioneSociale: string;
  tipo: TipoAnagraficaOption;
}

const operatoreLabel = (o: OperatoreOption): string => `${o.cognome} ${o.nome}`;
// Con suffisso tipo (Cliente/Partner): serve nel selettore EntityLinkSelect,
// dove le anagrafiche di entrambi i tipi compaiono mescolate in un'unica
// lista (oggi condividono lo stesso accountType 'cliente' - vedi commento
// in EntityLinkSelect) e vanno quindi distinte.
const anagraficaLabel = (a: AnagraficaOption): string => `${a.ragioneSociale} — ${TIPO_ANAGRAFICA_LABELS[a.tipo]}`;
// Senza suffisso: per contesti dove il tipo è già mostrato altrove (es. la
// colonna "Tipo" di AccountPage) o non serve - la ragione sociale basta.
const anagraficaShortLabel = (a: AnagraficaOption): string => a.ragioneSociale;

export function useEntityDirectory() {
  const [operatori, setOperatori] = useState<OperatoreOption[]>([]);
  const [anagrafiche, setAnagrafiche] = useState<AnagraficaOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      systemApi.listResource<OperatoreOption>('operatori', { active: true, limit: 100 }).catch(() => ({ data: [] as OperatoreOption[] })),
      systemApi.listResource<AnagraficaOption>('anagrafiche', { active: true, limit: 100 }).catch(() => ({ data: [] as AnagraficaOption[] })),
    ]).then(([opRes, anRes]) => {
      if (cancelled) return;
      setOperatori(opRes.data ?? []);
      setAnagrafiche(anRes.data ?? []);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Etichetta leggibile per un entityId, in base al tipo di account che lo referenzia. */
  const getLabel = (accountType: string, entityId: string | null | undefined): string | null => {
    if (!entityId) return null;
    if (accountType === 'operatore') {
      const o = operatori.find(x => x.uuidOperatore === entityId);
      return o ? operatoreLabel(o) : null;
    }
    if (accountType === 'cliente') {
      const a = anagrafiche.find(x => x.uuidAnagrafica === entityId);
      return a ? anagraficaLabel(a) : null;
    }
    return null;
  };

  /** Come getLabel, ma senza il suffisso tipo sulle anagrafiche (vedi anagraficaShortLabel). */
  const getShortLabel = (accountType: string, entityId: string | null | undefined): string | null => {
    if (!entityId) return null;
    if (accountType === 'operatore') {
      const o = operatori.find(x => x.uuidOperatore === entityId);
      return o ? operatoreLabel(o) : null;
    }
    if (accountType === 'cliente') {
      const a = anagrafiche.find(x => x.uuidAnagrafica === entityId);
      return a ? anagraficaShortLabel(a) : null;
    }
    return null;
  };

  const operatoreOptions = () => operatori.map(o => ({ value: o.uuidOperatore, label: operatoreLabel(o) }));
  const anagraficaOptions = () => anagrafiche.map(a => ({ value: a.uuidAnagrafica, label: anagraficaLabel(a) }));

  return { operatori, anagrafiche, isLoading, getLabel, getShortLabel, operatoreOptions, anagraficaOptions };
}
