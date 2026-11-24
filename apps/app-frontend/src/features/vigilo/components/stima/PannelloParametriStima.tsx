// src/features/vigilo/components/stima/PannelloParametriStima.tsx
//
// I parametri generali della stima dei costi (2026-11-17) nel pannello
// laterale: costo orario del conducente, velocità media, ore di guida al
// giorno, diaria, pedaggio per km e ore di impiego annue di un mezzo. Tutti modificabili entro i limiti del
// servizio; costo orario, diaria e pedaggio si possono lasciare vuoti.
import React, { useEffect, useState } from 'react';
import { Button, Input, Sheet } from '@edg/ui';

import type { Limite, ParametriStima, RegoleStima } from '../../types/stima';
import { importo, testoNumero } from '../../utils/numeri';

interface Props {
  parametri: ParametriStima;
  aperto: boolean;
  inCorso: boolean;
  onChiudi: () => void;
  onSalva: (modifica: Partial<RegoleStima>) => Promise<boolean>;
}

type Chiave = keyof RegoleStima;

const CAMPI: { chiave: Chiave; etichetta: string; aiuto: string; facoltativo: boolean }[] = [
  {
    chiave: 'costoOrarioConducente',
    etichetta: 'Costo orario del conducente (€/h)',
    aiuto: 'Costo aziendale (lordo, contributi, TFR) per ora, per il conducente o l’operatore quando nella stima non si sceglie una persona. Questi costi non vanno nei costi aziendali.',
    facoltativo: true,
  },
  { chiave: 'velocitaMedia', etichetta: 'Velocità media (km/h)', aiuto: 'Per le ore di guida di un servizio a km.', facoltativo: false },
  { chiave: 'oreGuidaGiorno', etichetta: 'Ore di guida al giorno', aiuto: 'Oltre, il servizio dura un altro giorno (limite di legge: 9).', facoltativo: false },
  { chiave: 'diaria', etichetta: 'Diaria per notte fuori sede (€)', aiuto: 'Per ogni notte fuori sede del conducente, in cabina o in albergo (l’albergo, se c’è, va negli extra della stima).', facoltativo: true },
  {
    chiave: 'indennitaTrasferta',
    etichetta: 'Indennità di trasferta per giorno (€)',
    aiuto: 'Per ogni giorno del servizio quando il conducente non rientra in giornata: servizio di più giorni, o ore e km oltre le soglie qui sotto.',
    facoltativo: true,
  },
  { chiave: 'sogliaOreTrasferta', etichetta: 'Trasferta oltre queste ore di servizio', aiuto: 'Un servizio più lungo non permette di rientrare in giornata.', facoltativo: false },
  { chiave: 'sogliaKmTrasferta', etichetta: 'Trasferta oltre questi km di andata', aiuto: 'Una destinazione più lontana non permette di rientrare in giornata (solo trasporti).', facoltativo: false },
  { chiave: 'pedaggioKm', etichetta: 'Pedaggio per km autostradale (€/km)', aiuto: 'Per stimare i pedaggi dai km in autostrada, es. 0,16.', facoltativo: true },
  {
    chiave: 'oreImpiegoAnnue',
    etichetta: 'Ore di impiego annue di un mezzo',
    aiuto: 'Dividono possesso, obblighi e manutenzione di un mezzo in un costo per ora di impiego (2.048 = 256 giorni × 8 ore).',
    facoltativo: false,
  },
];

const testo = (n: number | null) => (n == null ? '' : testoNumero(n));

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
