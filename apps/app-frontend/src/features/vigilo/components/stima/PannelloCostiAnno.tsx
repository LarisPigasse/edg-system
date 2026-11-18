// src/features/vigilo/components/stima/PannelloCostiAnno.tsx
//
// I costi aziendali di un anno (2026-11-17) nel pannello laterale: anno,
// consuntivo o preventivo, un importo per macro voce, le ore di servizio
// annue dell'azienda e le note. Sotto, mentre si scrive, il totale e il costo
// aziendale per ora di servizio che la stima caricherà sulle ore di ogni servizio.
import React, { useEffect, useState } from 'react';
import { Button, Input, Select, Sheet, TextArea } from '@edg/ui';

import type { CostiAnno, DatiAnno, ParametriStima, StatoCosti, VoceCosti } from '../../types/stima';
import { importo, intero } from '../../utils/numeri';
import { euroCentesimi } from '../../utils/resoconti';

interface Props {
  parametri: ParametriStima;
  /** null = un anno nuovo */
  anno: CostiAnno | null;
  aperto: boolean;
  inCorso: boolean;
  onChiudi: () => void;
  onSalva: (anno: number, dati: DatiAnno) => Promise<boolean>;
}

const STATI: { value: StatoCosti; label: string }[] = [
  { value: 'consuntivo', label: 'Consuntivo (anno chiuso, cifre vere)' },
  { value: 'preventivo', label: 'Preventivo (stime per l’anno)' },
];

const testo = (n: number | null | undefined) => (n == null ? '' : n.toLocaleString('it-IT'));

/** Il primo anno libero dall'anno in corso all'indietro */
const annoLibero = (p: ParametriStima) => {
  const usati = new Set(p.anni.map(a => a.anno));
  let a = p.annoCorrente;
  while (usati.has(a)) a -= 1;
  return a;
};

export const PannelloCostiAnno: React.FC<Props> = ({ parametri, anno, aperto, inCorso, onChiudi, onSalva }) => {
  const [testoAnno, setTestoAnno] = useState('');
  const [stato, setStato] = useState<StatoCosti>('preventivo');
  const [voci, setVoci] = useState<Partial<Record<VoceCosti, string>>>({});
  const [ore, setOre] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!aperto) return;
    const a = anno?.anno ?? annoLibero(parametri);
    setTestoAnno(String(a));
    setStato(anno?.stato ?? (a < parametri.annoCorrente ? 'consuntivo' : 'preventivo'));
    setVoci(Object.fromEntries(parametri.voci.map(v => [v.chiave, testo(anno?.voci[v.chiave])])));
    setOre(testo(anno?.oreServizio));
    setNote(anno?.note ?? '');
  }, [aperto, anno, parametri]);

  const l = parametri.limiti;
  const valoreAnno = intero(testoAnno);
  const erroreAnno =
    valoreAnno === null || Number.isNaN(valoreAnno) || valoreAnno < l.anno.min || valoreAnno > l.anno.max
      ? `Da ${l.anno.min} a ${l.anno.max}`
      : !anno && parametri.anni.some(a => a.anno === valoreAnno)
        ? 'Quest’anno c’è già: aprilo dall’elenco'
        : undefined;
  const valoriVoci = parametri.voci.map(v => ({ ...v, valore: importo(voci[v.chiave] ?? '') }));
  const erroreVoce = (n: number | null) => (n !== null && (Number.isNaN(n) || n < l.costoAnnuo.min || n > l.costoAnnuo.max) ? `Da 0 a ${testo(l.costoAnnuo.max)} €` : undefined);
  const valoreOre = importo(ore);
  const erroreOre = valoreOre !== null && (Number.isNaN(valoreOre) || valoreOre < l.oreServizio.min || valoreOre > l.oreServizio.max) ? `Da ${l.oreServizio.min} a ${testo(l.oreServizio.max)}` : undefined;
  const pronto = !erroreAnno && !erroreOre && valoriVoci.every(v => !erroreVoce(v.valore));

  // come il servizio: totale delle voci e costo per ora di servizio
  const totale = Math.round(valoriVoci.reduce((t, v) => t + (v.valore && !Number.isNaN(v.valore) ? v.valore : 0), 0) * 100) / 100;
  const perOra = valoreOre && !Number.isNaN(valoreOre) && valoreOre > 0 ? Math.round((totale / valoreOre) * 100) / 100 : null;

  const salva = async () => {
    if (!pronto || valoreAnno === null) return;
    const dati: DatiAnno = {
      stato,
      voci: Object.fromEntries(valoriVoci.map(v => [v.chiave, v.valore])),
      oreServizio: valoreOre,
      note: note.trim() || null,
    };
    if (await onSalva(valoreAnno, dati)) onChiudi();
  };

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title={anno ? `Costi aziendali ${anno.anno}` : 'Costi aziendali di un anno'}
      description='Importi annui per voce, senza i conducenti (si contano nel servizio)'
      className='w-full! sm:max-w-lg!'
      footer={
        <>
          <Button variant='secondary' onClick={onChiudi} disabled={inCorso}>
            Annulla
          </Button>
          <Button onClick={() => void salva()} disabled={!pronto} isLoading={inCorso} loadingText='Salvo…'>
            Salva
          </Button>
        </>
      }
    >
      <div className='space-y-5'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <Input label='Anno' inputMode='numeric' value={testoAnno} onChange={e => setTestoAnno(e.target.value)} error={erroreAnno} disabled={!!anno} required />
          <Select label='Cifre' value={stato} onValueChange={v => setStato(v as StatoCosti)} options={STATI} />
        </div>
        {valoriVoci.map(v => (
          <Input
            key={v.chiave}
            label={`${v.nome} (€ all'anno)`}
            inputMode='decimal'
            value={voci[v.chiave] ?? ''}
            onChange={e => setVoci(x => ({ ...x, [v.chiave]: e.target.value }))}
            error={erroreVoce(v.valore)}
          />
        ))}
        <Input
          label='Ore di servizio annue'
          inputMode='decimal'
          value={ore}
          onChange={e => setOre(e.target.value)}
          error={erroreOre}
          helperText='Le ore di mezzi e conducenti a lavoro nell’anno: su queste si dividono i costi aziendali.'
        />
        <TextArea label='Note' value={note} onChange={e => setNote(e.target.value)} maxLength={1024} minRows={1} autoResize />
        <div className='rounded-lg border border-border-default p-3 text-sm'>
          <p className='flex justify-between'>
            <span className='text-text-secondary'>Totale costi aziendali</span>
            <span className='font-semibold tabular-nums'>{euroCentesimi(totale)}</span>
          </p>
          <p className='flex justify-between'>
            <span className='text-text-secondary'>Costo aziendale per ora di servizio</span>
            <span className='font-semibold tabular-nums text-action-primary'>{perOra === null ? 'servono le ore' : `${euroCentesimi(perOra)}/h`}</span>
          </p>
        </div>
      </div>
    </Sheet>
  );
};
