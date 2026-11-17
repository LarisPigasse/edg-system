// src/features/vigilo/components/fornitori/EsportaInterventi.tsx
//
// La finestra del report "Interventi e costi per fornitore" (2026-11-12): il
// periodo (come in Spese e consumi, ultimi 12 mesi se non si sceglie) e, se
// non è già un fornitore preciso (dal suo dettaglio), quali fornitori: tutti o
// un tipo. Poi PDF o CSV. Si apre dalla pagina Fornitori (con il tipo del
// filtro già scelto) o dal dettaglio di un fornitore.
import React, { useEffect, useState } from 'react';
import { Button, DatePicker, Modal, Select } from '@edg/ui';

import { PERIODI_SPESE } from '../../constants/resoconti';
import { useEsportaInterventi } from '../../hooks/useEsportaInterventi';
import type { Fornitore, TipoFornitore } from '../../types/fornitori';
import type { PeriodoSpese } from '../../types/resoconti';
import { aGiorno, daGiorno, oggiLocale } from '../../utils/giorni';

const TUTTI = 'tutti';

interface Props {
  aperto: boolean;
  onChiudi: () => void;
  /** Un fornitore preciso (dal dettaglio); null = tutti o un tipo */
  fornitore: Fornitore | null;
  /** Il tipo già scelto nei filtri della pagina */
  tipoIniziale?: string;
  tipi: TipoFornitore[];
}

export const EsportaInterventi: React.FC<Props> = ({ aperto, onChiudi, fornitore, tipoIniziale, tipi }) => {
  const x = useEsportaInterventi();
  const [periodo, setPeriodo] = useState<PeriodoSpese>('12m');
  const [dal, setDal] = useState('');
  const [al, setAl] = useState('');
  const [tipo, setTipo] = useState(TUTTI);

  // a ogni apertura: ultimi 12 mesi e il tipo dei filtri
  useEffect(() => {
    if (!aperto) return;
    setPeriodo('12m');
    setDal('');
    setAl('');
    setTipo(tipoIniziale ?? TUTTI);
  }, [aperto, tipoIniziale]);

  const datePronte = periodo !== 'personalizzato' || (!!dal && !!al && dal <= al);

  const esporta = async (formato: 'pdf' | 'csv') => {
    const tipoScelto = !fornitore && tipo !== TUTTI ? tipi.find(t => t.chiave === tipo) : undefined;
    const fatto = await x.esporta(
      formato,
      {
        periodo,
        ...(periodo === 'personalizzato' ? { dal, al } : {}),
        ...(fornitore ? { fornitore: fornitore.uuid } : tipoScelto ? { tipoFornitore: tipoScelto.chiave } : {}),
      },
      fornitore ? { fornitore: fornitore.nome } : tipoScelto ? { tipo: tipoScelto.nome } : { tutti: true }
    );
    if (fatto) onChiudi();
  };

  const oggi = daGiorno(oggiLocale());

  return (
    <Modal
      isOpen={aperto}
      onClose={onChiudi}
      title='Interventi e costi per fornitore'
      description='Gli interventi e i rifornimenti fatti presso i fornitori, con gli importi pagati: subtotale per fornitore e totale.'
      preventClose={x.inCorso}
      footer={
        <div className='flex flex-wrap justify-end gap-2'>
          <Button variant='secondary' onClick={onChiudi} disabled={x.inCorso}>
            Annulla
          </Button>
          <Button variant='outline' onClick={() => void esporta('csv')} disabled={!datePronte || x.inCorso}>
            CSV (Excel)
          </Button>
          <Button onClick={() => void esporta('pdf')} disabled={!datePronte} isLoading={x.inCorso} loadingText='Preparo…'>
            PDF
          </Button>
        </div>
      }
    >
      <div className='space-y-4'>
        {fornitore ? (
          <p className='text-sm text-text-secondary'>
            Fornitore: <span className='font-medium text-text-primary'>{fornitore.nome}</span>
          </p>
        ) : (
          <Select
            label='Fornitori'
            value={tipo}
            onValueChange={setTipo}
            options={[{ value: TUTTI, label: 'Tutti i fornitori' }, ...tipi.map(t => ({ value: t.chiave, label: `Tipo: ${t.nome}` }))]}
          />
        )}
        <Select label='Periodo' value={periodo} onValueChange={v => setPeriodo(v as PeriodoSpese)} options={PERIODI_SPESE} />
        {periodo === 'personalizzato' && (
          <div className='grid gap-4 sm:grid-cols-2'>
            <DatePicker label='Dal' value={dal ? daGiorno(dal) : undefined} onChange={d => setDal(d ? aGiorno(d) : '')} maxDate={oggi} />
            <DatePicker label='Al' value={al ? daGiorno(al) : undefined} onChange={d => setAl(d ? aGiorno(d) : '')} maxDate={oggi} />
          </div>
        )}
      </div>
    </Modal>
  );
};
