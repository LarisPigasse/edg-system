// src/features/sistema/components/module-data/DatiModulo.tsx
//
// I dati di un tenant in un modulo, dentro il riquadro del modulo della
// finestra Moduli (fase 3, ADR117): che cosa c'è, in una o due righe, e per
// root "Elimina i dati…". Solo per i moduli del registro (module-data/registry).
import React, { useState } from 'react';
import { Button } from '@edg/ui';
import { useAuth } from '@edg/auth';

import { useDatiModulo } from '../../hooks/useDatiModulo';
import { dettagliRiepilogo, vociDati } from '../../utils/datiModuli';
import EliminaDatiModal from './EliminaDatiModal';

interface DatiModuloProps {
  modulo: string;
  nomeModulo: string;
  tenant: { id: number; name: string };
}

/** Voci per riga nel riquadro del modulo: le altre diventano "e altro" */
const MAX_VOCI = 4;

const DatiModulo: React.FC<DatiModuloProps> = ({ modulo, nomeModulo, tenant }) => {
  const { isRoot } = useAuth();
  const { riepilogo, errore, ricarica } = useDatiModulo(modulo, tenant.id);
  const [elimina, setElimina] = useState(false);

  if (errore) return <p className='text-xs text-text-warning'>Dati non disponibili: {errore}</p>;
  if (!riepilogo) return <p className='text-xs text-text-secondary'>Dati: lettura…</p>;

  const righeDati = riepilogo.dati.reduce((a, r) => a + r.righe, 0);
  const righeConf = riepilogo.configurazione.reduce((a, r) => a + r.righe, 0);
  const vuoto = righeDati + righeConf === 0;

  return (
    <div className='space-y-1 text-xs'>
      {vuoto ? (
        <p className='text-text-secondary'>Nessun dato: {nomeModulo} non è ancora stato avviato.</p>
      ) : (
        <>
          <p className='text-text-primary'>
            <span className='text-text-secondary'>Dati: </span>
            {righeDati > 0 ? vociDati(riepilogo.dati, { max: MAX_VOCI, accanto: dettagliRiepilogo(riepilogo) }) : 'nessuno'}
          </p>
          <p className='text-text-primary'>
            <span className='text-text-secondary'>Configurazione: </span>
            {righeConf > 0 ? vociDati(riepilogo.configurazione, { max: MAX_VOCI - 1 }) : 'nessuna'}
            {!riepilogo.avviato && <span className='text-text-secondary'> · non avviato</span>}
          </p>
        </>
      )}
      {isRoot && !vuoto && (
        <div className='pt-1'>
          <Button size='sm' variant='outline' onClick={() => setElimina(true)}>
            Elimina i dati…
          </Button>
        </div>
      )}
      <EliminaDatiModal
        isOpen={elimina}
        onClose={() => setElimina(false)}
        modulo={modulo}
        nomeModulo={nomeModulo}
        tenant={tenant}
        riepilogo={riepilogo}
        onEliminato={() => void ricarica()}
      />
    </div>
  );
};

export default DatiModulo;
