// src/features/vigilo/components/avvio/PassoVoci.tsx
//
// Passo 2: che cosa includere, una scheda per tipo di soggetto con il
// conteggio "inclusi/proposti" sempre aggiornato.
import React from 'react';
import { Tabs, cn, type TabItem } from '@edg/ui';

import { TIPI } from '../../constants/tipiSoggetto';
import type { Proposta } from '../../types/avvio';
import type { ConteggioTipo, Selezione } from '../../utils/selezione';
import { SezioneTipo } from './SezioneTipo';

interface Props {
  proposta: Proposta;
  selezione: Selezione;
  perTipo: ConteggioTipo[];
  onCategorie: (chiavi: string[], dentro: boolean) => void;
  onControlli: (chiavi: string[], dentro: boolean) => void;
}

export const PassoVoci: React.FC<Props> = ({ proposta, selezione, perTipo, onCategorie, onControlli }) => {
  const schede: TabItem[] = proposta.tipi.map(g => {
    const n = perTipo.find(x => x.tipo === g.tipo);
    return {
      id: g.tipo,
      icon: TIPI[g.tipo].icona,
      label: (
        <span className='inline-flex items-center gap-2'>
          {TIPI[g.tipo].plurale}
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
              n && n.inclusi > 0 ? 'bg-bg-selected text-text-link' : 'bg-bg-secondary text-text-secondary'
            )}
          >
            {n?.inclusi ?? 0}/{n?.totale ?? 0}
          </span>
        </span>
      ),
      content: <SezioneTipo gruppo={g} proposta={proposta} selezione={selezione} onCategorie={onCategorie} onControlli={onControlli} />,
    };
  });

  return (
    <section className='space-y-4'>
      <div>
        <h2 className='text-lg font-semibold text-text-primary'>Che cosa includere</h2>
        <p className='text-sm text-text-secondary'>
          Sono già spuntate le voci consigliate. Tutto ciò che includi resta modificabile in seguito, e ciò che togli si
          potrà aggiungere dalla libreria quando vuoi.
        </p>
      </div>
      {schede.length ? (
        <Tabs items={schede} defaultTab={schede[0].id} />
      ) : (
        <p className='rounded-lg border border-dashed border-border-default p-6 text-center text-text-secondary'>
          I settori scelti non propongono voci.
        </p>
      )}
    </section>
  );
};
