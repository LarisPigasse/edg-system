// src/features/vigilo/components/soggetto/DecidiControllo.tsx
//
// La finestra per decidere su un controllo del soggetto (revisione
// 2026-11-11): non seguirlo, con il motivo obbligatorio che resta nello
// storico, o tornare a seguirlo, con una nota facoltativa.
import React, { useEffect, useState } from 'react';
import { Button, Modal, TextArea } from '@edg/ui';

import type { ControlloDelSoggetto } from '../../types/controlliSoggetto';

/** Come il servizio (LIMITI_ESCLUSIONE.motivo) */
const MOTIVO = { min: 2, max: 512 } as const;

export type Decisione = 'non-seguire' | 'riprendi';

interface Props {
  controllo: ControlloDelSoggetto | null;
  decisione: Decisione;
  inCorso: boolean;
  onChiudi: () => void;
  /** Il motivo (non seguire) o la nota (riprendi, null se vuota); vero se è riuscita */
  onConferma: (testo: string | null) => Promise<boolean>;
}

const TESTI = {
  'non-seguire': {
    titolo: (n: string) => `Non seguire "${n}"`,
    spiega: 'La scadenza aperta si chiude e Vigilo non ne crea altre per questo soggetto. Tornando a seguirlo, si riapre con le sue date.',
    campo: 'Motivo',
    aiuto: 'Resta nello storico con il tuo nome: es. "mezzo esente", "non ha il tachigrafo".',
    pulsante: 'Non seguire',
  },
  riprendi: {
    titolo: (n: string) => `Tornare a seguire "${n}"`,
    spiega: 'La scadenza chiusa si riapre con le sue date; se non c\'è, Vigilo ne crea una nuova.',
    campo: 'Nota (facoltativa)',
    aiuto: 'Resta nello storico con il tuo nome: es. "torna in uso".',
    pulsante: 'Torna a seguire',
  },
} as const;

export const DecidiControllo: React.FC<Props> = ({ controllo, decisione, inCorso, onChiudi, onConferma }) => {
  const [testo, setTesto] = useState('');
  useEffect(() => setTesto(''), [controllo, decisione]);

  const t = TESTI[decisione];
  const pulito = testo.trim();
  const pronto = decisione === 'riprendi' || pulito.length >= MOTIVO.min;

  const conferma = async () => {
    if (!pronto || inCorso) return;
    if (await onConferma(pulito || null)) onChiudi();
  };

  return (
    <Modal
      isOpen={!!controllo}
      onClose={onChiudi}
      title={controllo ? t.titolo(controllo.nome) : ''}
      description={t.spiega}
      preventClose={inCorso}
      footer={
        <div className='flex justify-end gap-2'>
          <Button variant='secondary' onClick={onChiudi} disabled={inCorso}>
            Annulla
          </Button>
          <Button onClick={() => void conferma()} disabled={!pronto} isLoading={inCorso} loadingText='Salvo…'>
            {t.pulsante}
          </Button>
        </div>
      }
    >
      <TextArea
        label={t.campo}
        value={testo}
        onChange={e => setTesto(e.target.value)}
        maxLength={MOTIVO.max}
        minRows={2}
        autoResize
        required={decisione === 'non-seguire'}
        helperText={t.aiuto}
      />
    </Modal>
  );
};
