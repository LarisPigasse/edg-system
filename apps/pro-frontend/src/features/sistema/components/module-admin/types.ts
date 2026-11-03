// src/features/sistema/components/module-admin/types.ts
import type React from 'react';

/** Una gestione propria di un modulo, aperta dal catalogo dei moduli (solo root) */
export interface ModuleAdminDef {
  id: string;
  label: string;
  /** Una riga per la sezione Gestione della scheda del modulo */
  description: string;
  icon: React.ReactNode;
  Panel: React.FC<{ isOpen: boolean; onClose: () => void }>;
}
