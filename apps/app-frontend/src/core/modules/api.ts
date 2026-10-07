// src/core/modules/api.ts
//
// I moduli dell'utente per la home (ADR061): i propri e quelli in vetrina,
// già filtrati da auth-service. L'inviluppo { success, data } si scioglie qui.
import { apiFetch } from '@edg/auth';

import type { MyModule } from './types';

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function fetchMyModules(): Promise<MyModule[]> {
  const res = await apiFetch<Envelope<MyModule[]>>('/auth/me/modules');
  return res.data ?? [];
}
