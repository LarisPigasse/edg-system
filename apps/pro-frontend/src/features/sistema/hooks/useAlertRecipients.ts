// src/features/sistema/hooks/useAlertRecipients.ts — destinatari degli allarmi (ADR038)
import {
  createAlertRecipient,
  deleteAlertRecipient,
  getAlertRecipients,
  toggleAlertRecipient,
  updateAlertRecipient,
} from '../api/infoApi';
import { useAlertResource, type AlertResourceApi } from './useAlertResource';
import type { AlertRecipient, AlertRecipientInput } from '../types/info';

const API: AlertResourceApi<AlertRecipient, AlertRecipientInput> = {
  list: getAlertRecipients,
  create: createAlertRecipient,
  update: updateAlertRecipient,
  toggle: toggleAlertRecipient,
  remove: deleteAlertRecipient,
};
const LABEL = { one: 'Destinatario', gender: 'm' } as const;
const nameOf = (r: AlertRecipient) => r.name;
const enabledOf = (r: AlertRecipient) => r.enabled;

export const useAlertRecipients = () =>
  useAlertResource<AlertRecipient, AlertRecipientInput>({ api: API, label: LABEL, nameOf, enabledOf });
