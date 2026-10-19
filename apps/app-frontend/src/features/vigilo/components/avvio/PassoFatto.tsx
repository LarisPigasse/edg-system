// src/features/vigilo/components/avvio/PassoFatto.tsx
//
// Passo 4: l'esito e il passo successivo naturale. Al primo avvio è il primo
// soggetto (la dashboard resterebbe vuota); dopo "Aggiungi dalla libreria"
// si torna alla Configurazione.
import React from 'react';
import { Button, CheckCircle } from '@edg/ui';

import type { EsitoAvvio } from '../../types/avvio';

interface Props {
  esito: EsitoAvvio;
  /** Percorso da aprire */
  onVai: (percorso: string) => void;
}

export const PassoFatto: React.FC<Props> = ({ esito, onVai }) => {
  const vuoto = esito.categorieCreate === 0 && esito.controlliCreati === 0;
  const voci = [
    esito.categorieCreate > 0 && `${esito.categorieCreate} ${esito.categorieCreate === 1 ? 'categoria' : 'categorie'}`,
    esito.controlliCreati > 0 && `${esito.controlliCreati} ${esito.controlliCreati === 1 ? 'controllo' : 'controlli'}`,
  ].filter(Boolean);

  return (
    <section className='mx-auto flex max-w-xl flex-col items-center gap-4 py-8 text-center'>
      <span className='rounded-full bg-bg-selected p-4 text-text-success'>
        <CheckCircle className='h-10 w-10' aria-hidden />
      </span>
      <h2 className='text-2xl font-semibold text-text-primary'>
        {esito.primoAvvio ? 'Vigilo è pronto' : vuoto ? 'Nessuna voce nuova' : 'Voci aggiunte'}
      </h2>
      <p className='text-text-secondary'>
        {vuoto
          ? esito.primoAvvio
            ? 'Parti da zero: potrai creare categorie e controlli, o aggiungerli dalla libreria, quando vuoi.'
            : 'Le voci scelte erano già presenti.'
          : `Hai ${voci.join(' e ')} pronti all'uso.`}
        {esito.scadenzeCreate > 0 &&
          ` Sono già state create ${esito.scadenzeCreate} scadenze per ciò che avevi inserito.`}
      </p>
      {esito.primoAvvio && (
        <p className='text-sm text-text-secondary'>
          Il passo successivo è inserire i soggetti da tenere sotto controllo: veicoli, persone, sedi…
        </p>
      )}
      <div className='flex flex-wrap items-center justify-center gap-3'>
        <Button size='lg' variant='secondary' onClick={() => onVai('/vigilo')}>
          Vai alla Dashboard
        </Button>
        {esito.primoAvvio ? (
          <Button size='lg' onClick={() => onVai('/vigilo/soggetti/nuovo')}>
            Aggiungi il primo soggetto
          </Button>
        ) : (
          <Button size='lg' onClick={() => onVai('/vigilo/configurazione')}>
            Vai alla Configurazione
          </Button>
        )}
      </div>
    </section>
  );
};
