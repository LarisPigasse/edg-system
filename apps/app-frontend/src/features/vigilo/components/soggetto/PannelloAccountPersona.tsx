// src/features/vigilo/components/soggetto/PannelloAccountPersona.tsx
//
// L'account collegato a una persona (B9b), nel pannello laterale: con il
// collegamento l'addetto vede le sue scadenze e i mezzi che usa, e la persona
// riceve gli avvisi in app. Un account a una sola persona: quelli già
// collegati ad altri si vedono ma non si scelgono.
import React, { useEffect, useState } from 'react';
import { Alert, Button, Select, Sheet, Skeleton, useToast } from '@edg/ui';

import { collegaAccount, leggiAccount } from '../../api/soggetti';
import type { AccountCollegabile, Soggetto } from '../../types/soggetti';

const NESSUNO = 'nessuno';

interface Props {
  s: Soggetto;
  aperto: boolean;
  onChiudi: () => void;
  onSalvato: () => void;
}

export const PannelloAccountPersona: React.FC<Props> = ({ s, aperto, onChiudi, onSalvato }) => {
  const toast = useToast();
  const [account, setAccount] = useState<AccountCollegabile[] | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [scelto, setScelto] = useState(NESSUNO);
  const [inCorso, setInCorso] = useState(false);

  useEffect(() => {
    if (!aperto) return;
    setScelto(s.account ? String(s.account.id) : NESSUNO);
    setAccount(null);
    leggiAccount()
      .then(a => {
        setAccount(a);
        setErrore(null);
      })
      .catch(e => setErrore((e as Error).message));
  }, [aperto, s.account]);

  const attuale = s.account ? String(s.account.id) : NESSUNO;
  const voce = account?.find(a => String(a.id) === scelto);

  const salva = async () => {
    setInCorso(true);
    try {
      await collegaAccount(s.uuid, scelto === NESSUNO ? null : Number(scelto));
      toast?.({
        title: scelto === NESSUNO ? 'Account scollegato' : 'Account collegato',
        description: scelto === NESSUNO ? `${s.nome} non ha più un account collegato.` : `${s.nome} è collegato a ${voce?.nome ?? 'l’account scelto'}.`,
      });
      onSalvato();
      onChiudi();
    } catch (e) {
      toast?.danger({ title: 'Collegamento non salvato', description: (e as Error).message });
    } finally {
      setInCorso(false);
    }
  };

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title='Account collegato'
      description={`${s.nome}: chi entra in Vigilo con questo account vede le sue scadenze e riceve gli avvisi in app.`}
      className='w-full! sm:max-w-lg!'
      footer={
        <>
          <Button variant='secondary' onClick={onChiudi} disabled={inCorso}>
            Annulla
          </Button>
          <Button onClick={() => void salva()} disabled={!account || scelto === attuale} isLoading={inCorso} loadingText='Salvo…'>
            Salva
          </Button>
        </>
      }
    >
      {errore ? (
        <Alert variant='danger' title='Account non letti'>
          {errore}
        </Alert>
      ) : !account ? (
        <Skeleton className='h-12 w-full' />
      ) : (
        <div className='space-y-4'>
          <Select
            label='Account'
            value={scelto}
            onValueChange={setScelto}
            options={[
              { value: NESSUNO, label: 'Nessuno' },
              ...account.map(a => {
                const altra = a.persona && a.persona.uuid !== s.uuid ? a.persona.nome : null;
                return {
                  value: String(a.id),
                  label: `${a.nome} · ${a.email}${a.addetto ? ' · addetto' : ''}${altra ? ` — già collegato a ${altra}` : ''}`,
                  disabled: !!altra,
                };
              }),
            ]}
          />
          {voce && !voce.addetto && (
            <p className='text-sm text-text-secondary'>
              Questo account ha già accesso a tutto Vigilo: il collegamento serve perché riceva in app gli avvisi delle scadenze di questa persona.
            </p>
          )}
          {voce?.addetto && (
            <p className='text-sm text-text-secondary'>
              È un addetto: vedrà soltanto le scadenze di questa persona e dei mezzi che ha assegnati, e potrà inserire i chilometri e caricare documenti.
            </p>
          )}
        </div>
      )}
    </Sheet>
  );
};
