// src/features/vigilo/components/avvisi/PreferenzeVigilo.tsx
//
// Le preferenze degli avvisi di Vigilo, autonome: leggono e salvano da sé.
// Le mostra la pagina Vigilo › Avvisi e, tramite il manifest (settings), la
// pagina della piattaforma /avvisi (B8d-1 bis).
import React from 'react';
import { useAuth } from '@edg/auth';

import { usePreferenzeAvvisi } from '../../hooks/usePreferenzeAvvisi';
import { PreferenzeAvvisi } from './PreferenzeAvvisi';

const PreferenzeVigilo: React.FC = () => {
  const { account } = useAuth();
  const p = usePreferenzeAvvisi();
  return <PreferenzeAvvisi p={p} email={account?.email ?? null} />;
};

export default PreferenzeVigilo;
