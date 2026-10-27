// src/features/vigilo/types/destinatari.ts — chi riceve gli avvisi di controlli e scadenze (B8d-3)

export type TipoDestinatario = 'ufficio' | 'referente' | 'assegnatario' | 'interessato';

export type Destinatario = { tipo: TipoDestinatario } | { tipo: 'email'; email: string };

/**
 * Come arriva l'avviso: sul suo account (in app, ed email secondo le preferenze),
 * per email, per niente, o per niente perché l'indirizzo ha chiesto di non
 * ricevere più (escluso, B8d-4)
 */
export type Recapito = 'app' | 'email' | 'nessuno' | 'escluso';

export interface VoceAnteprima {
  ruolo: 'referente' | 'assegnatario' | 'interessato' | 'email';
  /** null se il ruolo è vuoto (es. nessun referente) o per un indirizzo */
  nome: string | null;
  email: string | null;
  recapito: Recapito;
}

/** GET /scadenze/:id/destinatari */
export interface AnteprimaDestinatari {
  destinatari: Destinatario[];
  /** Dal controllo, ridefiniti sulla scadenza, o predefiniti (promemoria) */
  origine: 'controllo' | 'scadenza' | 'predefinito';
  ufficio: boolean;
  /** Soggetto sospeso: arriva solo all'ufficio */
  soloUfficio: boolean;
  /** Persone dell'ufficio; null se non si è potuto contarle */
  ufficioPersone: number | null;
  voci: VoceAnteprima[];
}
