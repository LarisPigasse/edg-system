// src/features/vigilo/types/allegati.ts — i documenti di soggetti, scadenze e registrazioni (B9a)

export type EntitaAllegato = 'soggetto' | 'scadenza' | 'registrazione';

/** A che cosa appartiene: per raggruppare i documenti nella scheda del soggetto */
export interface AppartenenzaAllegato {
  entita: EntitaAllegato;
  uuid: string;
  /** Titolo della scadenza (anche per una registrazione); null per il soggetto */
  titolo: string | null;
  /** Solo per una registrazione */
  eseguitaIl: string | null;
}

export interface VoceAllegato {
  uuid: string;
  nome: string;
  /** Tipo MIME verificato dal servizio */
  tipo: string;
  dimensione: number;
  descrizione: string | null;
  /** Il browser lo mostra da sé; altrimenti si scarica */
  apribile: boolean;
  caricatoIl: string;
  caricatoDa: string | null;
  di: AppartenenzaAllegato;
}

/** I limiti decisi dal servizio (parametro della piattaforma e costante) */
export interface LimitiAllegati {
  mb: number;
  perEntita: number;
}

/** GET /allegati */
export interface ElencoAllegati {
  voci: VoceAllegato[];
  limiti: LimitiAllegati;
}

/** Un file in caricamento, per la barra di avanzamento */
export interface InCaricamento {
  id: string;
  nome: string;
  /** Da 0 a 1 */
  avanzamento: number;
}
