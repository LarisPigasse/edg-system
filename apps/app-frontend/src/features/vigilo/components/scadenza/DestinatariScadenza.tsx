// src/features/vigilo/components/scadenza/DestinatariScadenza.tsx
//
// "Avvisi a" nel pannello della scadenza (B8d-3): chi riceve, con i nomi
// (ufficio come numero di persone, referente, assegnatari, indirizzi) e se i
// destinatari vengono dal controllo o sono solo di questa scadenza. Con
// vigilo.write, Modifica apre l'editor qui dentro: "Come il controllo"
// riporta l'eredità.
import React, { useEffect, useState } from 'react';
import { Button, Skeleton, Switch, cn } from '@edg/ui';

import { RUOLI_DESTINATARI, ruoliPer } from '../../constants/destinatari';
import { useDestinatariScadenza } from '../../hooks/useDestinatariScadenza';
import type { Destinatario, VoceAnteprima } from '../../types/destinatari';
import type { DettaglioScadenza } from '../../types/scadenze';
import { erroreDestinatari, ordinati, stessiDestinatari } from '../../utils/destinatari';
import { EditorDestinatari } from '../destinatari/EditorDestinatari';

const RUOLO: Record<VoceAnteprima['ruolo'], string> = {
  referente: 'referente',
  assegnatario: 'assegnatario',
  interessato: 'interessato',
  email: 'indirizzo aggiuntivo',
};

// ruolo senza nessuno dietro: "Assegnatario · nessuna assegnazione in corso"
const VUOTO: Record<VoceAnteprima['ruolo'], string> = {
  referente: 'nessuno indicato nella scheda',
  assegnatario: 'nessuna assegnazione in corso',
  interessato: 'non indicato',
  email: '',
};

/** "Mario Rossi · referente · in app" */
const Voce: React.FC<{ v: VoceAnteprima }> = ({ v }) => {
  const chi = v.ruolo === 'email' ? v.email : v.nome;
  const come = v.recapito === 'app' ? 'sul suo account' : v.recapito === 'email' && v.ruolo !== 'email' ? `per email (${v.email})` : null;
  const nessuno = v.recapito === 'nessuno';
  return (
    <li className={cn('text-sm', nessuno ? 'text-text-secondary' : 'text-text-primary')}>
      {chi ? (
        <>
          <span className='font-medium'>{chi}</span>
          <span className='text-text-secondary'> · {[RUOLO[v.ruolo], come].filter(Boolean).join(' · ')}</span>
          {nessuno && <span className='text-text-secondary'> · senza account né email: non lo riceve</span>}
        </>
      ) : (
        <>
          <span className='font-medium'>{v.ruolo === 'email' ? '' : RUOLI_DESTINATARI[v.ruolo].etichetta}</span>
          <span className='text-text-secondary'> · {VUOTO[v.ruolo]}</span>
        </>
      )}
    </li>
  );
};

export const DestinatariScadenza: React.FC<{ s: DettaglioScadenza; aperto: boolean; puoModificare: boolean }> = ({ s, aperto, puoModificare }) => {
  const d = useDestinatariScadenza(s.uuid, aperto);
  const a = d.anteprima;
  const [modifica, setModifica] = useState(false);
  const [comeControllo, setComeControllo] = useState(true);
  const [bozza, setBozza] = useState<Destinatario[]>([]);

  // a ogni apertura (o cambio di scadenza) si torna alla lettura
  useEffect(() => setModifica(false), [s.uuid, aperto]);

  const apri = () => {
    if (!a) return;
    setBozza(ordinati(a.destinatari));
    setComeControllo(a.origine !== 'scadenza');
    setModifica(true);
  };

  const conControllo = !!s.controllo;
  const ereditati = conControllo && comeControllo;
  const problema = ereditati ? null : erroreDestinatari(bozza);
  const cambiata = a ? (ereditati ? a.origine === 'scadenza' : a.origine !== 'scadenza' || !stessiDestinatari(bozza, a.destinatari)) : false;

  const salva = async () => {
    if (await d.salva(ereditati ? null : ordinati(bozza))) setModifica(false);
  };

  return (
    <section className='space-y-3 rounded-lg border border-border-default bg-bg-primary px-4 py-3'>
      <header className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
        <h3 className='text-sm font-semibold text-text-primary'>Avvisi a</h3>
        {a && !modifica && (
          <span className='text-xs text-text-secondary'>
            {a.origine === 'scadenza' ? 'solo per questa scadenza' : a.origine === 'controllo' ? 'come il controllo' : 'predefiniti'}
          </span>
        )}
        {a && puoModificare && !modifica && (
          <Button variant='link' size='sm' onClick={apri} className='ml-auto h-auto! p-0!'>
            Modifica
          </Button>
        )}
      </header>

      {d.errore && !a ? (
        <p className='text-sm text-text-danger'>{d.errore}</p>
      ) : !a ? (
        <Skeleton className='h-16 w-full' />
      ) : modifica ? (
        <div className='space-y-4'>
          {conControllo && (
            <Switch
              label='Come il controllo'
              description={
                ereditati
                  ? `Gli avvisi seguono il controllo "${s.controllo!.nome}": se lo cambi in Configurazione, cambiano anche qui.`
                  : 'Destinatari solo per questa scadenza.'
              }
              checked={comeControllo}
              onCheckedChange={v => {
                setComeControllo(v);
                if (!v) setBozza(ordinati(a.destinatari));
              }}
            />
          )}
          {!ereditati && <EditorDestinatari valore={bozza} onCambia={setBozza} ruoli={ruoliPer(s.soggetto?.tipo ?? null)} disabilitato={d.inCorso} />}
          {problema && <p className='text-sm font-medium text-text-danger'>{problema}</p>}
          <div className='flex justify-end gap-2'>
            <Button variant='secondary' onClick={() => setModifica(false)} disabled={d.inCorso}>
              Annulla
            </Button>
            <Button onClick={() => void salva()} disabled={!cambiata || !!problema} isLoading={d.inCorso} loadingText='Salvo…'>
              Salva
            </Button>
          </div>
        </div>
      ) : (
        <ul className='space-y-1'>
          {a.ufficio && (
            <li className='text-sm text-text-primary'>
              <span className='font-medium'>Ufficio</span>
              {a.ufficioPersone !== null && (
                <span className='text-text-secondary'>
                  {' '}
                  · {a.ufficioPersone} {a.ufficioPersone === 1 ? 'persona' : 'persone'}
                </span>
              )}
            </li>
          )}
          {a.voci.map((v, i) => (
            <Voce key={`${v.ruolo}-${v.nome ?? v.email ?? i}`} v={v} />
          ))}
          {a.soloUfficio && (
            <li className='pt-1 text-sm text-text-secondary'>Il soggetto è sospeso: finché non torna attivo, gli avvisi vanno solo all'ufficio.</li>
          )}
          {!a.ufficio && !a.voci.length && !a.soloUfficio && <li className='text-sm text-text-secondary'>Nessuno.</li>}
        </ul>
      )}
    </section>
  );
};
