// src/features/vigilo/components/stima/DettaglioStima.tsx
//
// Una stima salvata nel pannello laterale (2026-11-18, fase 3): la
// scomposizione con i valori di allora, il costo reale dopo il servizio (con
// note, chi e quando) e lo scostamento in euro e in percentuale, il PDF e
// "Duplica come nuova", che la riapre nella scheda Nuova stima.
import React, { useEffect, useState } from 'react';
import { Button, Copy, FileText, Input, Sheet, TextArea, exportReportToPdf, useToast } from '@edg/ui';

import type { StimaSalvata } from '../../types/stima';
import { aGiorno, giornoBreve } from '../../utils/giorni';
import { importo } from '../../utils/numeri';
import { stimaPdf } from '../../utils/pdfStima';
import { euroCentesimi } from '../../utils/resoconti';
import { ScomposizioneStima } from './ScomposizioneStima';
import { TestoScostamento } from './TestoScostamento';

interface Props {
  stima: StimaSalvata | null;
  inCorso: boolean;
  onChiudi: () => void;
  onReale: (uuid: string, costo: number | null, note: string | null) => Promise<boolean>;
  onDuplica: (s: StimaSalvata) => void;
}

const quando = (iso: string) => giornoBreve(aGiorno(new Date(iso)));

export const DettaglioStima: React.FC<Props> = ({ stima: s, inCorso, onChiudi, onReale, onDuplica }) => {
  const [costo, setCosto] = useState('');
  const [note, setNote] = useState('');
  const toast = useToast();

  useEffect(() => {
    // "1.250,50": come si scrive (il punto delle migliaia sempre, i centesimi)
    setCosto(s?.costoReale != null ? s.costoReale.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' } as unknown as Intl.NumberFormatOptions) : '');
    setNote(s?.noteReale ?? '');
  }, [s]);

  const valore = importo(costo);
  const errore = valore !== null && Number.isNaN(valore) ? 'Un importo in euro, es. 1.250,50' : undefined;

  const pdf = () => {
    if (!s) return;
    try {
      exportReportToPdf(stimaPdf({ usati: s.usati, risultato: s.risultato }, s.descrizione, aGiorno(new Date(s.salvataIl))));
    } catch (e) {
      toast?.danger({ title: 'PDF non creato', description: (e as Error).message });
    }
  };

  return (
    <Sheet
      isOpen={!!s}
      onOpenChange={o => !o && onChiudi()}
      title={s?.descrizione ?? 'Stima'}
      description={s ? [`Salvata: ${quando(s.salvataIl)}`, s.salvataDa && `da ${s.salvataDa}`, 'valori di allora'].filter(Boolean).join(' · ') : undefined}
      className='w-full! sm:max-w-xl!'
      footer={
        s && (
          <>
            <Button variant='outline' leftIcon={<FileText className='h-4 w-4' />} onClick={pdf}>
              PDF
            </Button>
            <Button variant='outline' leftIcon={<Copy className='h-4 w-4' />} onClick={() => onDuplica(s)}>
              Duplica come nuova
            </Button>
          </>
        )
      }
    >
      {s && (
        <div className='space-y-6'>
          <ScomposizioneStima calcolo={{ usati: s.usati, risultato: s.risultato }} />

          {/* dopo il servizio: quanto è costato davvero */}
          <section className='space-y-3 rounded-lg border border-border-default p-4'>
            <h3 className='text-sm font-semibold'>Costo reale</h3>
            {s.costoReale != null && (
              <p className='text-sm'>
                {euroCentesimi(s.costoReale)} · <TestoScostamento scostamento={s.scostamento} />
                {s.realeIl && (
                  <span className='block text-xs text-text-secondary'>{[`Scritto: ${quando(s.realeIl)}`, s.realeDa && `da ${s.realeDa}`].filter(Boolean).join(' · ')}</span>
                )}
              </p>
            )}
            <Input label='Costo reale (€)' inputMode='decimal' value={costo} onChange={e => setCosto(e.target.value)} error={errore} helperText='Dopo il servizio: quanto è costato davvero.' />
            <TextArea label='Note' value={note} onChange={e => setNote(e.target.value)} maxLength={1024} minRows={1} autoResize />
            <div className='flex justify-end gap-2'>
              {s.costoReale != null && (
                <Button variant='outline' size='sm' onClick={() => void onReale(s.uuid, null, null)} disabled={inCorso}>
                  Togli
                </Button>
              )}
              <Button size='sm' onClick={() => void onReale(s.uuid, valore, note.trim() || null)} disabled={valore === null || !!errore} isLoading={inCorso} loadingText='Salvo…'>
                Salva il costo reale
              </Button>
            </div>
          </section>
        </div>
      )}
    </Sheet>
  );
};
