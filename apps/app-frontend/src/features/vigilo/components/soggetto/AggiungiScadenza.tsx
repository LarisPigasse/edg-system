// src/features/vigilo/components/soggetto/AggiungiScadenza.tsx
//
// Una scadenza in più per il soggetto, nel pannello laterale:
//   Controllo   uno dei controlli del suo tipo (e della sua categoria) che
//               non ha già una scadenza aperta, di solito quelli non
//               automatici; la data si può lasciare a Vigilo (se la calcola
//               dai dati) o inserire dopo;
//   Promemoria  titolo e data liberi, per ciò che non è un controllo.
import React, { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Input, Select, Sheet, TextArea, cn } from '@edg/ui';

import { leggiControlli } from '../../api/configurazione';
import type { Controllo } from '../../types/configurazione';
import type { Scadenza } from '../../types/scadenze';
import type { Soggetto } from '../../types/soggetti';
import { aGiorno, daGiorno } from '../../utils/giorni';

type Modo = 'controllo' | 'promemoria';

interface Props {
  s: Soggetto;
  /** Le scadenze aperte del soggetto: i loro controlli non si propongono */
  aperte: Scadenza[];
  aperto: boolean;
  modoIniziale: Modo;
  inCorso: boolean;
  onChiudi: () => void;
  onAggiungi: (dati: { controllo: string | null; titolo?: string; scadeIl?: string; note?: string | null }) => Promise<boolean>;
}

/** I controlli che valgono per il soggetto e non hanno già una scadenza aperta */
function proponibili(controlli: Controllo[], s: Soggetto, aperte: Scadenza[]): Controllo[] {
  const usati = new Set(aperte.map(x => x.controllo?.uuid).filter(Boolean));
  return controlli
    .filter(c => c.attivo && c.tipoSoggetto === s.tipo && !usati.has(c.uuid))
    .filter(c => c.categorie.length === 0 || (s.categoria && c.categorie.some(k => k.uuid === s.categoria!.uuid)))
    .sort((a, b) => Number(a.automatico) - Number(b.automatico) || a.nome.localeCompare(b.nome, 'it'));
}

export const AggiungiScadenza: React.FC<Props> = ({ s, aperte, aperto, modoIniziale, inCorso, onChiudi, onAggiungi }) => {
  const [modo, setModo] = useState<Modo>(modoIniziale);
  const [controlli, setControlli] = useState<Controllo[]>([]);
  const [controllo, setControllo] = useState('');
  const [titolo, setTitolo] = useState('');
  const [scadeIl, setScadeIl] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!aperto) return;
    setModo(modoIniziale);
    setControllo('');
    setTitolo('');
    setScadeIl('');
    setNote('');
    leggiControlli()
      .then(setControlli)
      .catch(() => setControlli([]));
  }, [aperto, modoIniziale]);

  const scelte = useMemo(() => proponibili(controlli, s, aperte), [controlli, s, aperte]);
  const pronto = modo === 'controllo' ? !!controllo : !!titolo.trim() && !!scadeIl;

  const aggiungi = async () => {
    const dati =
      modo === 'controllo'
        ? { controllo, ...(scadeIl ? { scadeIl } : {}), note: note.trim() || null }
        : { controllo: null, titolo: titolo.trim(), scadeIl, note: note.trim() || null };
    if (await onAggiungi(dati)) onChiudi();
  };

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title={`Nuova scadenza per ${s.nome}`}
      className='w-full! sm:max-w-lg!'
      footer={
        <>
          <Button variant='secondary' onClick={onChiudi} disabled={inCorso}>
            Annulla
          </Button>
          <Button onClick={() => void aggiungi()} disabled={!pronto} isLoading={inCorso} loadingText='Creo…'>
            Conferma
          </Button>
        </>
      }
    >
      <div className='space-y-5'>
        <div className='flex rounded-lg border border-border-default bg-bg-primary p-0.5' role='group' aria-label='Che cosa aggiungi'>
          {(
            [
              ['controllo', 'Controllo'],
              ['promemoria', 'Promemoria'],
            ] as const
          ).map(([m, etichetta]) => (
            <button
              key={m}
              type='button'
              aria-pressed={modo === m}
              onClick={() => setModo(m)}
              className={cn(
                'h-9 flex-1 rounded-lg px-3 text-sm font-semibold transition-colors',
                modo === m ? 'bg-action-primary text-action-primary-text' : 'text-text-secondary hover:bg-bg-hover'
              )}
            >
              {etichetta}
            </button>
          ))}
        </div>

        {modo === 'controllo' ? (
          <>
            <p className='text-sm text-text-secondary'>
              I controlli del suo tipo e della sua categoria che non hanno già una scadenza aperta. Se non inserisci la data, Vigilo la calcola dai dati
              quando può; altrimenti resta da completare.
            </p>
            {scelte.length === 0 ? (
              <p className='rounded-lg border border-dashed border-border-default p-4 text-center text-sm text-text-secondary'>
                Tutti i controlli che valgono per questo soggetto hanno già una scadenza aperta.
              </p>
            ) : (
              <Select
                label='Controllo'
                value={controllo || undefined}
                placeholder='Scegli…'
                onValueChange={setControllo}
                options={scelte.map(c => ({ value: c.uuid, label: c.automatico ? `${c.nome} (automatico)` : c.nome }))}
              />
            )}
          </>
        ) : (
          <>
            <p className='text-sm text-text-secondary'>Per ciò che non è un controllo: un rinnovo, una consegna, una verifica una tantum.</p>
            <Input label='Titolo' required value={titolo} onChange={e => setTitolo(e.target.value)} maxLength={160} />
          </>
        )}

        <DatePicker
          label={modo === 'controllo' ? 'Scade il (facoltativa)' : 'Scade il'}
          required={modo === 'promemoria'}
          value={scadeIl ? daGiorno(scadeIl) : undefined}
          onChange={d => setScadeIl(d ? aGiorno(d) : '')}
        />
        <TextArea label='Note' value={note} onChange={e => setNote(e.target.value)} maxLength={4096} minRows={1} autoResize />
      </div>
    </Sheet>
  );
};
