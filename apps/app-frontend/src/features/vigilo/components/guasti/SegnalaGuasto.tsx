// src/features/vigilo/components/guasti/SegnalaGuasto.tsx
//
// "Segnala un guasto" (B10a, passo 8): pannello laterale con titolo,
// descrizione, "Blocca l'uso" ed "Entro il". La data parte dalla proposta
// (oggi se blocca l'uso, altrimenti tra i giorni del tenant) e la segue
// finché non la si cambia a mano. "Già riparato": dopo il salvataggio si
// apre il pannello del guasto direttamente sulla registrazione (onSegnalato).
import React, { useEffect, useState } from 'react';
import { Button, Checkbox, DatePicker, Input, Sheet, Switch, TextArea } from '@edg/ui';

import { useSegnalaGuasto } from '../../hooks/useSegnalaGuasto';
import { aGiorno, aggiungiGiorni, daGiorno, oggiLocale } from '../../utils/giorni';

/** Come il servizio (LIMITI_GUASTO) */
const TITOLO_MASSIMO = 160;
const DESCRIZIONE_MASSIMA = 4096;

interface Props {
  soggetto: { uuid: string; nome: string; identificativo?: string | null };
  aperto: boolean;
  /** Giorni proposti per riparare un guasto che non blocca l'uso (dal profilo) */
  giorniRiparazione: number;
  onChiudi: () => void;
  /** Dopo il salvataggio: la nuova scadenza e se è già riparata */
  onSegnalato: (uuid: string, giaRiparato: boolean) => void;
  /** L'addetto non registra: segnala la riparazione all'ufficio (B9c) */
  perAddetto?: boolean;
}

export const SegnalaGuasto: React.FC<Props> = ({ soggetto, aperto, giorniRiparazione, onChiudi, onSegnalato, perAddetto = false }) => {
  const g = useSegnalaGuasto();
  const oggi = oggiLocale();
  const proposta = (blocca: boolean) => (blocca ? oggi : aggiungiGiorni(oggi, giorniRiparazione));

  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [bloccaUso, setBloccaUso] = useState(false);
  const [scadeIl, setScadeIl] = useState(() => proposta(false));
  const [dataScelta, setDataScelta] = useState(false);
  const [giaRiparato, setGiaRiparato] = useState(false);

  // a ogni apertura si riparte da capo
  useEffect(() => {
    if (!aperto) return;
    setTitolo('');
    setDescrizione('');
    setBloccaUso(false);
    setScadeIl(aggiungiGiorni(oggiLocale(), giorniRiparazione));
    setDataScelta(false);
    setGiaRiparato(false);
  }, [aperto, giorniRiparazione]);

  const cambiaBlocco = (v: boolean) => {
    setBloccaUso(v);
    if (!dataScelta) setScadeIl(proposta(v));
  };

  const pronto = !!titolo.trim() && !!scadeIl && scadeIl >= oggi;

  const salva = async () => {
    if (!pronto) return;
    const r = await g.segnala(soggetto.uuid, { titolo: titolo.trim(), descrizione: descrizione.trim() || null, bloccaUso, scadeIl });
    if (r) {
      onChiudi();
      onSegnalato(r.uuid, giaRiparato);
    }
  };

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title='Segnala un guasto'
      description={[soggetto.nome, soggetto.identificativo].filter(Boolean).join(' · ')}
      className='w-full! sm:max-w-lg!'
      footer={
        <>
          <Button variant='secondary' onClick={onChiudi} disabled={g.inCorso}>
            Annulla
          </Button>
          <Button onClick={() => void salva()} disabled={!pronto} isLoading={g.inCorso} loadingText='Segnalo…'>
            {giaRiparato ? (perAddetto ? 'Segnala e continua' : 'Segnala e registra') : 'Segnala'}
          </Button>
        </>
      }
    >
      <form
        className='space-y-5'
        onSubmit={e => {
          e.preventDefault();
          void salva();
        }}
      >
        <Input label='Che cosa non va' value={titolo} onChange={e => setTitolo(e.target.value)} maxLength={TITOLO_MASSIMO} required helperText='Es. freni rumorosi, gomma forata, perdita d’olio' />
        <TextArea
          label='Descrizione'
          value={descrizione}
          onChange={e => setDescrizione(e.target.value)}
          maxLength={DESCRIZIONE_MASSIMA}
          minRows={2}
          autoResize
          helperText='Quando è successo, che cosa si sente o si vede.'
        />
        <Switch
          label='Blocca l’uso'
          description='Il mezzo passa a Sospeso finché il guasto non è riparato, e l’avviso all’ufficio è urgente.'
          checked={bloccaUso}
          onCheckedChange={v => cambiaBlocco(v === true)}
        />
        <DatePicker
          label='Da riparare entro il'
          value={scadeIl ? daGiorno(scadeIl) : undefined}
          onChange={d => {
            setScadeIl(d ? aGiorno(d) : '');
            setDataScelta(true);
          }}
          minDate={daGiorno(oggi)}
          required
          helperText={dataScelta ? undefined : bloccaUso ? 'Proposta: oggi, perché blocca l’uso' : `Proposta: tra ${giorniRiparazione} giorni`}
        />
        <div className='border-t border-border-thin pt-4'>
          <Checkbox
            label='Già riparato'
            description={
              perAddetto
                ? 'Dopo aver segnalato potrai dire subito che è stato riparato: l’ufficio lo conferma.'
                : 'Dopo aver segnalato si apre subito la registrazione della riparazione.'
            }
            checked={giaRiparato}
            onCheckedChange={v => setGiaRiparato(v === true)}
          />
        </div>
      </form>
    </Sheet>
  );
};
