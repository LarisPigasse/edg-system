// src/core/components/data/table/TableCapabilities.tsx
import React, { createContext, useContext } from 'react';

/**
 * Capacità automatiche condivise da ogni <Table> dell'applicazione.
 *
 * packages/ui non dipende da @edg/auth (è @edg/auth a dipendere da ui):
 * questo Context è il confine pulito tra i due — ui definisce solo la forma
 * del dato ("chi può vedere cosa"), è l'app a popolarlo con la propria
 * logica di autenticazione, una volta sola nella root.
 */
export interface TableCapabilities {
  /**
   * Se true, ogni Table mostra automaticamente la voce "Dati tecnici" nel
   * menu azioni di riga (dump di tutti i campi del record: id, uuid, chiavi
   * esterne, date di sistema...). Convenzione di piattaforma (ADR021/022):
   * una Table rappresenta sempre righe di una tabella o di una query, mai un
   * elenco statico, quindi il dettaglio tecnico ha senso ovunque — nessuna
   * pagina deve dichiararlo esplicitamente.
   */
  isRoot: boolean;
}

const DEFAULT_CAPABILITIES: TableCapabilities = { isRoot: false };

const TableCapabilitiesContext = createContext<TableCapabilities>(DEFAULT_CAPABILITIES);

export interface TableCapabilitiesProviderProps extends TableCapabilities {
  children: React.ReactNode;
}

/**
 * Da istanziare una sola volta nella root dell'applicazione, avvolgendo
 * l'intero albero delle rotte. Esempio in pro-frontend, App.tsx:
 *
 *   const { isRoot } = useAuth();
 *   <TableCapabilitiesProvider isRoot={isRoot}>...</TableCapabilitiesProvider>
 */
export const TableCapabilitiesProvider: React.FC<TableCapabilitiesProviderProps> = ({ children, ...capabilities }) => (
  <TableCapabilitiesContext.Provider value={capabilities}>{children}</TableCapabilitiesContext.Provider>
);

/** Letto internamente da Table — non è normalmente necessario usarlo altrove. */
export const useTableCapabilities = (): TableCapabilities => useContext(TableCapabilitiesContext);
