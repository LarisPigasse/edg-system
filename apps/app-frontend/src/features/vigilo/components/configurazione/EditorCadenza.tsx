// src/features/vigilo/components/configurazione/EditorCadenza.tsx
//
// L'editor della cadenza di un controllo (2026-11-19, passo 2b): i tipi più
// comuni (ogni N giorni/mesi/anni, ogni N km/ore, tempo e uso insieme, una
// tantum) e le personalizzazioni che la libreria usa: da dove si conta
// (scadenza, esecuzione, finestra), a fine mese, prima scadenza da una data
// del soggetto, durata che cambia con l'età. Campi compatti su più colonne;
// la frase in parole e i controlli di coerenza li dà il servizio (anteprima).
import React from 'react';
import { Button, Input, Plus, Select, Switch, Trash2 } from '@edg/ui';

import { DATI_TIPO } from '../../constants/datiTipo';
import type { Cadenza, Durata } from '../../types/cadenza';
import type { TipoSoggetto } from '../../types/valori';
import { LIMITI_CADENZA, conTipo, tipoDi, type TipoCadenza } from '../../utils/cadenza';
import { SceltaSegmenti } from '../SceltaSegmenti';

interface Props {
  cadenza: Cadenza;
  tipoSoggetto: TipoSoggetto;
  onChange: (c: Cadenza) => void;
}

const TIPI: { value: TipoCadenza; label: string }[] = [
  { value: 'tempo', label: 'A tempo' },
  { value: 'uso', label: 'A uso' },
  { value: 'entrambi', label: 'Tempo e uso' },
  { value: 'una-tantum', label: 'Una tantum' },
];

const UNITA_TEMPO: { value: Durata['unita']; label: string }[] = [
  { value: 'giorni', label: 'giorni' },
  { value: 'mesi', label: 'mesi' },
  { value: 'anni', label: 'anni' },
];

const ANCORAGGI: { value: Cadenza['ancoraggio']; label: string }[] = [
  { value: 'scadenza', label: 'Dalla scadenza precedente' },
  { value: 'esecuzione', label: 'Dalla data in cui è fatto' },
  { value: 'finestra', label: 'Dalla scadenza, se fatto entro una finestra' },
];

/** Un numero del campo: vuoto = NaN (lo segnalano gli errori) */
const numero = (testo: string) => (testo.trim() === '' ? NaN : Number(testo));
const testo = (n: number) => (Number.isNaN(n) ? '' : String(n));

/** Quantità e unità di tempo in due campi affiancati */
const CampiDurata: React.FC<{ etichetta: string; durata: Durata; onChange: (d: Durata) => void }> = ({ etichetta, durata, onChange }) => (
  <>
    <Input label={etichetta} inputMode='numeric' value={testo(durata.valore)} onChange={e => onChange({ ...durata, valore: numero(e.target.value) })} />
    <Select optionSize='sm' label='Unità' value={durata.unita} onValueChange={v => onChange({ ...durata, unita: v as Durata['unita'] })} options={UNITA_TEMPO} />
  </>
);

