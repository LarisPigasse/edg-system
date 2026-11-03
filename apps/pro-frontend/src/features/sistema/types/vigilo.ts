// src/features/sistema/types/vigilo.ts — Vigilo visto da EDG Pro

/** Un tipo di fornitore del catalogo comune (vigilo-service, F0) */
export interface TipoFornitore {
  /** Stabile: serve al codice e ai report */
  chiave: string;
  nome: string;
  attivo: boolean;
  ordine: number;
  /** Quanti fornitori lo usano, in tutti i tenant (solo per root) */
  fornitori?: number;
}
