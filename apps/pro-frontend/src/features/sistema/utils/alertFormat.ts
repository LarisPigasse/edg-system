// src/features/sistema/utils/alertFormat.ts
//
// Presentazione delle regole di allarme (ADR038): etichette dei
// raggruppamenti, riepilogo compatto per la tabella e frase descrittiva
// completa per la modale. Funzioni pure, nessuna dipendenza da React.
import type { SelectOption } from '@edg/ui';

import type { AlertGroupBy, AlertRuleInput } from '../types/info';

export const GROUP_BY_LABEL: Record<AlertGroupBy, string> = {
  service: 'servizio',
  actor: 'utente',
  ip: 'IP',
};

/** Complemento usato nella frase ("dallo stesso IP") */
const GROUP_BY_PHRASE: Record<AlertGroupBy, string> = {
  service: 'sullo stesso servizio',
  actor: 'dallo stesso utente',
  ip: 'dallo stesso IP',
};

/** '' = nessun raggruppamento (valore del Select) */
export const GROUP_BY_OPTIONS: SelectOption[] = [
  { value: '', label: 'Nessuno (tutti gli eventi insieme)' },
  { value: 'service', label: 'Per servizio' },
  { value: 'actor', label: 'Per utente' },
  { value: 'ip', label: 'Per indirizzo IP' },
];

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "32 min", "nessuna" */
export const formatCooldown = (minutes: number): string => (minutes > 0 ? `${minutes} min` : 'nessuna');

/** Tipo di evento o criticita' della regola, per la prima riga del riepilogo */
export function ruleSubject(rule: Pick<AlertRuleInput, 'conditions'>): string {
  const { sottoCategoria, criticita, categoria } = rule.conditions;
  if (sottoCategoria) return sottoCategoria;
  if (criticita) return `eventi ${criticita}`;
  if (categoria) return `eventi ${categoria}`;
  return 'qualsiasi evento';
}

/** Riepilogo compatto per la tabella: "≥ 8 in 16 min · per IP" / "subito" */
export function ruleTrigger(rule: Pick<AlertRuleInput, 'threshold' | 'groupBy'>): string {
  const { count, windowMinutes } = rule.threshold;
  const base = count > 1 ? `≥ ${count} in ${windowMinutes} min` : 'subito';
  return rule.groupBy ? `${base} · per ${GROUP_BY_LABEL[rule.groupBy]}` : base;
}

/**
 * Frase completa, aggiornata mentre si compila la modale:
 * "Scatta quando si verificano almeno 8 eventi auth.login_failed dallo stesso
 *  IP in 16 minuti; per lo stesso IP non invia altri allarmi per 32 minuti."
 */
export function describeRule(
  rule: Pick<AlertRuleInput, 'conditions' | 'threshold' | 'groupBy' | 'cooldownMinutes'> & Partial<Pick<AlertRuleInput, 'severity'>>
): string {
  const subject = ruleSubject(rule);
  const { count, windowMinutes } = rule.threshold;
  const where = rule.groupBy ? ` ${GROUP_BY_PHRASE[rule.groupBy]}` : '';

  const when =
    count > 1
      ? `Scatta quando si verificano almeno ${plural(count, 'evento', 'eventi')} ${subject}${where} in ${plural(
          windowMinutes,
          'minuto',
          'minuti'
        )}`
      : `Scatta a ogni ${subject === 'qualsiasi evento' ? 'evento' : `evento ${subject}`}${where}`;

  const pause =
    rule.cooldownMinutes > 0
      ? `; ${rule.groupBy ? `per lo stesso ${GROUP_BY_LABEL[rule.groupBy]} ` : ''}non invia altri allarmi per ${plural(
          rule.cooldownMinutes,
          'minuto',
          'minuti'
        )}.`
      : ', senza pausa tra un allarme e il successivo.';

  const severity = rule.severity ? ` L’allarme è sempre ${ALERT_SEVERITY[rule.severity].label.toLowerCase()}.` : '';

  return when + pause + severity;
}

// ---------------------------------------------------------------------------
// Gravita' e esito di un allarme inviato (Ultimo allarme, Storico)
// ---------------------------------------------------------------------------

export const ALERT_SEVERITY: Record<string, { label: string; variant: 'danger' | 'warning' | 'info' }> = {
  critical: { label: 'Critico', variant: 'danger' },
  warning: { label: 'Avviso', variant: 'warning' },
  info: { label: 'Informativo', variant: 'info' },
};

export const ALERT_STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tutti gli esiti' },
  { value: 'SENT', label: 'Inviato' },
  { value: 'FAILED', label: 'Fallito' },
];

export const ALERT_SEVERITY_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tutte le gravità' },
  ...['critical', 'warning', 'info'].map(value => ({ value, label: ALERT_SEVERITY[value].label })),
];

/** Gravita' di una regola: vuoto = come l'evento che la fa scattare */
export const RULE_SEVERITY_OPTIONS: SelectOption[] = [
  { value: '', label: 'Come l’evento' },
  ...['critical', 'warning', 'info'].map(value => ({ value, label: ALERT_SEVERITY[value].label })),
];
