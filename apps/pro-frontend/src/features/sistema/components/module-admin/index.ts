// src/features/sistema/components/module-admin/index.ts
//
// Registro delle gestioni proprie dei moduli (F0): chiave del catalogo →
// gestioni, aperte da SISTEMA → Moduli (menu della riga e sezione Gestione
// della scheda). Un modulo nuovo con dati comuni a tutti i tenant = una voce
// qui, senza toccare la pagina. Come il registro delle impostazioni
// all'attivazione (tenant/config, ADR087).
import React from 'react';
import { Truck } from '@edg/ui';

import type { ModuleAdminDef } from './types';
import TipiFornitoreModal from './vigilo/TipiFornitoreModal';

export const MODULE_ADMIN: Record<string, ModuleAdminDef[]> = {
  vigilo: [
    {
      id: 'tipi-fornitore',
      label: 'Tipi di fornitore',
      description: 'Il catalogo comune a tutti i clienti: tipo di ogni fornitore e filtro dei resoconti.',
      icon: React.createElement(Truck, { className: 'h-4 w-4' }),
      Panel: TipiFornitoreModal,
    },
  ],
};

export const moduleAdminDefs = (key: string | undefined): ModuleAdminDef[] => (key ? (MODULE_ADMIN[key] ?? []) : []);

export type { ModuleAdminDef } from './types';
