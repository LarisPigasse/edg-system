// src/features/vigilo/types/fornitori.ts — fornitori (vigilo-service, fornitore.routes)
import type { RegistrazioneStorico } from './soggetti';

/** Il tipo dal catalogo comune (F0): chiave stabile, nome mostrato */
export interface TipoFornitoreRif {
  chiave: string;
  nome: string;
  attivo: boolean;
}

/** Un tipo del catalogo, come lo dà GET /fornitori/tipi */
export interface TipoFornitore extends TipoFornitoreRif {
  ordine: number;
}

export interface Fornitore {
  uuid: string;
  nome: string;
  tipo: TipoFornitoreRif | null;
  telefono: string | null;
  email: string | null;
  indirizzo: string | null;
  referente: string | null;
  note: string | null;
  attivo: boolean;
  /** Solo negli elenchi e nel dettaglio: quante registrazioni lo citano e l'ultima (F1) */
  registrazioni?: number;
  ultimaIl?: string | null;
}

export type StatoFornitori = 'attivi' | 'disattivati' | 'tutti';

export interface FiltriFornitori {
  stato: StatoFornitori;
  /** Chiave del tipo */
  tipo?: string;
}

export type OrdinaFornitori = 'nome' | 'tipo';

/** Il corpo di POST /fornitori e PATCH /fornitori/:id (i vuoti come null) */
export interface DatiFornitore {
  nome: string;
  tipo: string;
  telefono: string | null;
  email: string | null;
  indirizzo: string | null;
  referente: string | null;
  note: string | null;
}

/** Una registrazione nello storico del fornitore: anche di quale soggetto */
export interface RegistrazioneFornitore extends RegistrazioneStorico {
  soggetto?: { uuid: string; nome: string; identificativo: string | null };
}
