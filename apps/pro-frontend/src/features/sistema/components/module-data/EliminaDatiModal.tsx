// src/features/sistema/components/module-data/EliminaDatiModal.tsx
//
// Eliminazione dei dati di un tenant in un modulo (fase 3, ADR117), solo root.
// Due scelte: "solo i dati" (la configurazione resta, il modulo resta avviato)
// o "tutto" (torna come appena attivato). Dice che cosa sparisce, con i numeri
// del riepilogo, e che cosa resta; si conferma scrivendo il nome del tenant.
// Non si può annullare.
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Input, Modal, RadioGroup, useToast } from '@edg/ui';

import { eliminaDatiModulo } from '../../api/datiModuliApi';
import type { EsitoEliminazione, ModoEliminazione, RiepilogoDati } from '../../types/datiModuli';
import { dettagliRiepilogo, righeInParole, vociDati } from '../../utils/datiModuli';

interface EliminaDatiModalProps {
  isOpen: boolean;
  onClose: () => void;
  modulo: string;
  nomeModulo: string;
  tenant: { id: number; name: string };
  riepilogo: RiepilogoDati | null;
  onEliminato: (esito: EsitoEliminazione) => void;
}

const MODI = [
  {
    value: 'dati',
    label: 'Solo i dati, tieni la configurazione',
    description: 'Restano categorie, controlli, impostazioni e regole degli avvisi: il modulo resta avviato, vuoto.',
  },
  {
    value: 'tutto',
    label: 'Tutto, configurazione compresa',
    description: 'Il modulo torna come appena attivato: al primo accesso ripropone la procedura di avvio.',
  },
];

const EliminaDatiModal: React.FC<EliminaDatiModalProps> = ({ isOpen, onClose, modulo, nomeModulo, tenant, riepilogo, onEliminato }) => {
  const toast = useToast();
  const [modo, setModo] = useState<ModoEliminazione>('dati');
  const [nome, setNome] = useState('');
  const [inCorso, setInCorso] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setModo('dati');
      setNome('');
    }
  }, [isOpen]);

  /** Che cosa sparisce, riga per riga come nel riquadro del modulo; vuoto = niente */
  const sparisce = useMemo(() => {
    if (!riepilogo) return [];
    const righe = [{ titolo: 'Dati', voci: vociDati(riepilogo.dati, { accanto: dettagliRiepilogo(riepilogo) }) }];
    if (modo === 'tutto') righe.push({ titolo: 'Configurazione', voci: vociDati(riepilogo.configurazione) });
    return righe.filter(r => r.voci);
  }, [riepilogo, modo]);

  const confermato = nome.trim() === tenant.name.trim();

  const elimina = async () => {
    setInCorso(true);
    try {
      const esito = await eliminaDatiModulo(modulo, tenant.id, modo);
      const file = esito.file.tolti ? ` e ${esito.file.tolti} ${esito.file.tolti === 1 ? 'documento' : 'documenti'}` : '';
      toast?.({ title: `${nomeModulo}: dati eliminati`, description: `${righeInParole(esito.totaleRighe)}${file}. ${esito.resta}` });
      if (esito.file.nonTolti > 0)
        toast?.danger({ title: 'Alcuni documenti sono rimasti sul disco', description: `${esito.file.nonTolti} file da togliere a mano: vedi i log.` });
      onEliminato(esito);
      onClose();
    } catch (e) {
      toast?.danger({ title: 'Eliminazione non riuscita', description: (e as Error).message });
    } finally {
      setInCorso(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={inCorso ? () => undefined : onClose}
      title={`Elimina i dati di ${nomeModulo}`}
      description={tenant.name}
      size='md'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose} disabled={inCorso}>
            Annulla
          </Button>
          <Button variant='danger' onClick={elimina} disabled={!confermato || inCorso} isLoading={inCorso}>
            Elimina
          </Button>
        </div>
      }
    >
      <div className='space-y-4'>
        <RadioGroup label='Che cosa eliminare' options={MODI} value={modo} onValueChange={v => setModo(v as ModoEliminazione)} />

        <div className='space-y-1 text-sm'>
          <p className='font-medium text-text-primary'>Sparisce</p>
          {sparisce.length === 0 && <p className='text-text-secondary'>niente: non ci sono righe</p>}
          {sparisce.map(r => (
            <p key={r.titolo} className='text-text-primary'>
              <span className='text-text-secondary'>{r.titolo}: </span>
              {r.voci}
            </p>
          ))}
        </div>

        <Alert variant='warning' title='Non si può annullare'>
          Restano l&apos;attivazione del modulo, gli account del tenant, i log (che non si cancellano) e le copie di backup già fatte,
          finché le tiene la loro conservazione.
        </Alert>

        <Input
          label={`Per confermare scrivi il nome del tenant: ${tenant.name}`}
          value={nome}
          onChange={e => setNome(e.target.value)}
          autoComplete='off'
        />
      </div>
    </Modal>
  );
};

export default EliminaDatiModal;
