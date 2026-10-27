// src/features/vigilo/types/recapiti.ts — "Non ricevere più questi avvisi" (B8d-4)

/** GET/PUT /api/vigilo/pubblico/recapiti/:codice */
export interface SchedaRecapito {
  /** Chi manda gli avvisi; null se il servizio non ha potuto leggerlo */
  tenant: string | null;
  /** L'indirizzo mascherato (ma•••@example.com) */
  email: string;
  escluso: boolean;
}
