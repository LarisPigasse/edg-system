// src/features/sistema/hooks/useAlertRules.ts — regole di allarme (ADR038)
import {
  createAlertRule,
  deleteAlertRule,
  getAlertRules,
  toggleAlertRule,
  updateAlertRule,
} from '../api/infoApi';
import { useAlertResource, type AlertResourceApi } from './useAlertResource';
import type { AlertRule, AlertRuleInput } from '../types/info';

// Costanti di modulo: riferimenti stabili, niente ricaricamenti a ogni render
const API: AlertResourceApi<AlertRule, AlertRuleInput> = {
  list: getAlertRules,
  create: createAlertRule,
  update: updateAlertRule,
  toggle: toggleAlertRule,
  remove: deleteAlertRule,
};
const LABEL = { one: 'Regola', gender: 'f' } as const;
const nameOf = (r: AlertRule) => r.name;
const enabledOf = (r: AlertRule) => r.enabled;

export const useAlertRules = () => useAlertResource<AlertRule, AlertRuleInput>({ api: API, label: LABEL, nameOf, enabledOf });
