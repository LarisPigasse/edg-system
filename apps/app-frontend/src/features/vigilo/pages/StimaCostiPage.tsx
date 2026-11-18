// src/features/vigilo/pages/StimaCostiPage.tsx
//
// Stima dei costi di un servizio (2026-11-17): un'idea approssimata dei costi
// di un trasporto (a km) o di un lavoro (a ore) prima di accettarlo, dai costi
// dei mezzi di Vigilo, dal costo orario delle persone e da parametri inseriti
// a mano. Solo per l'ufficio che vede i costi. Schede: Nuova stima, Stime
// salvate (con il costo reale e lo scostamento) e Parametri. La nuova stima
// vive qui (useStima), così resta cambiando scheda; "Duplica come nuova" da
// una stima salvata la carica e torna su Nuova stima.
import React, { useState } from 'react';
import { PageHeader, Tabs } from '@edg/ui';

import { NuovaStima } from '../components/stima/NuovaStima';
import { ParametriStima } from '../components/stima/ParametriStima';
import { StimeSalvate } from '../components/stima/StimeSalvate';
import { useStima } from '../hooks/useStima';
import type { StimaSalvata } from '../types/stima';
import { moduloDa } from '../utils/moduloStima';

const StimaCostiPage: React.FC = () => {
  const s = useStima();
  // le schede scelgono la scheda solo all'apertura: per spostarsi da qui si rimontano (giro)
  const [scheda, setScheda] = useState({ id: 'nuova', giro: 0 });

  const duplica = (st: StimaSalvata) => {
    s.carica(moduloDa(st.dati, `${st.descrizione} (copia)`.slice(0, 128)));
    setScheda(x => ({ id: 'nuova', giro: x.giro + 1 }));
  };

  return (
    <div className='space-y-6'>
      <PageHeader title='Stima costi' subtitle='Un’idea dei costi di un servizio a km o a ore: mezzo, conducente, pedaggi e costi aziendali.' />
      <Tabs
        key={scheda.giro}
        items={[
          { id: 'nuova', label: 'Nuova stima', content: <NuovaStima s={s} /> },
          { id: 'salvate', label: 'Stime salvate', content: <StimeSalvate onDuplica={duplica} /> },
          { id: 'parametri', label: 'Parametri', content: <ParametriStima /> },
        ]}
        defaultTab={scheda.id}
        onTabChange={id => setScheda(x => ({ ...x, id }))}
      />
    </div>
  );
};

export default StimaCostiPage;
