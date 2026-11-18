// src/features/vigilo/components/stima/ModuloServizio.tsx
//
// Il modulo della stima (2026-11-17, fase 2): trasporto a km o lavoro a ore,
// il mezzo (il suo costo per km o per ora arriva da Vigilo e si può
// correggere), i km con il ritorno a vuoto e quelli in autostrada, oppure le
// ore di lavoro e i pernottamenti, le ore in più, il conducente (persona o
// costo medio, correggibile), i pedaggi noti e le voci extra.
import React from 'react';
import { Button, Input, Plus, Select, Switch, Trash2 } from '@edg/ui';

import type { RiferimentoSoggetto } from '../../types/scadenze';
import type { CalcoloStima, Fonte, ParametriStima, TipoServizio } from '../../types/stima';
import type { Campo, ModuloStima } from '../../utils/moduloStima';
import { costoUnita, euroCentesimi } from '../../utils/resoconti';
import { SceltaSegmenti } from '../SceltaSegmenti';

const NESSUNO = '__nessuno';

const TIPI: { value: TipoServizio; label: string }[] = [
  { value: 'km', label: 'Trasporto (a km)' },
  { value: 'ore', label: 'Lavoro (a ore)' },
];

interface Props {
  modulo: ModuloStima;
  cambia: (m: Partial<ModuloStima>) => void;
  errori: Partial<Record<Campo, string>>;
  mezzi: RiferimentoSoggetto[];
  persone: RiferimentoSoggetto[];
  parametri: ParametriStima;
  calcolo: CalcoloStima | null;
}

const NOMI_TIPO: Record<string, string> = { veicolo: 'veicolo', macchina: 'macchina', attrezzatura: 'attrezzatura' };

/** Da dove viene il costo usato, sotto il campo (i costi del mezzo con tre decimali, come nel calcolo) */
function aiutoCosto(fonte: Fonte | undefined, valore: number | null | undefined, unita: '/km' | '/h', origine: string): string {
  const testo = fonte === 'mezzo' ? costoUnita(valore ?? 0, unita === '/km' ? 'km' : 'ore') : `${euroCentesimi(valore ?? 0)}${unita}`;
  if (fonte === 'mezzo' || fonte === 'persona' || fonte === 'media') return `${origine}: ${testo}. Scrivi un valore per correggerlo.`;
  if (fonte === 'manuale') return 'Scritto a mano: vince sul valore di Vigilo.';
  return 'Non noto: scrivilo, altrimenti conta zero.';
}

