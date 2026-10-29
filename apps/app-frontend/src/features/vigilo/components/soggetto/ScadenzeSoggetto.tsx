// src/features/vigilo/components/soggetto/ScadenzeSoggetto.tsx
//
// Le scadenze aperte del soggetto, per urgenza, con le stesse schede
// colorate della dashboard (sotto il titolo la natura, il soggetto è già
// scritto in testa). Un clic apre il pannello con le azioni; ci si arriva
// anche dalla campanella con ?scadenza= (ADR091), e dopo un guasto segnalato
// (anche con &azione=registra se già riparato, B10a). "Aggiungi scadenza" e
// "Segnala un guasto" stanno nel menu Azioni della pagina.
import React, { useCallback, useState } from 'react';

import type { Azione } from '../../constants/azioni';
import { NATURE_TESTO } from '../../constants/nature';
import type { Capacita } from '../../types/io';
import type { Scadenza } from '../../types/scadenze';
import { useScadenzaDaIndirizzo } from '../../hooks/useScadenzaDaIndirizzo';
import { fasciaDi } from '../../utils/fasce';
import { oggiLocale } from '../../utils/giorni';
import { SchedaScadenza } from '../dashboard/SchedaScadenza';
import { PannelloScadenza } from '../scadenza/PannelloScadenza';

interface Props {
  scadenze: Scadenza[];
  capacita: Capacita;
  onCambiate: () => void;
}

export const ScadenzeSoggetto: React.FC<Props> = ({ scadenze, capacita, onCambiate }) => {
  const oggi = oggiLocale();
  const [aperta, setAperta] = useState<string | null>(null);
  const [pannello, setPannello] = useState(false);
  const [azione, setAzione] = useState<Azione | null>(null);
  const apri = useCallback((uuid: string, a: Azione | null = null) => {
    setAperta(uuid);
    setAzione(a);
    setPannello(true);
  }, []);
  useScadenzaDaIndirizzo(apri);

  return (
    <>
      {scadenze.length === 0 ? (
        <p className='rounded-lg border border-dashed border-border-default p-6 text-center text-sm text-text-secondary'>Nessuna scadenza aperta.</p>
      ) : (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3'>
          {scadenze.map(s => (
            <SchedaScadenza
              key={s.uuid}
              s={s}
              fascia={fasciaDi(s, oggi)}
              onApri={() => apri(s.uuid)}
              sottotitolo={NATURE_TESTO[s.natura]}
            />
          ))}
        </div>
      )}
      <PannelloScadenza uuid={aperta} aperto={pannello} capacita={capacita} azioneIniziale={azione} onChiudi={() => setPannello(false)} onFatto={onCambiate} />
    </>
  );
};
