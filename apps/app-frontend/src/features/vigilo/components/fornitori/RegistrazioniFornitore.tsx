// src/features/vigilo/components/fornitori/RegistrazioniFornitore.tsx
//
// Le registrazioni che citano il fornitore, dalla più recente (F1): data,
// soggetto (porta alla sua scheda), scadenza, che cosa e dettagli (senza
// ripetere il fornitore). A pagine da 8 con "Mostra altre".
import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Skeleton } from '@edg/ui';

import { useRegistrazioniFornitore } from '../../hooks/useRegistrazioniFornitore';
import { giornoBreve } from '../../utils/giorni';
import { dettagliRegistrazione, descrizioneRegistrazione } from '../../utils/registrazioni';

export const RegistrazioniFornitore: React.FC<{ fornitore: string }> = ({ fornitore }) => {
  const st = useRegistrazioniFornitore(fornitore);

  if (st.errore)
    return (
      <Alert variant='danger' title='Impossibile leggere le registrazioni'>
        {st.errore}
      </Alert>
    );
  if (st.caricamento && st.righe.length === 0) return <Skeleton className='h-24 w-full' />;
  if (st.righe.length === 0) return <p className='text-sm text-text-secondary'>Nessuna registrazione lo cita finora.</p>;

  return (
    <div className='space-y-3'>
      <ul className='divide-y divide-border-default rounded-lg border border-border-default'>
        {st.righe.map(r => {
          const dettagli = dettagliRegistrazione({ ...r, fornitore: null });
          return (
            <li key={r.uuid} className='space-y-1 px-4 py-3'>
              <div className='flex items-baseline justify-between gap-3'>
                {r.soggetto ? (
                  <Link to={`/vigilo/soggetti/${r.soggetto.uuid}`} className='min-w-0 truncate font-medium text-text-link hover:underline'>
                    {r.soggetto.nome}
                    {r.soggetto.identificativo && <span className='ml-2 font-mono text-xs text-text-secondary'>{r.soggetto.identificativo}</span>}
                  </Link>
                ) : (
                  <span className='font-medium text-text-primary'>—</span>
                )}
                <span className='shrink-0 text-sm text-text-secondary'>{giornoBreve(r.eseguitaIl)}</span>
              </div>
              <p className='text-sm text-text-primary'>
                {r.scadenza?.titolo ?? 'Scadenza'}
                <span className={r.esito === 'negativo' ? 'font-semibold text-orange-700 [.dark_&]:text-orange-400' : 'text-text-secondary'}>
                  {' · '}
                  {descrizioneRegistrazione(r)}
                </span>
              </p>
              {dettagli && <p className='text-xs text-text-secondary'>{dettagli}</p>}
            </li>
          );
        })}
      </ul>
      {st.altre && (
        <div className='flex justify-center'>
          <Button size='sm' variant='secondary' onClick={() => void st.mostraAltre()} isLoading={st.caricamento} loadingText='Carico…'>
            Mostra altre ({st.totale - st.righe.length})
          </Button>
        </div>
      )}
    </div>
  );
};
