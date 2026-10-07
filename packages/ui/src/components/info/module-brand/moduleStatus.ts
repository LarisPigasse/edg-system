// Stato di un modulo nella home dell'utente (ADR055-056, fase 4)
//
// Unica tabella da cui riquadro, scheda e app leggono etichetta, colore del
// badge e se il modulo si può aprire. Gli stati arrivano da auth-service
// (GET /auth/me/modules) o, nel gestionale, dal catalogo.
import type { BadgeVariant } from '../../ui/badge/Badge';

export type HomeModuleStatus = 'attivo' | 'prova' | 'sviluppo' | 'non-attivo' | 'sospeso' | 'scaduto';

export interface HomeModuleStatusMeta {
  label: string;
  variant: BadgeVariant;
  /** Si apre (riquadro acceso); altrimenti riquadro spento e scheda informativa */
  usable: boolean;
}

export const HOME_MODULE_STATUS: Record<HomeModuleStatus, HomeModuleStatusMeta> = {
  attivo: { label: 'Attivo', variant: 'success', usable: true },
  prova: { label: 'In prova', variant: 'primary', usable: true },
  sviluppo: { label: 'In sviluppo', variant: 'info', usable: true },
  'non-attivo': { label: 'Non attivo', variant: 'default', usable: false },
  sospeso: { label: 'Sospeso', variant: 'warning', usable: false },
  scaduto: { label: 'Scaduto', variant: 'danger', usable: false },
};

/** Il modulo si può aprire? (attivo, in prova, in sviluppo) */
export const isModuleUsable = (status: HomeModuleStatus): boolean => HOME_MODULE_STATUS[status].usable;

/** Giorno e mese brevi, per il piede del riquadro: "15 ott" */
const shortDay = (date: string | Date): string =>
  new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

/**
 * Etichetta dello stato, con la scadenza se c'è:
 * "In prova fino al 15 ott", "Attivo fino al 3 gen", altrimenti "Scaduto".
 */
export function homeModuleStatusLabel(status: HomeModuleStatus, endsAt?: string | Date | null): string {
  const { label } = HOME_MODULE_STATUS[status];
  return endsAt && (status === 'prova' || status === 'attivo') ? `${label} fino al ${shortDay(endsAt)}` : label;
}
