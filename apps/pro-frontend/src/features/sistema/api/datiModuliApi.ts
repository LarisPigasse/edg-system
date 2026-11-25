// src/features/sistema/api/datiModuliApi.ts — i dati di un tenant in un modulo (fase 3, ADR117)
//
// Il percorso lo dà il registro dei moduli (components/module-data). Le risposte
// dei moduli hanno l'inviluppo { success, data, message }.
import { apiFetch } from '@edg/auth';

import { moduleDatiDef } from '../components/module-data/registry';
import type { ApiResponse } from '../../../shared/types/api';
import type { EsitoEliminazione, ModoEliminazione, RiepilogoDati } from '../types/datiModuli';

const percorso = (modulo: string, idTenant: number): string => {
  const def = moduleDatiDef(modulo);
  if (!def) throw new Error(`Il modulo ${modulo} non espone i dati dei tenant`);
  return def.percorso(idTenant);
};

export async function leggiDatiModulo(modulo: string, idTenant: number): Promise<RiepilogoDati> {
  return (await apiFetch<ApiResponse<RiepilogoDati>>(percorso(modulo, idTenant))).data as RiepilogoDati;
}

/** Solo root; `conferma` ripete l'id del tenant (il servizio lo controlla) */
export async function eliminaDatiModulo(modulo: string, idTenant: number, modo: ModoEliminazione): Promise<EsitoEliminazione> {
  const r = await apiFetch<ApiResponse<EsitoEliminazione>>(percorso(modulo, idTenant), {
    method: 'DELETE',
    body: JSON.stringify({ modo, conferma: idTenant }),
  });
  return r.data as EsitoEliminazione;
}
