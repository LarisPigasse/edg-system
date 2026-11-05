// src/core/assistenza/api/index.ts — accessi dell'assistenza EDG nel mio tenant (AA5)
import { apiFetch } from '@edg/auth';

import type { AccessoAssistenza } from '../types';

interface Envelope<T> {
  success: boolean;
  data: T;
}

/** Gli ultimi accessi (auth-service ne dà al massimo 64), dal più recente */
export async function leggiAccessiAssistenza(): Promise<AccessoAssistenza[]> {
  const res = await apiFetch<Envelope<AccessoAssistenza[]>>('/auth/assistenza/nel-mio-tenant');
  return res.data ?? [];
}
