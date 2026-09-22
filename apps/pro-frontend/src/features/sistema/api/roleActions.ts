// src/features/sistema/api/roleActions.ts
//
// Ruoli/Permessi (ADR024): non e' una risorsa CRUD generica (nessuna
// creazione/eliminazione di ruoli - solo modifica dei permessi di un ruolo
// gia' esistente), e vive sotto /auth/accounts/roles invece che su un path
// piatto: stesso motivo per cui accountActions.ts chiama apiFetch
// direttamente invece di passare da createResourceApi.
//
// Endpoint lato auth-service: AccountController.getRoles/updateRolePermissions.

import { apiFetch } from '@edg/auth';
import type { ApiResponse } from '../../../shared/types/api';
import type { Role } from '../types';

export async function listRoles(): Promise<ApiResponse<Role[]>> {
  return apiFetch<ApiResponse<Role[]>>('/auth/accounts/roles');
}

export async function updateRolePermissions(roleId: number, permissions: string[]): Promise<ApiResponse<Role>> {
  return apiFetch<ApiResponse<Role>>(`/auth/accounts/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  });
}
