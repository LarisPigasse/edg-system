// src/features/sistema/components/AssistenzaModal.tsx
//
// "Entra nel tenant" (ADR085): il personale EDG sceglie la modalità e scrive il
// motivo; in Assistenza (AA4) sceglie anche l'account del cliente da vedere,
// in sola lettura; auth-service apre la sessione e restituisce un codice monouso, con
// cui si apre una nuova scheda di app-frontend già nel tenant del cliente.
//
// La scheda si apre vuota al clic (window.open dentro il gesto dell'utente,
// così il browser non la blocca) e riceve l'indirizzo quando arriva il codice.
// Se il browser la blocca comunque, la finestra mostra il collegamento da
// aprire a mano (vale 64 secondi).
import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, RadioGroup, Select, TextArea, useToast } from '@edg/ui';

import { assistenzaApi } from '../api/assistenzaApi';
import { useAccountAssistibili } from '../hooks/useAccountAssistibili';
import { etichettaAccount, formatOra, ingressoAssistenzaUrl } from '../utils/assistenza';
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
    description: 'Vedi EDG App come un utente del cliente, in sola lettura: nessuna modifica è possibile.',
  },
];

const AssistenzaModal: React.FC<AssistenzaModalProps> = ({ tenant, onClose, onAperta }) => {
  const toast = useToast();
  const [modo, setModo] = useState<ModoAssistenza>('preparazione');
  const [motivo, setMotivo] = useState('');
  const [perConto, setPerConto] = useState<string>('');
  const [tentato, setTentato] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bloccata, setBloccata] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setModo('preparazione');
      setMotivo('');
      setPerConto('');
      setTentato(false);
      setBloccata(null);
    }
  }, [tenant]);

  const inAssistenza = modo === 'assistenza';
  // l'elenco si carica solo quando serve, cioè scelta l'Assistenza
  const elenco = useAccountAssistibili(tenant && inAssistenza ? tenant.id : null);
  const scelto = elenco.account.find(a => String(a.id) === perConto);

  const motivoPulito = motivo.trim();
  const erroreMotivo =
    tentato && motivoPulito.length < MOTIVO_MIN ? `Scrivi il motivo (almeno ${MOTIVO_MIN} caratteri)` : undefined;

  const erroreAccount = tentato && inAssistenza && !scelto ? 'Scegli chi vuoi vedere' : undefined;

  const handleEntra = async () => {
    if (!tenant) return;
    setTentato(true);
    if (motivoPulito.length < MOTIVO_MIN || (inAssistenza && !scelto)) return;

    // Scheda aperta subito, dentro il clic: dopo l'attesa il browser la bloccherebbe
    const scheda = window.open('', '_blank');
    if (scheda) scheda.opener = null;

    setIsSubmitting(true);
    try {
      const res = await assistenzaApi.apri({
        tenantId: tenant.id,
        modo,
        motivo: motivoPulito,
        ...(inAssistenza && scelto ? { perConto: scelto.id } : {}),
      });
      const apertura = res.data;
      if (!apertura) throw new Error('Risposta senza codice');
      const url = ingressoAssistenzaUrl(apertura.codice);
      onAperta?.();
      if (scheda) {
        scheda.location.href = url;
        const come = scelto ? `, come ${scelto.nome} in sola lettura,` : '';
        toast?.({ title: 'Accesso assistito aperto', description: `Nel tenant «${tenant.name}»${come} fino alle ${formatOra(apertura.sessione.scade)}` });
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
            Entri nel tenant <strong className='text-text-primary'>{tenant?.name}</strong> in una nuova scheda di EDG App,
            per 64 minuti. {inAssistenza ? "Vedi ciò che vede l'utente scelto, senza poter modificare nulla." : 'Ogni azione resta registrata a tuo nome.'}
          </p>

          <RadioGroup
            label='Modalità'
            options={MODI}
            value={modo}
            onValueChange={v => setModo(v as ModoAssistenza)}
          />

          {inAssistenza &&
            (elenco.errore ? (
              <Alert variant='warning' title='Account non disponibili'>
                {elenco.errore}
              </Alert>
            ) : (
              <Select
                label='Vedi come'
                options={elenco.account.map(a => ({ value: String(a.id), label: etichettaAccount(a) }))}
                value={perConto || undefined}
                // Radix può emettere '' se il valore non è tra le voci: lo si ignora
                onValueChange={v => v && setPerConto(v)}
                placeholder={elenco.caricamento ? 'Caricamento…' : elenco.account.length ? "Scegli l'utente" : 'Nessun account attivo'}
                disabled={elenco.caricamento || !elenco.account.length}
                error={erroreAccount}
                helperText={scelto?.email ?? 'Un account attivo del cliente, anche il suo amministratore.'}
              />
            ))}

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
