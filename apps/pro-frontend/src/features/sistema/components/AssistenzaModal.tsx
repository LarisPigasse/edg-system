// src/features/sistema/components/AssistenzaModal.tsx
//
// "Entra nel tenant" (ADR085): il personale EDG sceglie la modalità e scrive il
// motivo; auth-service apre la sessione e restituisce un codice monouso, con
// cui si apre una nuova scheda di app-frontend già nel tenant del cliente.
//
// La scheda si apre vuota al clic (window.open dentro il gesto dell'utente,
// così il browser non la blocca) e riceve l'indirizzo quando arriva il codice.
// Se il browser la blocca comunque, la finestra mostra il collegamento da
// aprire a mano (vale 64 secondi).
import React, { useEffect, useState } from 'react';
import { Button, Modal, RadioGroup, TextArea, useToast } from '@edg/ui';

import { assistenzaApi } from '../api/assistenzaApi';
import { formatOra, ingressoAssistenzaUrl } from '../utils/assistenza';
import type { ModoAssistenza } from '../types/assistenza';
import type { Tenant } from '../types';

interface AssistenzaModalProps {
  tenant: Tenant | null;
  onClose: () => void;
  /** Dopo un'apertura riuscita */
  onAperta?: () => void;
}

const MOTIVO_MIN = 4;
const MOTIVO_MAX = 256;

const MODI = [
  {
    value: 'preparazione',
    label: 'Preparazione',
    description: 'Prepari i moduli del cliente con i permessi del suo amministratore.',
  },
  {
    value: 'assistenza',
    label: 'Assistenza',
    description: 'Vedi come un utente del cliente, in sola lettura. In arrivo.',
    disabled: true,
  },
];

const AssistenzaModal: React.FC<AssistenzaModalProps> = ({ tenant, onClose, onAperta }) => {
  const toast = useToast();
  const [modo, setModo] = useState<ModoAssistenza>('preparazione');
  const [motivo, setMotivo] = useState('');
  const [tentato, setTentato] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bloccata, setBloccata] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setModo('preparazione');
      setMotivo('');
      setTentato(false);
      setBloccata(null);
    }
  }, [tenant]);

  const motivoPulito = motivo.trim();
  const erroreMotivo =
    tentato && motivoPulito.length < MOTIVO_MIN ? `Scrivi il motivo (almeno ${MOTIVO_MIN} caratteri)` : undefined;

  const handleEntra = async () => {
    if (!tenant) return;
    setTentato(true);
    if (motivoPulito.length < MOTIVO_MIN) return;

    // Scheda aperta subito, dentro il clic: dopo l'attesa il browser la bloccherebbe
    const scheda = window.open('', '_blank');
    if (scheda) scheda.opener = null;

    setIsSubmitting(true);
    try {
      const res = await assistenzaApi.apri({ tenantId: tenant.id, modo, motivo: motivoPulito });
      const apertura = res.data;
      if (!apertura) throw new Error('Risposta senza codice');
      const url = ingressoAssistenzaUrl(apertura.codice);
      onAperta?.();
      if (scheda) {
        scheda.location.href = url;
        toast?.({ title: 'Accesso assistito aperto', description: `Nel tenant «${tenant.name}» fino alle ${formatOra(apertura.sessione.scade)}` });
        onClose();
      } else {
        setBloccata(url);
      }
    } catch (err) {
      scheda?.close();
      toast?.danger({ title: 'Accesso assistito non aperto', description: (err as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!tenant}
      onClose={onClose}
      title='Accesso assistito'
      size='md'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
            {bloccata ? 'Chiudi' : 'Annulla'}
          </Button>
          {!bloccata && (
            <Button variant='primary' onClick={handleEntra} isLoading={isSubmitting} loadingText='Apertura...'>
              Entra nel tenant
            </Button>
          )}
        </div>
      }
    >
      {bloccata ? (
        <div className='space-y-3 text-sm'>
          <p className='text-text-secondary'>
            Il browser ha bloccato la nuova scheda. Aprila da qui: il collegamento vale 64 secondi.
          </p>
          <a
            href={bloccata}
            target='_blank'
            rel='noopener noreferrer'
            onClick={onClose}
            className='font-semibold text-text-link hover:text-text-link-hover'
          >
            Apri EDG App nel tenant «{tenant?.name}»
          </a>
        </div>
      ) : (
        <div className='space-y-5'>
          <p className='text-sm text-text-secondary'>
            Entri nel tenant <strong className='text-text-primary'>{tenant?.name}</strong> con il tuo account, in una nuova
            scheda di EDG App, per 64 minuti. Ogni azione resta registrata a tuo nome.
          </p>

          <RadioGroup
            label='Modalità'
            options={MODI}
            value={modo}
            onValueChange={v => setModo(v as ModoAssistenza)}
          />

          <TextArea
            label='Motivo'
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            error={erroreMotivo}
            helperText='Obbligatorio: resta nel registro, es. «Preparazione di Vigilo».'
            maxLength={MOTIVO_MAX}
            minRows={2}
            maxRows={4}
            required
          />
        </div>
      )}
    </Modal>
  );
};

export default AssistenzaModal;
