// src/features/vigilo/types/fornitori.ts — fornitori (vigilo-service, fornitore.routes)

/** Il tipo dal catalogo comune (F0): chiave stabile, nome mostrato */
export interface TipoFornitoreRif {
  chiave: string;
  nome: string;
  attivo: boolean;
}

export interface Fornitore {
  uuid: string;
  nome: string;
  tipo: TipoFornitoreRif | null;
}
