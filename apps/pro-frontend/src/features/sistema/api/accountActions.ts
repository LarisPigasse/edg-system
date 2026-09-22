// src/features/sistema/api/accountActions.ts
//
// Azioni sull'account che non passano dal client CRUD generico (comandi
// mirati, non collezioni): blocco e sblocco utente. Stesso schema di
// handleHardDelete in AccountPage.tsx — chiamata diretta con apiFetch.
// Endpoint lato auth-service: SessionController.blockUser/unblockUser.

import { apiFetch } from '@edg/auth';
import type { ApiResponse } from '../../../shared/types/api';

/** Preset di durata per il blocco temporaneo (vedi SessionController.blockUser). */
export type BlockDuration = '1h' | '24h' | '7d' | 'permanent';

export const BLOCK_DURATION_OPTIONS: { value: BlockDuration; label: string }[] = [
  { value: '1h', label: '1 ora' },
  { value: '24h', label: '24 ore' },
  { value: '7d', label: '7 giorni' },
  { value: 'permanent', label: 'Permanente' },
];

export interface BlockUserInput {
  duration: BlockDuration;
  reason?: string;
}

export async function blockUser(accountId: number, input: BlockUserInput): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/auth/users/${accountId}/block`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function unblockUser(accountId: number): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/auth/users/${accountId}/unblock`, {
    method: 'DELETE',
  });
}

/**
 * Un account è "bloccato" nell'accezione forte di SessionController.blockUser
 * (distinta dalla semplice disattivazione manuale) se ha ancora un blocco
 * temporale in corso o un motivo di blocco registrato — stesso criterio
 * usato da AccountController per la card statistica "Bloccati".
 */
export function isAccountBlocked(account: { blockedUntil: string | null; blockReason: string | null }): boolean {
  const untilFuture = !!account.blockedUntil && new Date(account.blockedUntil).getTime() > Date.now();
  return untilFuture || !!account.blockReason;
}
