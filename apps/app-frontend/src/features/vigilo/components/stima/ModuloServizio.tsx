// src/features/vigilo/components/stima/ModuloServizio.tsx
//
// Il modulo della stima (2026-11-17, fase 2): trasporto a km o lavoro a ore,
// il mezzo (le due componenti del suo costo, in movimento e per ora di
// impiego, sono proposte da Vigilo nei campi e si possono correggere), i km con il ritorno a vuoto e quelli in autostrada, oppure le
// ore di lavoro e i pernottamenti, le ore in più, il conducente (persona o
// costo medio, correggibile), i pedaggi noti e le voci extra.
import React from 'react';
import { Button, Input, Plus, Select, Switch, Trash2, cn } from '@edg/ui';

import type { RiferimentoSoggetto } from '../../types/scadenze';
import type { ParametriStima, TipoServizio } from '../../types/stima';
import type { Campo, ModuloStima, ProposteStima } from '../../utils/moduloStima';
import { costoUnitario, importo, testoNumero } from '../../utils/numeri';
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
  /** I costi proposti da Vigilo (mezzo, persona o costo medio) */
  proposte: ProposteStima;
}

const NOMI_TIPO: Record<string, string> = { veicolo: 'veicolo', macchina: 'macchina', attrezzatura: 'attrezzatura' };

/** Sotto il costo del mezzo: da dove viene, o perché manca */
function aiutoMezzo(m: ModuloStima, p: ProposteStima, scritto: number | null): string {
  const unita: 'km' | 'ore' = m.tipo === 'km' ? 'km' : 'ore';
  const c = p.costoMezzo;
  if (!m.mezzo) return unita === 'km' ? 'Scrivi qui il costo per km (carburante e uso).' : 'Scrivi qui il costo per ora motore (carburante e uso).';
  if (!c) return 'Leggo il costo del mezzo…';
  if (c.valore === null)
    return unita === 'km'
      ? `${c.nome || 'Il mezzo'} non ha ancora un costo per km (${c.base === 'ore' ? 'si misura a ore' : 'poco uso registrato'}): scrivilo, altrimenti conta zero.`
      : `${c.nome || 'Il mezzo'} non ha un costo per ora (${c.base === 'km' ? 'si misura a km' : 'nessun contaore con letture'}): scrivilo, altrimenti conta zero.`;
  return scritto === c.valore
    ? 'Carburante e uso, dal mezzo (12 mesi). Puoi correggerlo.'
    : `Scritto a mano (dal mezzo: ${costoUnita(c.valore, unita)}).`;
}

/** Sotto la parte fissa del mezzo: possesso, obblighi e manutenzione per ora di impiego */
function aiutoMezzoOra(m: ModuloStima, p: ProposteStima, scritto: number | null): string {
  const c = p.costoMezzo;
  if (!m.mezzo) return 'Scrivi qui possesso, obblighi e manutenzione per ora di impegno.';
  if (!c) return '';
  if (c.fissoOra === null) return 'Non noto: scrivilo, altrimenti conta zero.';
  return scritto === c.fissoOra
    ? 'Possesso, obblighi e manutenzione, dal mezzo. Puoi correggerlo.'
    : `Scritto a mano (dal mezzo: ${euroCentesimi(c.fissoOra)}/h).`;
}

/** Sotto il costo orario: da dove viene, o perché manca */
function aiutoOrario(p: ProposteStima, scritto: number | null): string {
  const c = p.costoOrario;
  if (!c) return '';
  const origine = c.fonte === 'persona' ? `Da ${c.nome}` : c.nome ? `${c.nome} non ha un costo orario: costo medio dei parametri` : 'Costo medio dei parametri';
  if (c.valore === null) return `${origine}: non impostato. Scrivilo, altrimenti le ore contano zero.`;
  return scritto === c.valore ? `${origine}. Puoi correggerlo.` : `Scritto a mano (${origine.toLowerCase()}: ${euroCentesimi(c.valore)}/h).`;
}

