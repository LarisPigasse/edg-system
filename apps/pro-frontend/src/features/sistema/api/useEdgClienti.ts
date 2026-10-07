// src/features/sistema/api/useEdgClienti.ts

/**
 * Clienti dell'anagrafica EDG (ADR058): le anagrafiche di tipo cliente del
 * tenant di sistema, cioè i soggetti commerciali di Express Delivery Group a
 * cui si può collegare un tenant. Il personale EDG appartiene sempre al
 * tenant di sistema (le pagine di SISTEMA lo richiedono), quindi il suo
 * tenantId individua la rubrica giusta.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '@edg/auth';

import { systemApi } from './systemApi';
import { useSettori } from '../../base/api/useSettori';

export interface EdgCliente {
  uuidAnagrafica: string;
  ragioneSociale: string;
  /** Settore di attività (ADR059): il tenant collegato lo ricava da qui */
  idSettore: number | null;
  isActive: boolean;
}

export function useEdgClienti(enabled = true) {
  const { account } = useAuth();
  const systemTenantId = account?.tenantId;
  const [clienti, setClienti] = useState<EdgCliente[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled || !systemTenantId) return;
    let cancelled = false;
    setIsLoading(true);
    systemApi
      // Anche i disattivati: un tenant già collegato deve continuare a mostrarne il nome
      .listResource<EdgCliente>('anagrafiche', {
        limit: 100,
        active: 'all',
        extra: { tipo: 'cliente', idTenant: systemTenantId },
      })
      .then(res => {
        if (!cancelled) setClienti(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setClienti([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, systemTenantId]);

  // Settore (ADR059): sta sul cliente, un tenant lo ricava dal cliente collegato
  const { settoreName } = useSettori();

  /** Settore del cliente collegato a un tenant, o null */
  const settoreOfCliente = (uuid: string | null | undefined): string | null =>
    settoreName(clienti.find(c => c.uuidAnagrafica === uuid)?.idSettore);

  /** Ragione sociale di un cliente, o null se non è (più) in anagrafica */
  const clienteName = (uuid: string | null | undefined): string | null =>
    clienti.find(c => c.uuidAnagrafica === uuid)?.ragioneSociale ?? null;

  return { clienti, isLoading, clienteName, settoreOfCliente };
}
