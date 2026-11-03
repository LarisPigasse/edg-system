// src/features/sistema/components/module-admin/vigilo/TipiFornitoreModal.tsx
//
// I tipi di fornitore di Vigilo (F0): un catalogo comune a tutti i clienti,
// che solo root cambia. Si aggiunge, si rinomina (la chiave non cambia mai:
// la usano il codice e i report), si disattiva un tipo che non deve più
// essere proposto, si elimina solo un tipo che nessun fornitore usa. "Altro"
// è il tipo di riserva: si rinomina, non si spegne. Le conferme stanno nella
// riga: niente finestre sopra la finestra.
import React, { useEffect, useState } from 'react';
import { Badge, Button, Input, Modal, Skeleton } from '@edg/ui';

import { useTipiFornitore } from '../../../hooks/useTipiFornitore';
import type { TipoFornitore } from '../../../types/vigilo';

/** Limiti invalicabili, gli stessi del servizio (domini/fornitori/tipi.ts) */
const LIMITI = { tipi: 64, nome: 64 } as const;
const RISERVA = 'altro';

const usati = (n: number | undefined) => (!n ? 'nessun fornitore' : n === 1 ? '1 fornitore' : `${n} fornitori`);

const RigaTipo: React.FC<{
  t: TipoFornitore;
  occupato: boolean;
  onRinomina: (nome: string) => Promise<boolean>;
  onAttiva: (attivo: boolean) => void;
  onElimina: () => void;
}> = ({ t, occupato, onRinomina, onAttiva, onElimina }) => {
  const [modo, setModo] = useState<'vista' | 'nome' | 'elimina'>('vista');
  const [nome, setNome] = useState(t.nome);
  const riserva = t.chiave === RISERVA;
  const eliminabile = !riserva && !t.fornitori;
  const nomeValido = !!nome.trim() && nome.trim().length <= LIMITI.nome;

  return (
    <li className='flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3'>
      <div className='min-w-0 flex-1'>
        {modo === 'nome' ? (
          <Input
            label='Nome del tipo'
            value={nome}
            onChange={e => setNome(e.target.value)}
            maxLength={LIMITI.nome}
            autoFocus
            onKeyDown={async e => {
              if (e.key === 'Enter' && nomeValido && (await onRinomina(nome))) setModo('vista');
              if (e.key === 'Escape') setModo('vista');
            }}
          />
        ) : (
          <>
            <div className='flex flex-wrap items-center gap-2'>
              <span className={t.attivo ? 'font-medium text-text-primary' : 'font-medium text-text-secondary line-through'}>{t.nome}</span>
              {!t.attivo && <Badge variant='warning'>disattivato</Badge>}
              {riserva && <Badge variant='info'>di riserva</Badge>}
            </div>
            <div className='text-xs text-text-secondary'>
              <code>{t.chiave}</code> · {usati(t.fornitori)}
            </div>
          </>
        )}
      </div>

      {/* la conferma dell'eliminazione va su una riga sua: non stringe il nome */}
      <div className={modo === 'elimina' ? 'flex w-full flex-wrap items-center justify-end gap-2' : 'flex flex-wrap items-center gap-2'}>
        {modo === 'nome' && (
          <>
            <Button size='sm' variant='outline' onClick={() => setModo('vista')} disabled={occupato}>
              Annulla
            </Button>
            <Button size='sm' onClick={async () => (await onRinomina(nome)) && setModo('vista')} disabled={!nomeValido || nome.trim() === t.nome} isLoading={occupato}>
              Salva
            </Button>
          </>
        )}
        {modo === 'elimina' && (
          <>
            <span className='mr-auto text-sm text-text-primary'>Eliminare “{t.nome}”? Nessun fornitore lo usa.</span>
            <Button size='sm' variant='outline' onClick={() => setModo('vista')} disabled={occupato}>
              Annulla
            </Button>
            <Button size='sm' variant='danger' onClick={onElimina} isLoading={occupato}>
              Elimina
            </Button>
          </>
        )}
        {modo === 'vista' && (
          <>
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                setNome(t.nome);
                setModo('nome');
              }}
              disabled={occupato}
            >
              Rinomina
            </Button>
            {!riserva && (
              <Button size='sm' variant='outline' onClick={() => onAttiva(!t.attivo)} disabled={occupato}>
                {t.attivo ? 'Disattiva' : 'Riattiva'}
              </Button>
            )}
            {eliminabile && (
              <Button size='sm' variant='outline' onClick={() => setModo('elimina')} disabled={occupato}>
                Elimina
              </Button>
            )}
          </>
        )}
      </div>
    </li>
  );
};

const TipiFornitoreModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const g = useTipiFornitore();
  const [nuovo, setNuovo] = useState('');
  const { ricarica } = g;

  useEffect(() => {
    if (isOpen) void ricarica();
  }, [isOpen, ricarica]);

  const pieno = g.tipi.length >= LIMITI.tipi;
  const doppio = g.tipi.some(t => t.nome.trim().toLocaleLowerCase('it') === nuovo.trim().toLocaleLowerCase('it'));
  const aggiungi = async () => {
    if (nuovo.trim() && !doppio && (await g.crea(nuovo))) setNuovo('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Tipi di fornitore'
      description='Comuni a tutti i clienti di Vigilo: ogni fornitore ne ha uno, e servono a filtrare la rubrica e i resoconti dei costi.'
      size='lg'
      footer={
        <div className='flex justify-end'>
          <Button variant='outline' onClick={onClose}>
            Chiudi
          </Button>
        </div>
      }
    >
      <div className='space-y-4'>
        <div className='flex items-end gap-3'>
          <div className='flex-1'>
            <Input
              label='Nuovo tipo'
              value={nuovo}
              onChange={e => setNuovo(e.target.value)}
              maxLength={LIMITI.nome}
              onKeyDown={e => e.key === 'Enter' && void aggiungi()}
              error={doppio && nuovo.trim() ? 'Esiste già un tipo con questo nome' : undefined}
              disabled={pieno}
            />
          </div>
          <Button onClick={() => void aggiungi()} disabled={!nuovo.trim() || doppio || pieno} isLoading={g.inCorso === 'nuovo'}>
            Aggiungi
          </Button>
        </div>
        <p className='text-xs text-text-secondary'>
          {g.tipi.length} tipi su {LIMITI.tipi}. Rinominare cambia solo il nome mostrato: i fornitori restano collegati. Un tipo usato non si elimina, si disattiva: non
          viene più proposto e chi ce l’ha lo tiene.
        </p>

        {g.caricamento && !g.tipi.length ? (
          <Skeleton className='h-64 rounded-lg' />
        ) : (
          <ul className='divide-y divide-surface-border overflow-hidden rounded-lg border border-surface-border'>
            {g.tipi.map(t => (
              <RigaTipo
                key={t.chiave}
                t={t}
                occupato={g.inCorso === t.chiave}
                onRinomina={nome => g.rinomina(t, nome)}
                onAttiva={attivo => void g.attiva(t, attivo)}
                onElimina={() => void g.elimina(t)}
              />
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default TipiFornitoreModal;
