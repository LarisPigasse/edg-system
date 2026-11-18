// src/features/vigilo/components/stima/PannelloParametriStima.tsx
//
// I parametri generali della stima dei costi (2026-11-17) nel pannello
// laterale: costo orario del conducente, velocità media, ore di guida al
// giorno, diaria e pedaggio per km. Tutti modificabili entro i limiti del
// servizio; costo orario, diaria e pedaggio si possono lasciare vuoti.
import React, { useEffect, useState } from 'react';
import { Button, Input, Sheet } from '@edg/ui';

import type { Limite, ParametriStima, RegoleStima } from '../../types/stima';
import { importo } from '../../utils/numeri';

interface Props {
  parametri: ParametriStima;
  aperto: boolean;
  inCorso: boolean;
  onChiudi: () => void;
  onSalva: (modifica: Partial<RegoleStima>) => Promise<boolean>;
}

type Chiave = keyof RegoleStima;

const CAMPI: { chiave: Chiave; etichetta: string; aiuto: string; facoltativo: boolean }[] = [
  { chiave: 'costoOrarioConducente', etichetta: 'Costo orario del conducente (€/h)', aiuto: 'Per il conducente o l’operatore quando nella stima non si sceglie una persona.', facoltativo: true },
  { chiave: 'velocitaMedia', etichetta: 'Velocità media (km/h)', aiuto: 'Per le ore di guida di un servizio a km.', facoltativo: false },
  { chiave: 'oreGuidaGiorno', etichetta: 'Ore di guida al giorno', aiuto: 'Oltre, il servizio dura un altro giorno (limite di legge: 9).', facoltativo: false },
  { chiave: 'diaria', etichetta: 'Diaria per pernottamento (€)', aiuto: 'Per ogni notte fuori sede del conducente.', facoltativo: true },
  { chiave: 'pedaggioKm', etichetta: 'Pedaggio per km autostradale (€/km)', aiuto: 'Per stimare i pedaggi dai km in autostrada, es. 0,16.', facoltativo: true },
];

const testo = (n: number | null) => (n == null ? '' : n.toLocaleString('it-IT'));

export const PannelloParametriStima: React.FC<Props> = ({ parametri, aperto, inCorso, onChiudi, onSalva }) => {
  const [valori, setValori] = useState<Record<Chiave, string>>({} as Record<Chiave, string>);

  useEffect(() => {
    if (!aperto) return;
    setValori(Object.fromEntries(CAMPI.map(c => [c.chiave, testo(parametri.generali[c.chiave])])) as Record<Chiave, string>);
  }, [aperto, parametri]);

  const errore = (c: (typeof CAMPI)[number]): string | undefined => {
    const v = importo(valori[c.chiave] ?? '');
    const l: Limite = parametri.limiti[c.chiave];
    if (v === null) return c.facoltativo ? undefined : 'Obbligatorio';
    return Number.isNaN(v) || v < l.min || v > l.max ? `Da ${testo(l.min)} a ${testo(l.max)}` : undefined;
  };
  const pronto = CAMPI.every(c => !errore(c));

  const salva = async () => {
    const modifica: Partial<RegoleStima> = {};
    for (const c of CAMPI) {
      const v = importo(valori[c.chiave] ?? '');
      if (v !== parametri.generali[c.chiave]) (modifica as Record<Chiave, number | null>)[c.chiave] = v;
    }
    if (!Object.keys(modifica).length || (await onSalva(modifica))) onChiudi();
  };

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title='Parametri della stima'
      description='Conducente, tempi di guida e pedaggi'
      className='w-full! sm:max-w-lg!'
      footer={
        <>
          <Button variant='secondary' onClick={onChiudi} disabled={inCorso}>
            Annulla
          </Button>
          <Button onClick={() => void salva()} disabled={!pronto} isLoading={inCorso} loadingText='Salvo…'>
            Salva
          </Button>
        </>
      }
    >
      <div className='space-y-5'>
        {CAMPI.map(c => (
          <Input
            key={c.chiave}
            label={c.etichetta}
            inputMode='decimal'
            value={valori[c.chiave] ?? ''}
            onChange={e => setValori(v => ({ ...v, [c.chiave]: e.target.value }))}
            error={errore(c)}
            required={!c.facoltativo}
            helperText={`${c.aiuto}${parametri.iniziali[c.chiave] != null ? ` Valore iniziale ${testo(parametri.iniziali[c.chiave])}.` : ''}`}
          />
        ))}
      </div>
    </Sheet>
  );
};