export const ModuloServizio: React.FC<Props> = ({ modulo: m, cambia, errori, mezzi, persone, parametri, calcolo }) => {
  const aKm = m.tipo === 'km';
  const u = calcolo?.usati;
  const unitaMezzo: '/km' | '/h' = aKm ? '/km' : '/h';
  const origineCostoOrario = u?.fonteCostoOrario === 'persona' ? `Da ${u.persona?.nome}` : 'Costo medio dei parametri';
  const prossimoId = () => Math.max(0, ...m.extra.map(e => e.id)) + 1;

  return (
    <div className='space-y-5'>
      <SceltaSegmenti etichetta='Tipo di servizio' voci={TIPI} valore={m.tipo} onCambia={tipo => cambia({ tipo })} />
      <Input label='Descrizione' value={m.descrizione} onChange={e => cambia({ descrizione: e.target.value })} maxLength={128} helperText='Es. Nereto → Milano, 24 bancali' />

      <div className='grid gap-4 sm:grid-cols-2'>
        <Select
          label='Mezzo'
          value={m.mezzo ?? NESSUNO}
          onValueChange={v => cambia({ mezzo: v === NESSUNO ? null : v })}
          options={[{ value: NESSUNO, label: 'Nessuno (scrivo il costo)' }, ...mezzi.map(x => ({ value: x.uuid, label: [x.nome, x.identificativo, NOMI_TIPO[x.tipo]].filter(Boolean).join(' · ') }))]}
        />
        <Input
          label={`Costo del mezzo (€${unitaMezzo})`}
          inputMode='decimal'
          value={m.costoMezzo}
          onChange={e => cambia({ costoMezzo: e.target.value })}
          error={errori.costoMezzo}
          helperText={aiutoCosto(u?.fonteMezzo, u?.mezzo?.costo, unitaMezzo, 'Dal mezzo, ultimi 12 mesi')}
        />
      </div>

      {aKm ? (
        <div className='grid gap-4 sm:grid-cols-2'>
          <Input label='Km dell’andata' inputMode='decimal' value={m.km} onChange={e => cambia({ km: e.target.value })} error={errori.km} required />
          <Input
            label='Di cui in autostrada'
            inputMode='decimal'
            value={m.kmAutostrada}
            onChange={e => cambia({ kmAutostrada: e.target.value })}
            error={errori.kmAutostrada}
            helperText='Per stimare i pedaggi se non li conosci.'
          />
          <div className='sm:col-span-2'>
            <Switch label='Ritorno a vuoto' description='Km e pedaggi del ritorno si aggiungono al servizio.' checked={m.ritornoAVuoto} onCheckedChange={v => cambia({ ritornoAVuoto: v })} />
          </div>
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2'>
          <Input label='Ore di lavoro' inputMode='decimal' value={m.oreLavoro} onChange={e => cambia({ oreLavoro: e.target.value })} error={errori.oreLavoro} required />
          <Input
            label='Pernottamenti'
            inputMode='numeric'
            value={m.pernottamenti}
            onChange={e => cambia({ pernottamenti: e.target.value })}
            error={errori.pernottamenti}
            helperText='Notti fuori sede dell’operatore.'
          />
        </div>
      )}
      <Input
        label={aKm ? 'Ore in più (carico, scarico, attese)' : 'Ore in più (trasferimento, preparazione)'}
        inputMode='decimal'
        value={m.oreAggiuntive}
        onChange={e => cambia({ oreAggiuntive: e.target.value })}
        error={errori.oreAggiuntive}
        helperText={aKm ? `Le ore di guida si calcolano dai km (${parametri.generali.velocitaMedia} km/h).` : undefined}
      />

      <div className='grid gap-4 sm:grid-cols-2'>
        <Select
          label={aKm ? 'Conducente' : 'Operatore'}
          value={m.persona ?? NESSUNO}
          onValueChange={v => cambia({ persona: v === NESSUNO ? null : v })}
          options={[{ value: NESSUNO, label: 'Costo medio dei parametri' }, ...persone.map(p => ({ value: p.uuid, label: p.nome }))]}
        />
        <Input
          label='Costo orario (€/h)'
          inputMode='decimal'
          value={m.costoOrario}
          onChange={e => cambia({ costoOrario: e.target.value })}
          error={errori.costoOrario}
          helperText={aiutoCosto(u?.fonteCostoOrario, u?.costoOrario, '/h', origineCostoOrario)}
        />
      </div>

      <Input
        label='Pedaggi noti (€)'
        inputMode='decimal'
        value={m.pedaggi}
        onChange={e => cambia({ pedaggi: e.target.value })}
        error={errori.pedaggi}
        helperText={aKm ? 'Vuoto: stimati dai km in autostrada.' : undefined}
      />

      {/* voci extra: traghetto, permessi, parcheggi… */}
      <div className='space-y-3'>
        <p className='text-sm font-medium text-text-primary'>Extra</p>
        {m.extra.map(e => (
          <div key={e.id} className='flex items-start gap-2'>
            <Input
              label='Voce'
              value={e.descrizione}
              onChange={x => cambia({ extra: m.extra.map(y => (y.id === e.id ? { ...y, descrizione: x.target.value } : y)) })}
              maxLength={128}
              className='flex-1'
            />
            <Input
              label='€'
              inputMode='decimal'
              value={e.importo}
              onChange={x => cambia({ extra: m.extra.map(y => (y.id === e.id ? { ...y, importo: x.target.value } : y)) })}
              error={errori[`extra-${e.id}`]}
              className='w-32'
            />
            <Button variant='outline' size='sm' className='mt-5' aria-label='Togli la voce' onClick={() => cambia({ extra: m.extra.filter(y => y.id !== e.id) })}>
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        ))}
        {m.extra.length < parametri.limiti.extraMassimi && (
          <Button variant='outline' size='sm' leftIcon={<Plus className='h-4 w-4' />} onClick={() => cambia({ extra: [...m.extra, { id: prossimoId(), descrizione: '', importo: '' }] })}>
            Aggiungi voce
          </Button>
        )}
      </div>
    </div>
  );
};