export const ModuloServizio: React.FC<Props> = ({ modulo: m, cambia, errori, mezzi, persone, parametri, proposte }) => {
  const aKm = m.tipo === 'km';
  const prossimoId = () => Math.max(0, ...m.extra.map(e => e.id)) + 1;

  return (
    <div className='space-y-5'>
      <SceltaSegmenti etichetta='Tipo di servizio' voci={TIPI} valore={m.tipo} onCambia={tipo => cambia({ tipo })} />
      <Input label='Descrizione' value={m.descrizione} onChange={e => cambia({ descrizione: e.target.value })} maxLength={128} helperText='Es. Nereto → Milano, 24 bancali' />

      {/* tre colonne (una sul telefono): mezzo e i suoi due costi; km, autostrada e ritorno (o ore di lavoro,
          pernottamenti e ore in più); ore in più, conducente e costo orario (o conducente, costo e pedaggi); pedaggi */}
      <div className='grid gap-x-4 gap-y-5 md:grid-cols-3'>
        <Select
          optionSize='sm'
          label='Mezzo'
          value={m.mezzo ?? NESSUNO}
          onValueChange={v => cambia({ mezzo: v === NESSUNO ? null : v })}
          options={[{ value: NESSUNO, label: 'Nessuno: scrivo i costi qui sotto' }, ...mezzi.map(x => ({ value: x.uuid, label: [x.nome, x.identificativo, NOMI_TIPO[x.tipo]].filter(Boolean).join(' · ') }))]}
        />
        <Input
          label={aKm ? 'Mezzo in movimento (€/km)' : 'Mezzo, ore motore (€/h)'}
          inputMode='decimal'
          value={m.costoMezzo}
          onChange={e => cambia({ costoMezzo: e.target.value })}
          error={errori.costoMezzo}
          helperText={aiutoMezzo(m, proposte, costoUnitario(m.costoMezzo))}
        />
        <Input
          label='Mezzo per ora di impiego (€/h)'
          inputMode='decimal'
          value={m.costoMezzoOra}
          onChange={e => cambia({ costoMezzoOra: e.target.value })}
          error={errori.costoMezzoOra}
          helperText={aiutoMezzoOra(m, proposte, importo(m.costoMezzoOra))}
        />

        {aKm ? (
          <>
            <Input label='Km dell’andata' inputMode='decimal' value={m.km} onChange={e => cambia({ km: e.target.value })} error={errori.km} required />
            <Input
              label='Di cui in autostrada'
              inputMode='decimal'
              value={m.kmAutostrada}
              onChange={e => cambia({ kmAutostrada: e.target.value })}
              error={errori.kmAutostrada}
              helperText='Per stimare i pedaggi.'
            />
            <div className='flex items-center'>
              <Switch label='Ritorno a vuoto' description='Km e pedaggi raddoppiano.' checked={m.ritornoAVuoto} onCheckedChange={v => cambia({ ritornoAVuoto: v })} />
            </div>
          </>
        ) : (
          <>
            <Input label='Ore di lavoro' inputMode='decimal' value={m.oreLavoro} onChange={e => cambia({ oreLavoro: e.target.value })} error={errori.oreLavoro} required />
            <Input
              label='Pernottamenti'
              inputMode='numeric'
              value={m.pernottamenti}
              onChange={e => cambia({ pernottamenti: e.target.value })}
              error={errori.pernottamenti}
              helperText='Notti fuori sede.'
            />
          </>
        )}

        <Input
          label={aKm ? 'Ore in più (carico, scarico, attese)' : 'Ore in più (trasferimento, preparazione)'}
          inputMode='decimal'
          value={m.oreAggiuntive}
          onChange={e => cambia({ oreAggiuntive: e.target.value })}
          error={errori.oreAggiuntive}
          helperText={aKm ? `La guida viene dai km (${testoNumero(parametri.generali.velocitaMedia)} km/h).` : undefined}
        />
        <Select
          optionSize='sm'
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
          helperText={aiutoOrario(proposte, importo(m.costoOrario))}
        />

        <Input
          label='Pedaggi noti (€)'
          inputMode='decimal'
          value={m.pedaggi}
          onChange={e => cambia({ pedaggi: e.target.value })}
          error={errori.pedaggi}
          helperText={aKm ? 'Vuoto: stimati dai km in autostrada.' : undefined}
        />

        {/* voci extra (traghetto, permessi, parcheggi…): nelle colonne libere accanto ai pedaggi, per non allungare il modulo */}
        <div className={cn('space-y-3', aKm ? 'md:col-span-2' : 'md:col-span-3')}>
          <div className='flex items-center justify-between gap-2'>
            <p className='text-sm font-medium text-text-primary'>Extra</p>
            {m.extra.length < parametri.limiti.extraMassimi && (
              <Button
                variant='outline'
                size='sm'
                leftIcon={<Plus className='h-4 w-4' />}
                onClick={() => cambia({ extra: [...m.extra, { id: prossimoId(), descrizione: '', importo: '' }] })}
              >
                Aggiungi voce
              </Button>
            )}
          </div>
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
        </div>
      </div>
    </div>
  );
};
