// src/features/sistema/utils/moduleFormat.ts
//
// Etichette e regole di forma della gestione moduli (ADR047-048), condivise
// da catalogo e pagina del tenant. Le regole vere stanno in auth-service:
// qui solo ciò che serve per guidare l'utente prima dell'invio.
import type { HomeModuleStatus, SelectOption } from '@edg/ui';
import type { ActivationStatus, CatalogModule, ModuleStatus } from '../types/modules';

/** Stesso formato delle chiavi in auth-service (KEY_PATTERN): minuscole, cifre, trattini */
export const MODULE_KEY_PATTERN = '^[a-z][a-z0-9]*(-[a-z0-9]+)*$';
export const MODULE_KEY_REGEX = new RegExp(MODULE_KEY_PATTERN);

/** Durata predefinita della prova proposta per un modulo nuovo */
export const DEFAULT_TRIAL_DAYS = 32;

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

export const MODULE_STATUS: Record<ModuleStatus, { label: string; variant: BadgeVariant; hint: string }> = {
  sviluppo: { label: 'In sviluppo', variant: 'info', hint: 'Attivabile per prove e demo, non ancora in vendita' },
  disponibile: { label: 'Disponibile', variant: 'success', hint: 'Pronto per i clienti' },
  dismesso: { label: 'Dismesso', variant: 'default', hint: 'Non più attivabile; chi lo aveva lo perde' },
};

export const MODULE_STATUS_OPTIONS: SelectOption[] = (Object.keys(MODULE_STATUS) as ModuleStatus[]).map(value => ({
  value,
  label: MODULE_STATUS[value].label,
}));

export const ACTIVATION_STATUS: Record<ActivationStatus, { label: string; variant: BadgeVariant }> = {
  prova: { label: 'In prova', variant: 'info' },
  attivo: { label: 'Attivo', variant: 'success' },
  sospeso: { label: 'Sospeso', variant: 'warning' },
  scaduto: { label: 'Scaduto', variant: 'danger' },
};

/** Nomi leggibili delle chiavi (dipendenze), nell'ordine dato */
export const moduleNames = (keys: string[], catalog: CatalogModule[]): string =>
  keys.map(k => catalog.find(m => m.key === k)?.name ?? k).join(', ');

/** Prodotto per esteso: "spedizioni" → "Spedizioni", "movimento-terra" → "Movimento terra" */
export const productLabel = (product: string): string =>
  product ? product.charAt(0).toUpperCase() + product.slice(1).replace(/-/g, ' ') : '—';

/** In vetrina davvero (ADR056): il flag conta solo per i moduli disponibili */
export const isInShowcase = (m: Pick<CatalogModule, 'showcase' | 'status'>): boolean =>
  m.showcase && m.status === 'disponibile';

/** Testo breve della vetrina, per tabella e scheda */
export const showcaseLabel = (m: Pick<CatalogModule, 'showcase' | 'status'>): string =>
  !m.showcase ? 'No, riservato' : isInShowcase(m) ? 'Sì' : 'Sì, quando sarà disponibile';

/** Stato nel riquadro della home per il personale EDG, che può usare tutto (ADR057) */
export const staffHomeStatus = (m: Pick<CatalogModule, 'status'>): HomeModuleStatus =>
  m.status === 'sviluppo' ? 'sviluppo' : 'attivo';
