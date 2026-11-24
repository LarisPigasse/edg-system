// src/features/vigilo/components/stima/PannelloCostiAnno.tsx
//
// I costi aziendali di un anno (2026-11-17) nel pannello laterale: anno,
// consuntivo o preventivo, un importo per macro voce, la quota che spetta ai
// servizi con i mezzi (trasporti e lavori; il resto alle altre attività), le
// ore di servizio annue dei mezzi, i km annui (con il suggerimento dai contatori dei
// veicoli) e le note. Sotto, mentre si scrive, il totale e il costo aziendale
// per ora di servizio (quello che la stima usa) e per km (mostrato accanto).
import React, { useEffect, useState } from 'react';
import { Button, Input, Select, Sheet, TextArea, useToast } from '@edg/ui';

import { leggiKmSuggeriti } from '../../api/stima';
import { AIUTI_VOCI_COSTI } from '../../constants/stima';

import type { CostiAnno, DatiAnno, KmSuggeriti, ParametriStima, StatoCosti, VoceCosti } from '../../types/stima';
import { importo, intero, testoNumero } from '../../utils/numeri';
import { costoUnita, euroCentesimi } from '../../utils/resoconti';

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

const testo = (n: number | null | undefined) => (n == null ? '' : testoNumero(n));

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
  const [km, setKm] = useState('');
  const [ricavi, setRicavi] = useState('');
  const [quota, setQuota] = useState('100');
  const [suggerimento, setSuggerimento] = useState<KmSuggeriti | null>(null);
  const [cerco, setCerco] = useState(false);
  const toast = useToast();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!aperto) return;
    const a = anno?.anno ?? annoLibero(parametri);
    setTestoAnno(String(a));
    setStato(anno?.stato ?? (a < parametri.annoCorrente ? 'consuntivo' : 'preventivo'));
    setVoci(Object.fromEntries(parametri.voci.map(v => [v.chiave, testo(anno?.voci[v.chiave])])));
    setOre(testo(anno?.oreServizio));
    setKm(testo(anno?.kmAnnui));
    setRicavi(testo(anno?.ricavi));
    setQuota(testo(anno?.quotaMezzi ?? 100));
    setSuggerimento(null);
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
  const valoreKm = importo(km);
  const erroreKm = valoreKm !== null && (Number.isNaN(valoreKm) || valoreKm < l.kmAnnui.min || valoreKm > l.kmAnnui.max) ? `Da ${l.kmAnnui.min} a ${testo(l.kmAnnui.max)}` : undefined;
  const valoreRicavi = importo(ricavi);
  const erroreRicavi =
    valoreRicavi !== null && (Number.isNaN(valoreRicavi) || valoreRicavi < l.ricaviAnnui.min || valoreRicavi > l.ricaviAnnui.max) ? `Da 0 a ${testo(l.ricaviAnnui.max)} €` : undefined;
  const valoreQuota = importo(quota);
  const erroreQuota =
    valoreQuota === null ? 'Obbligatoria (100 se non ci sono altre attività)' : Number.isNaN(valoreQuota) || valoreQuota < l.quotaMezzi.min || valoreQuota > l.quotaMezzi.max ? 'Da 0 a 100' : undefined;
  const pronto = !erroreAnno && !erroreOre && !erroreKm && !erroreRicavi && !erroreQuota && valoriVoci.every(v => !erroreVoce(v.valore));

  /** I km dei veicoli nell'anno dai loro contatori */
  const suggerisci = async () => {
    if (valoreAnno === null || Number.isNaN(valoreAnno)) return;
    setCerco(true);
    try {
      setSuggerimento(await leggiKmSuggeriti(valoreAnno));
    } catch (e) {
      toast?.danger({ title: 'Km non letti', description: (e as Error).message });
    } finally {
      setCerco(false);
    }
  };

  // come il servizio: totale delle voci e costo per ora di servizio
  const totale = Math.round(valoriVoci.reduce((t, v) => t + (v.valore && !Number.isNaN(v.valore) ? v.valore : 0), 0) * 100) / 100;
  // ai servizi con i mezzi solo la loro quota, come il servizio
  const attribuiti = Math.round(totale * (valoreQuota !== null && !Number.isNaN(valoreQuota) ? valoreQuota : 100)) / 100;
  const perOra = valoreOre && !Number.isNaN(valoreOre) && valoreOre > 0 ? Math.round((attribuiti / valoreOre) * 100) / 100 : null;
  const perKm = valoreKm && !Number.isNaN(valoreKm) && valoreKm > 0 ? Math.round((attribuiti / valoreKm) * 1000) / 1000 : null;

  const salva = async () => {
    if (!pronto || valoreAnno === null) return;
    const dati: DatiAnno = {
      stato,
      voci: Object.fromEntries(valoriVoci.map(v => [v.chiave, v.valore])),
      oreServizio: valoreOre,
      kmAnnui: valoreKm,
      quotaMezzi: valoreQuota ?? 100,
      ricavi: valoreRicavi,
      note: note.trim() || null,
    };
    if (await onSalva(valoreAnno, dati)) onChiudi();
  };

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title={anno ? `Costi aziendali ${anno.anno}` : 'Costi aziendali di un anno'}
      description='Importi annui per voce, senza ciò che la stima conta già: conducenti e operatori, spese dei mezzi'
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
          <Select optionSize='sm' label='Cifre' value={stato} onValueChange={v => setStato(v as StatoCosti)} options={STATI} />
        </div>
        {/* la quota vale per tutto l'anno, come anno e cifre: in alto, dove si vede subito */}
        <Input
          label='Quota sui servizi con i mezzi (%)'
          inputMode='decimal'
          value={quota}
          onChange={e => setQuota(e.target.value)}
          error={erroreQuota}
          helperText='La parte dei costi aziendali che spetta a trasporti e lavori con i mezzi; il resto va alle altre attività (facchinaggio, deposito, logistica). 100 se non ce ne sono.'
        />
        {valoriVoci.map(v => (
          <Input
            key={v.chiave}
            label={`${v.nome} (€ all'anno)`}
            inputMode='decimal'
            value={voci[v.chiave] ?? ''}
            onChange={e => setVoci(x => ({ ...x, [v.chiave]: e.target.value }))}
            error={erroreVoce(v.valore)}
            helperText={AIUTI_VOCI_COSTI[v.chiave]}
          />
        ))}
        <Input
          label='Ore di servizio annue'
          inputMode='decimal'
          value={ore}
          onChange={e => setOre(e.target.value)}
          error={erroreOre}
          helperText='Le ore dei soli servizi con i mezzi (trasporti e lavori), non quelle di magazzino o facchinaggio: su queste si divide la quota dei costi.'
        />
        <div className='space-y-2'>
          <Input
            label='Km annui percorsi'
            inputMode='decimal'
            value={km}
            onChange={e => setKm(e.target.value)}
            error={erroreKm}
            helperText='I km di tutti i mezzi nell’anno: danno il costo aziendale per km, mostrato accanto a quello per ora.'
          />
          <div className='flex flex-wrap items-center gap-2'>
            <Button variant='outline' size='sm' onClick={() => void suggerisci()} isLoading={cerco} loadingText='Leggo i contatori…' disabled={!!erroreAnno}>
              Suggerisci dai contatori
            </Button>
            {suggerimento && (
              <span className='flex items-center gap-2 text-sm text-text-secondary'>
                {suggerimento.km === null ? (
                  'Nessun veicolo con letture dei km in quell’anno.'
                ) : (
                  <>
                    <span>
                      Dai contatori di {suggerimento.veicoli} {suggerimento.veicoli === 1 ? 'veicolo' : 'veicoli'}:{' '}
                      <span className='font-semibold tabular-nums text-text-primary'>{testo(suggerimento.km)} km</span>
                      {suggerimento.inCorso ? ' (fino a oggi)' : ''}
                    </span>
                    <Button variant='link' size='sm' onClick={() => setKm(testo(suggerimento.km))}>
                      Usa
                    </Button>
                  </>
                )}
              </span>
            )}
          </div>
        </div>
        <Input
          label='Ricavi dell’anno (€)'
          inputMode='decimal'
          value={ricavi}
          onChange={e => setRicavi(e.target.value)}
          error={erroreRicavi}
          helperText='Facoltativi, a consuntivo o a preventivo come i costi: servono all’Analisi per margine e pareggio.'
        />
        <TextArea label='Note' value={note} onChange={e => setNote(e.target.value)} maxLength={1024} minRows={1} autoResize />
        <div className='rounded-lg border border-border-default p-3 text-sm'>
          <p className='flex justify-between'>
            <span className='text-text-secondary'>Totale costi aziendali</span>
            <span className='font-semibold tabular-nums'>{euroCentesimi(totale)}</span>
          </p>
          <p className='flex justify-between'>
            <span className='text-text-secondary'>Ai servizi con i mezzi</span>
            <span className='font-semibold tabular-nums'>{euroCentesimi(attribuiti)}</span>
          </p>
          <p className='flex justify-between'>
            <span className='text-text-secondary'>Costo aziendale per ora di servizio</span>
            <span className='font-semibold tabular-nums text-action-primary'>{perOra === null ? 'servono le ore' : `${euroCentesimi(perOra)}/h`}</span>
          </p>
          <p className='flex justify-between'>
            <span className='text-text-secondary'>Costo aziendale per km</span>
            <span className='font-semibold tabular-nums'>{perKm === null ? 'servono i km' : costoUnita(perKm, 'km')}</span>
          </p>
        </div>
      </div>
    </Sheet>
  );
};
