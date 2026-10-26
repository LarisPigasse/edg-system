// src/features/vigilo/components/configurazione/PannelloRegoleAvvisi.tsx
//
// Le regole degli avvisi del tenant nel pannello laterale (B8d-2): orario del
// riepilogo, giorni lavorativi, richiamo delle scadute e silenzio notturno.
// I limiti sono quelli che manda il servizio; sotto, la frase che riassume
// le regole mentre si cambiano. A ogni apertura si riparte da quelle in vigore.
import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Select, Sheet, Switch, TimePicker } from '@edg/ui';

import { GIORNI_BREVI, RICHIAMI } from '../../constants/avvisi';
import type { RegoleAvvisi, SchedaRegoleAvvisi } from '../../types/impostazioni';
import {
  SILENZIO_SPENTO,
  aOrario,
  conSilenzio,
  daOrario,
  durataSilenzio,
  erroriRegole,
  fraseDurata,
  fraseRegole,
  fraseRichiamo,
  stesseRegole,
} from '../../utils/regoleAvvisi';

interface Props {
  scheda: SchedaRegoleAvvisi;
  aperto: boolean;
  inCorso: boolean;
  onChiudi: () => void;
  onSalva: (r: RegoleAvvisi) => Promise<boolean>;
  onRipristina: () => Promise<boolean>;
}

const Sezione: React.FC<{ titolo: string; descrizione?: string; children: React.ReactNode }> = ({ titolo, descrizione, children }) => (
  <section className='space-y-3'>
    <header>
      <h3 className='text-sm font-semibold text-text-primary'>{titolo}</h3>
      {descrizione && <p className='mt-0.5 text-sm text-text-secondary'>{descrizione}</p>}
    </header>
    {children}
  </section>
);

export const PannelloRegoleAvvisi: React.FC<Props> = ({ scheda, aperto, inCorso, onChiudi, onSalva, onRipristina }) => {
  const [r, setR] = useState<RegoleAvvisi>(scheda.regole);

  // a ogni apertura si riparte dalle regole in vigore
  useEffect(() => {
    if (aperto) setR(scheda.regole);
  }, [aperto, scheda.regole]);

  const cambia = (p: Partial<RegoleAvvisi>) => setR(x => ({ ...x, ...p }));
  const l = scheda.limiti;
  const errori = erroriRegole(r, l);
  const valide = !Object.keys(errori).length;
  const modificate = !stesseRegole(r, scheda.regole);
  const silenzio = conSilenzio(r);

  const giorno = (g: number, dentro: boolean) =>
    cambia({ giorniLavorativi: dentro ? [...new Set([...r.giorniLavorativi, g])].sort((a, b) => a - b) : r.giorniLavorativi.filter(x => x !== g) });

  // il valore salvato resta fra le scelte anche se non è una potenza di 2
  const richiami = [...new Set([...RICHIAMI, r.intervalloRichiami])].sort((a, b) => a - b);

  const salva = async () => {
    if (await onSalva(r)) onChiudi();
  };
  const ripristina = async () => {
    if (await onRipristina()) onChiudi();
  };

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title='Regole degli avvisi'
      description='Valgono per tutta la tua azienda; ognuno sceglie poi come riceverli in "I miei avvisi".'
      className='w-full! sm:max-w-lg!'
      footer={
        <>
          <Button variant='secondary' onClick={() => void ripristina()} disabled={inCorso || !scheda.modificate} className='sm:mr-auto'>
            Ripristina i predefiniti
          </Button>
          <Button variant='secondary' onClick={onChiudi} disabled={inCorso}>
            Annulla
          </Button>
          <Button onClick={() => void salva()} disabled={!modificate || !valide} isLoading={inCorso} loadingText='Salvo…'>
            Salva
          </Button>
        </>
      }
    >
      <div className='space-y-8'>
        <Sezione titolo='Riepilogo' descrizione="L'email con gli avvisi del giorno, solo se c'è qualcosa.">
          <TimePicker
            label='Orario'
            format='24h'
            step={15}
            value={daOrario(r.orarioRiepilogo)}
            onChange={t => t && cambia({ orarioRiepilogo: aOrario(t) })}
            minTime={daOrario(l.orarioRiepilogo.min)}
            maxTime={daOrario(l.orarioRiepilogo.max)}
            error={errori.orario}
            helperText={errori.orario ? undefined : `Fra le ${l.orarioRiepilogo.min} e le ${l.orarioRiepilogo.max}`}
          />
        </Sezione>

        <Sezione titolo='Giorni lavorativi' descrizione='I giorni del riepilogo; il settimanale parte il primo della settimana.'>
          <div className='flex flex-wrap gap-x-5 gap-y-2'>
            {GIORNI_BREVI.map((nome, i) => (
              <Checkbox key={nome} label={nome} checked={r.giorniLavorativi.includes(i + 1)} onCheckedChange={v => giorno(i + 1, v === true)} />
            ))}
          </div>
          {errori.giorni && <p className='text-sm font-medium text-text-danger'>{errori.giorni}</p>}
        </Sezione>

        <Sezione titolo='Richiamo delle scadute' descrizione='Finché una scadenza scaduta non si sistema, Vigilo la ricorda di nuovo.'>
          <Select
            label='Richiamo'
            value={String(r.intervalloRichiami)}
            onValueChange={v => cambia({ intervalloRichiami: Number(v) })}
            options={richiami.map(n => ({ value: String(n), label: n ? `${fraseRichiamo(n).charAt(0).toUpperCase()}${fraseRichiamo(n).slice(1)}` : 'Nessun richiamo' }))}
          />
        </Sezione>

        <Sezione titolo='Silenzio notturno'>
          <Switch
            label='Niente email di notte'
            description='Le email "subito" aspettano la fine del silenzio. Spento, partono a qualunque ora.'
            checked={silenzio}
            onCheckedChange={v => cambia({ silenzio: v ? { ...scheda.predefinite.silenzio } : { ...SILENZIO_SPENTO } })}
          />
          {silenzio && (
            <>
              <div className='grid grid-cols-2 gap-4'>
                <TimePicker label='Dalle' format='24h' step={15} value={daOrario(r.silenzio.dalle)} onChange={t => t && cambia({ silenzio: { ...r.silenzio, dalle: aOrario(t) } })} />
                <TimePicker label='Alle' format='24h' step={15} value={daOrario(r.silenzio.alle)} onChange={t => t && cambia({ silenzio: { ...r.silenzio, alle: aOrario(t) } })} />
              </div>
              <p className={errori.silenzio ? 'text-sm font-medium text-text-danger' : 'text-sm text-text-secondary'}>
                {errori.silenzio ?? `Dura ${fraseDurata(durataSilenzio(r))}, al massimo ${fraseDurata(l.silenzioMassimoMinuti)}.`}
              </p>
            </>
          )}
        </Sezione>

        <div className='rounded-lg bg-bg-secondary p-3 text-sm text-text-secondary'>
          <span className='font-medium text-text-primary'>In breve: </span>
          {fraseRegole(r)}.
        </div>
      </div>
    </Sheet>
  );
};
