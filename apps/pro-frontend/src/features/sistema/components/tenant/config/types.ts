// src/features/sistema/components/tenant/config/types.ts
//
// Impostazioni specifiche di un modulo nella finestra di attivazione (ADR087).
// La finestra resta generica: se il modulo ha un editor nel registro
// (index.ts), lo mostra sotto il periodo e salva il risultato in
// tenant_modules.config.
import type React from 'react';

export type ModuleConfig = Record<string, unknown>;

/** Contesto utile agli editor: dati del tenant già noti alla finestra */
export interface ModuleConfigContext {
  /** Operatore EDG che segue il cliente collegato al tenant (ADR086), se c'è */
  seguitoDa?: number | null;
}

export interface ModuleConfigEditorProps {
  value: ModuleConfig;
  onChange: (value: ModuleConfig) => void;
  /** true dopo un tentativo di conferma: mostra gli errori */
  showErrors: boolean;
}

export interface ModuleConfigDef {
  /** Impostazioni iniziali per una nuova attivazione o una config vuota */
  initial: (current: ModuleConfig | null, ctx: ModuleConfigContext) => ModuleConfig;
  /** Messaggio d'errore che blocca la conferma, oppure null */
  validate: (value: ModuleConfig) => string | null;
  /** Riassunto in una riga per la riga dell'attivazione, oppure null */
  Summary: React.FC<{ value: ModuleConfig }>;
  Editor: React.FC<ModuleConfigEditorProps>;
}
