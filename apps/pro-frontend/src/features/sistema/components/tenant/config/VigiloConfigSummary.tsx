// src/features/sistema/components/tenant/config/VigiloConfigSummary.tsx
//
// Impostazioni di Vigilo in una riga, sotto l'attivazione (ADR087):
// "Prepara EDG · Renato Casalena · Base aziendale, Autotrasporto merci".
import React from 'react';

import { useOperatoriEdg } from '../../../../base/api/useOperatoriEdg';
import { leggiVigiloConfig, useModelliLibreria } from './vigiloConfig';
import type { ModuleConfig } from './types';

const VigiloConfigSummary: React.FC<{ value: ModuleConfig }> = ({ value }) => {
  const c = leggiVigiloConfig(value);
  const { operatoreName } = useOperatoriEdg();
  const modelli = useModelliLibreria();
  const nomi = c.modelli.map(k => modelli.find(m => m.chiave === k)?.nome ?? k);
  const parti = [
    c.preparazione === 'edg' ? 'Prepara EDG' : 'Prepara il cliente',
    c.preparazione === 'edg' ? (operatoreName(c.idOperatore) ?? 'operatore da scegliere') : null,
    nomi.length > 0 ? nomi.join(', ') : 'nessun settore suggerito',
  ].filter(Boolean);
  return <>{parti.join(' · ')}</>;
};

export default VigiloConfigSummary;
