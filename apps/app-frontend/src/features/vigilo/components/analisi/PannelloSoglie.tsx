// src/features/vigilo/components/analisi/PannelloSoglie.tsx
//
// Le soglie dei segnali (2026-11-23, fase D, vigilo.config): sette numeri
// interi entro limiti invalicabili, con che cosa fanno scattare e il valore
// iniziale; "Ripristina i valori iniziali". Salvando, l'analisi si ricalcola.
import React, { useEffect, useState } from 'react';
import { Button, Input, Sheet, useToast } from '@edg/ui';

import { cambiaSoglie } from '../../api/analisi';
import { SOGLIE_ANALISI } from '../../constants/analisi';
import type { Analisi, SoglieAnalisi } from '../../types/analisi';

interface Props {
  aperto: boolean;
  dati: Analisi;
  onChiudi: () => void;
  onSalvate: (a: Analisi) => void;
}

const testo = (n: number) => String(n);

export const PannelloSoglie: React.FC<Props> = ({ aperto, dati, onChiudi, onSalvate }) => {
  // solo le soglie che il servizio conosce: se è di una versione precedente, il pannello non cade
  const voci = SOGLIE_ANALISI.filter(s => dati.limitiSoglie[s.chiave] && dati.soglie[s.chiave] !== undefined);
  const [valori, setValori] = useState<Record<keyof SoglieAnalisi, string>>({} as Record<keyof SoglieAnalisi, string>);
  const [salvo, setSalvo] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (aperto) setValori(Object.fromEntries(voci.map(s => [s.chiave, testo(dati.soglie[s.chiave])])) as Record<keyof SoglieAnalisi, string>);
    // voci dipende da dati: basta seguire le soglie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aperto, dati.soglie]);

  const errore = (k: keyof SoglieAnalisi) => {
    const l = dati.limitiSoglie[k];
    const n = Number(valori[k]);
    return valori[k]?.trim() === '' || !Number.isInteger(n) || n < l.min || n > l.max ? `Un numero intero da ${l.min} a ${l.max.toLocaleString('it-IT')}` : undefined;
  };
  const valide = voci.every(s => !errore(s.chiave));

  const salva = async () => {
    setSalvo(true);
    try {
      onSalvate(await cambiaSoglie(Object.fromEntries(voci.map(s => [s.chiave, Number(valori[s.chiave])]))));
      toast?.({ title: 'Soglie salvate', description: 'I segnali sono stati ricalcolati.' });
      onChiudi();
    } catch (e) {
      toast?.danger({ title: 'Soglie non salvate', description: (e as Error).message });
    } finally {
      setSalvo(false);
    }
  };

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title='Soglie dei segnali'
      description='Quando un indicatore supera una soglia, compare un segnale in “Da valutare”.'
      className='w-full! sm:max-w-xl!'
      footer={
        <>
          <Button
            variant='outline'
            onClick={() => setValori(Object.fromEntries(voci.map(s => [s.chiave, testo(dati.sogliePredefinite[s.chiave])])) as Record<keyof SoglieAnalisi, string>)}
            disabled={salvo}
          >
            Ripristina i valori iniziali
          </Button>
          <Button onClick={() => void salva()} disabled={!valide} isLoading={salvo} loadingText='Salvo…'>
            Salva
          </Button>
        </>
      }
    >
      <div className='grid gap-x-4 gap-y-5 sm:grid-cols-2'>
        {voci.map(s => (
          <Input
            key={s.chiave}
            label={s.nome}
            inputMode='numeric'
            value={valori[s.chiave] ?? ''}
            onChange={e => setValori(v => ({ ...v, [s.chiave]: e.target.value }))}
            error={errore(s.chiave)}
            helperText={`${s.aiuto} Iniziale: ${dati.sogliePredefinite[s.chiave].toLocaleString('it-IT')}.`}
          />
        ))}
      </div>
    </Sheet>
  );
};
