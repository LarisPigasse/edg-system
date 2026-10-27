// src/features/vigilo/api/recapiti.ts
//
// "Non ricevere più questi avvisi" (B8d-4): rotte pubbliche, senza accesso.
// Non passa da apiFetch: niente token né rinnovo, chi arriva qui non ha un
// account. Il codice dell'email è la sola credenziale.
import type { SchedaRecapito } from '../types/recapiti';

const BASE = '/api/vigilo/pubblico/recapiti';

/** Errore con lo stato HTTP: 404 collegamento non valido, 429 troppe richieste */
export class ErroreRecapito extends Error {
  readonly stato: number;
  constructor(messaggio: string, stato: number) {
    super(messaggio);
    this.stato = stato;
  }
}

async function chiama(codice: string, init?: RequestInit): Promise<SchedaRecapito> {
  let risposta: Response;
  try {
    risposta = await fetch(`${BASE}/${encodeURIComponent(codice)}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ErroreRecapito('Connessione non riuscita', 0);
  }
  const corpo = await risposta.json().catch(() => null);
  if (!risposta.ok) throw new ErroreRecapito(corpo?.message ?? corpo?.error ?? `Errore ${risposta.status}`, risposta.status);
  return corpo.data as SchedaRecapito;
}

export const leggiRecapito = (codice: string) => chiama(codice);

/** true = non ricevere più; false = riceverli di nuovo */
export const cambiaRecapito = (codice: string, escluso: boolean) => chiama(codice, { method: 'PUT', body: JSON.stringify({ escluso }) });
