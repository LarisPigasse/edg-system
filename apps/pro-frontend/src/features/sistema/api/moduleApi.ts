// src/features/sistema/api/moduleApi.ts
//
// Client della gestione moduli (ADR048) verso auth-service tramite il
// gateway: catalogo (/auth/modules) e attivazioni per tenant
// (/auth/tenants/:tenantId/modules). Non usa createResourceApi: il catalogo
// si indirizza per chiave, non per id, e le attivazioni sono una
// sotto-risorsa del tenant. L'inviluppo { success, data, message } viene
// sciolto qui; il messaggio resta disponibile dove serve (es. moduli caduti).
import { apiFetch } from '@edg/auth';

import type { ApiResponse } from '../../../shared/types/api';
import type {
  ActivationCreateInput,
  ActivationUpdateInput,
  ActivationUpdateResult,
  Activation,
  CatalogModule,
  CatalogModuleInput,
  TenantModules,
} from '../types/modules';

const CATALOG = '/auth/modules';
const tenantModules = (tenantId: number) => `/auth/tenants/${tenantId}/modules`;

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
});

async function data<T>(p: Promise<ApiResponse<T>>): Promise<T> {
  const res = await p;
  return res.data as T;
}

// ---------------------------------------------------------------------------
// Catalogo (lettura: admin e root; scrittura: solo root)
// ---------------------------------------------------------------------------

export const listCatalog = (): Promise<CatalogModule[]> => data(apiFetch<ApiResponse<CatalogModule[]>>(CATALOG));

export const createCatalogModule = (input: CatalogModuleInput): Promise<CatalogModule> =>
  data(apiFetch<ApiResponse<CatalogModule>>(CATALOG, json('POST', input)));

/** La chiave non cambia: viene tolta dal corpo anche se presente */
/** Modifica parziale: si inviano solo i campi da cambiare (es. solo branding) */
export const updateCatalogModule = (key: string, input: Partial<CatalogModuleInput>): Promise<CatalogModule> => {
  const { key: _ignored, ...body } = input;
  return data(apiFetch<ApiResponse<CatalogModule>>(`${CATALOG}/${encodeURIComponent(key)}`, json('PUT', body)));
};

export const deleteCatalogModule = async (key: string): Promise<void> => {
  await apiFetch<ApiResponse<null>>(`${CATALOG}/${encodeURIComponent(key)}`, json('DELETE'));
};

// ---------------------------------------------------------------------------
// Attivazioni di un tenant (admin e root, sistema.moduli)
// ---------------------------------------------------------------------------

export const getTenantModules = (tenantId: number): Promise<TenantModules> =>
  data(apiFetch<ApiResponse<TenantModules>>(tenantModules(tenantId)));

export const activateModule = (tenantId: number, input: ActivationCreateInput): Promise<Activation> =>
  data(apiFetch<ApiResponse<Activation>>(tenantModules(tenantId), json('POST', input)));

export const updateActivation = (
  tenantId: number,
  key: string,
  input: ActivationUpdateInput
): Promise<ActivationUpdateResult> =>
  data(
    apiFetch<ApiResponse<ActivationUpdateResult>>(
      `${tenantModules(tenantId)}/${encodeURIComponent(key)}`,
      json('PUT', input)
    )
  );