export const EditorCadenza: React.FC<Props> = ({ cadenza: c, tipoSoggetto, onChange }) => {
  const tipo = tipoDi(c);
  const cambia = (x: Partial<Cadenza>) => onChange({ ...c, ...x });
  // le date del soggetto da cui possono partire la prima scadenza e le fasce d'età
  const date = DATI_TIPO[tipoSoggetto].filter(d => d.formato === 'data').map(d => ({ value: d.chiave, label: d.etichetta }));

  return (
    <div className='space-y-5'>
      <SceltaSegmenti etichetta='Tipo di cadenza' voci={TIPI} valore={tipo} onCambia={t => onChange(conTipo(c, t))} />

      {tipo === 'una-tantum' && <p className='text-sm text-text-secondary'>Una volta registrato, il controllo è concluso: non si ripete.</p>}

      {c.tempo && (
        <div className='grid items-center gap-x-4 gap-y-5 sm:grid-cols-4'>
          <CampiDurata etichetta='Ogni' durata={c.tempo} onChange={tempo => cambia({ tempo })} />
          <Select
            optionSize='sm'
            label='Si conta'
            value={c.ancoraggio}
            onValueChange={v => cambia({ ancoraggio: v as Cadenza['ancoraggio'], finestra: v === 'finestra' ? (c.finestra ?? { valore: 6, unita: 'mesi' }) : null })}
            options={ANCORAGGI}
          />
          <Switch label='A fine mese' checked={c.fineMese} onCheckedChange={fineMese => cambia({ fineMese })} />
        </div>
      )}

      {c.tempo && c.ancoraggio === 'finestra' && c.finestra && (
        <div className='grid items-center gap-x-4 gap-y-5 sm:grid-cols-4'>
          <CampiDurata etichetta='Finestra' durata={c.finestra} onChange={finestra => cambia({ finestra })} />
          <p className='text-xs text-text-secondary sm:col-span-2'>
            Se è fatto entro questo tempo prima della scadenza, la successiva si conta dalla scadenza; altrimenti dalla data in cui è fatto (es. CQC, ADR).
          </p>
        </div>
      )}

      {c.uso && (
        <div className='grid items-center gap-x-4 gap-y-5 sm:grid-cols-4'>
          <Input
            label={tipo === 'entrambi' ? 'Oppure ogni' : 'Ogni'}
            inputMode='numeric'
            value={testo(c.uso.valore)}
            onChange={e => cambia({ uso: { ...c.uso!, valore: numero(e.target.value) } })}
            helperText={`Fino a ${LIMITI_CADENZA.uso.toLocaleString('it-IT')}`}
          />
          <Select
            optionSize='sm'
            label='Unità'
            value={c.uso.unita}
            onValueChange={v => cambia({ uso: { ...c.uso!, unita: v as 'km' | 'ore' } })}
            options={[
              { value: 'km', label: 'km' },
              { value: 'ore', label: 'ore (contaore)' },
            ]}
          />
          {tipo === 'entrambi' && <p className='text-xs text-text-secondary sm:col-span-2'>Vale la prima che arriva, tempo o uso.</p>}
        </div>
      )}

      {/* personalizzazioni: solo con una cadenza a tempo e se il soggetto ha delle date */}
      {c.tempo && date.length > 0 && (
        <div className='space-y-4 rounded-lg border border-border-default p-4'>
          <Switch
            label='Prima scadenza da una data del soggetto'
            description='Es. la prima revisione dopo 4 anni dall’immatricolazione, poi con la cadenza normale.'
            checked={!!c.prima}
            onCheckedChange={v => cambia({ prima: v ? { tempo: { valore: 4, unita: 'anni' }, da: date[0].value } : null })}
          />
          {c.prima && (
            <div className='grid gap-x-4 gap-y-5 sm:grid-cols-4'>
              <CampiDurata etichetta='Dopo' durata={c.prima.tempo} onChange={tempo => cambia({ prima: { ...c.prima!, tempo } })} />
              <Select optionSize='sm' className='sm:col-span-2' label='Dalla data' value={c.prima.da} onValueChange={da => cambia({ prima: { ...c.prima!, da } })} options={date} />
            </div>
          )}

          <Switch
            label="La durata cambia con l'età"
            description="Es. la patente: ogni 10 anni, poi ogni 5 oltre i 50 anni d'età."
            checked={!!c.fasce}
            onCheckedChange={v => cambia({ fasce: v ? { da: date[0].value, elenco: [{ oltre: { valore: 10, unita: 'anni' }, tempo: { ...c.tempo! } }] } : null })}
          />
          {c.fasce && (
            <div className='space-y-3'>
              <div className='grid gap-x-4 sm:grid-cols-4'>
                <Select optionSize='sm' className='sm:col-span-2' label="L'età si conta" value={c.fasce.da} onValueChange={da => cambia({ fasce: { ...c.fasce!, da } })} options={date} />
              </div>
              {c.fasce.elenco.map((f, i) => (
                <div key={i} className='flex flex-wrap items-start gap-x-4 gap-y-3'>
                  <div className='grid flex-1 gap-x-4 gap-y-3 sm:grid-cols-4'>
                    <CampiDurata
                      etichetta='Oltre'
                      durata={f.oltre}
                      onChange={oltre => cambia({ fasce: { ...c.fasce!, elenco: c.fasce!.elenco.map((x, j) => (j === i ? { ...x, oltre } : x)) } })}
                    />
                    <CampiDurata
                      etichetta='Ogni'
                      durata={f.tempo}
                      onChange={tempo => cambia({ fasce: { ...c.fasce!, elenco: c.fasce!.elenco.map((x, j) => (j === i ? { ...x, tempo } : x)) } })}
                    />
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    className='mt-5'
                    aria-label='Togli la fascia'
                    disabled={c.fasce!.elenco.length === 1}
                    onClick={() => cambia({ fasce: { ...c.fasce!, elenco: c.fasce!.elenco.filter((_, j) => j !== i) } })}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              ))}
              {c.fasce.elenco.length < LIMITI_CADENZA.fasce && (
                <Button
                  variant='outline'
                  size='sm'
                  leftIcon={<Plus className='h-4 w-4' />}
                  onClick={() => {
                    const ultima = c.fasce!.elenco[c.fasce!.elenco.length - 1];
                    cambia({ fasce: { ...c.fasce!, elenco: [...c.fasce!.elenco, { oltre: { ...ultima.oltre, valore: ultima.oltre.valore + 10 }, tempo: { ...ultima.tempo } }] } });
                  }}
                >
                  Aggiungi fascia
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
