// src/features/vigilo/types/impostazioni.ts — le regole degli avvisi del tenant (GET/PATCH/DELETE /api/vigilo/impostazioni/avvisi, B8d-2)
import type { RegoleEmailTenant } from './avvisi';

export interface RegoleAvvisi extends RegoleEmailTenant {
  /** Giorni fra un richiamo e il successivo per una scadenza scaduta, 0 = nessuno */
  intervalloRichiami: number;
}

/** Gli stessi limiti del servizio (impostazioni/limiti.ts) */
export interface LimitiRegoleAvvisi {
  orarioRiepilogo: { min: string; max: string };
  intervalloRichiami: { min: number; max: number };
  silenzioMassimoMinuti: number;
}

export interface SchedaRegoleAvvisi {
  regole: RegoleAvvisi;
  predefinite: RegoleAvvisi;
  limiti: LimitiRegoleAvvisi;
  /** Diverse dalle predefinite */
  modificate: boolean;
  /** L'utente può cambiarle (vigilo.config) */
  modificabili: boolean;
}

// --- Interventi (passo 8): GET/PATCH /api/vigilo/impostazioni/interventi ---

export interface RegoleInterventi {
  costoOrario: number | null;
  giorniRiparazione: number;
}

export interface SchedaInterventi {
  giorniRiparazione: number;
  /** Solo a chi ha vigilo.costi */
  costoOrario?: number | null;
  predefinite: { giorniRiparazione: number };
  limiti: { costoOrario: { min: number; max: number }; giorniRiparazione: { min: number; max: number } };
  modificabili: { giorniRiparazione: boolean; costoOrario: boolean };
}
