// src/features/vigilo/components/configurazione/PannelloDestinatariControllo.tsx
//
// I destinatari degli avvisi di un controllo, nel pannello laterale (B8d-3).
// Valgono per tutte le scadenze del controllo che non ne hanno di propri
// (eredità viva), dai prossimi avvisi. A ogni apertura si riparte da quelli
// salvati.
import React, { useEffect, useState } from 'react';
import { Button, Sheet, useToast } from '@edg/ui';

import { cambiaDestinatariControllo } from '../../api/destinatari';
import { ruoliPer } from '../../constants/destinatari';
import type { Controllo } from '../../types/configurazione';
import type { Destinatario } from '../../types/destinatari';
import { erroreDestinatari, fraseDestinatari, ordinati, stessiDestinatari } from '../../utils/destinatari';
import { EditorDestinatari } from '../destinatari/EditorDestinatari';

interface Props {
  /** Il controllo da modificare; resta impostato anche durante la chiusura */
  controllo: Controllo | null;
  aperto: boolean;
  onChiudi: () => void;
  /** Dopo il salvataggio (per rileggere la Configurazione) */
  onSalvato: () => void;
}

export const PannelloDestinatariControllo: React.FC<Props> = ({ controllo, aperto, onChiudi, onSalvato }) => {
  const toast = useToast();
  const [bozza, setBozza] = useState<Destinatario[]>([]);
  const [inCorso, setInCorso] = useState(false);

  useEffect(() => {
    if (aperto && controllo) setBozza(ordinati(controllo.destinatari));
  }, [aperto, controllo]);

  const problema = erroreDestinatari(bozza);
  const cambiata = !!controllo && !stessiDestinatari(bozza, controllo.destinatari);

  const salva = async () => {
    if (!controllo || problema) return;
    setInCorso(true);
    try {
      await cambiaDestinatariControllo(controllo.uuid, ordinati(bozza));
      toast?.({ title: 'Destinatari salvati', description: `Gli avvisi di "${controllo.nome}" vanno a: ${fraseDestinatari(bozza)}.` });
      onSalvato();
      onChiudi();
    } catch (e) {
      toast?.danger({ title: 'Destinatari non salvati', description: (e as Error).message });
    } finally {
      setInCorso(false);
    }
  };

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title='Destinatari degli avvisi'
      description={controllo ? `${controllo.nome}: valgono per tutte le sue scadenze che non ne hanno di propri, dai prossimi avvisi.` : undefined}
      className='w-full! sm:max-w-lg!'
      footer={
        <>
          <Button variant='secondary' onClick={onChiudi} disabled={inCorso}>
            Annulla
          </Button>
          <Button onClick={() => void salva()} disabled={!cambiata || !!problema} isLoading={inCorso} loadingText='Salvo…'>
            Salva
          </Button>
        </>
      }
    >
      {controllo && (
        <div className='space-y-4'>
          <EditorDestinatari valore={bozza} onCambia={setBozza} ruoli={ruoliPer(controllo.tipoSoggetto)} disabilitato={inCorso} />
          {problema && <p className='text-sm font-medium text-text-danger'>{problema}</p>}
        </div>
      )}
    </Sheet>
  );
};
