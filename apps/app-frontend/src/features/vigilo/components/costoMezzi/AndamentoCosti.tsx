// src/features/vigilo/components/costoMezzi/AndamentoCosti.tsx
//
// La finestra "Andamento dei costi" di un mezzo (2026-11-16): come variano
// nel tempo i tre blocchi del costo, per capire per esempio che un mezzo con
// un possesso basso si rompe spesso o consuma molto. Periodo a scelta (ultimi
// 12 mesi, anno, anno precedente, da quando c'è, dal… al…), vista mese per
// mese o cumulata, grafico (linee, barre impilate, aree cumulate o ciambella,
// GraficoAndamento) e, sotto, i totali del periodo con la quota di ciascun
// blocco e la media al mese. A destra il periodo in parole e il pulsante PDF:
// cifre, grafico com'è a video e tabella mese per mese (utils/pdfAndamento.ts). Gli obblighi (bollo,
// assicurazione, revisione) stanno nel possesso ripartiti sui 12 mesi dal
// pagamento: il possesso resta il costo fisso, quasi una retta. Solo mesi
// chiusi (dati consolidati), tranne "Ultimi 12 mesi", lo stesso periodo della
// scheda: lì il mese in corso c'è ed è segnato e gli obblighi contano per
// intero nel mese del pagamento, così le cifre coincidono con la scheda.
import React, { useRef, useState } from 'react';
import { Alert, Button, DatePicker, FileText, Modal, Select, Skeleton, Table, cn, coloreDelTema, exportReportToPdf, svgInImmagine, useToast, type TableColumn } from '@edg/ui';

import { COLORI_ANDAMENTO, GRAFICI_ANDAMENTO, NOMI_BLOCCHI, PERIODI_ANDAMENTO, type BloccoAndamento as Blocco } from '../../constants/costoMezzi';
import { useAndamentoCosti, type VistaAndamento } from '../../hooks/useAndamentoCosti';
import type { AndamentoCosti as Dati, PeriodoAndamento, TipoGraficoAndamento } from '../../types/costoMezzi';
import { aGiorno, daGiorno, oggiLocale } from '../../utils/giorni';
import { andamentoPdf } from '../../utils/pdfAndamento';
import { euroBrevi, periodoTesto } from '../../utils/resoconti';
import { GraficoAndamento } from './GraficoAndamento';

interface Props {
  aperto: boolean;
  onChiudi: () => void;
  mezzo: { uuid: string; nome: string };
}

const VISTE: { value: VistaAndamento; label: string }[] = [
  { value: 'mese', label: 'Mese per mese' },
  { value: 'cumulato', label: 'Cumulato' },
];

interface RigaTotale {
  chiave: Blocco | 'totale';
  voce: string;
  nota?: string;
  totale: number;
  quota: number | null;
  media: number;
}

/** Le righe della tabella sotto il grafico: i tre blocchi e il totale */
function righeTotali(d: Dati): RigaTotale[] {
  const mesi = Math.max(d.mesi.length, 1);
  const riga = (chiave: Blocco, nota?: string): RigaTotale => ({ chiave, voce: NOMI_BLOCCHI[chiave], nota, totale: d.totali[chiave], quota: d.quote[chiave], media: d.totali[chiave] / mesi });
  return [
    riga('possesso', `${euroBrevi(d.totali.quota)} quote · ${euroBrevi(d.totali.obblighi)} obblighi${d.obblighiRipartiti ? ' ripartiti' : ''}`),
    riga('manutenzione'),
    riga('uso'),
    { chiave: 'totale', voce: 'Totale', totale: d.totali.totale, quota: null, media: d.totali.totale / mesi },
  ];
}

const colonne: TableColumn<RigaTotale>[] = [
  {
    header: 'Voce',
    accessor: r => (
      <span className={cn('flex items-center gap-2', r.chiave === 'totale' && 'font-semibold')}>
        {r.chiave !== 'totale' && <span className='h-2 w-4 shrink-0 rounded-sm' style={{ background: COLORI_ANDAMENTO[r.chiave] }} aria-hidden='true' />}
        <span>
          {r.voce}
          {/* il dettaglio accanto alla voce, tra parentesi */}
          {r.nota && <span className='ml-1 text-xs text-text-secondary'>({r.nota})</span>}
        </span>
      </span>
    ),
  },
  { header: 'Nel periodo', accessor: r => <span className={cn('tabular-nums', r.chiave === 'totale' && 'font-semibold')}>{euroBrevi(r.totale)}</span>, align: 'right' },
  { header: 'Quota', accessor: r => (r.quota === null ? '' : <span className='tabular-nums'>{r.quota}%</span>), align: 'right' },
  // su telefono si nasconde: le altre tre colonne bastano e la tabella resta nella larghezza
  { header: 'Al mese, in media', accessor: r => <span className='tabular-nums'>{euroBrevi(r.media)}</span>, align: 'right', className: 'hidden sm:table-cell' },
];

export const AndamentoCosti: React.FC<Props> = ({ aperto, onChiudi, mezzo }) => {
  const a = useAndamentoCosti(mezzo.uuid, aperto);
  const d = a.dati;
  const oggi = daGiorno(oggiLocale());
  const contenitore = useRef<HTMLDivElement>(null);
  const [preparo, setPreparo] = useState(false);
  const toast = useToast();

  /** Il PDF: il grafico com'è a video (immagine) con cifre, tabella mese per mese e nota */
  const esportaPdf = async () => {
    if (!d) return;
    setPreparo(true);
    try {
      const svg = contenitore.current?.querySelector<SVGSVGElement>('.recharts-wrapper > svg');
      const immagine = svg ? await svgInImmagine(svg) : null;
      // i colori del tema come veri colori: il PDF non conosce le variabili CSS
      const risolto = (c: string) => (c.startsWith('var(') ? coloreDelTema(c.slice(4, -1)) : c);
      const colori = { possesso: risolto(COLORI_ANDAMENTO.possesso), manutenzione: risolto(COLORI_ANDAMENTO.manutenzione), uso: risolto(COLORI_ANDAMENTO.uso) };
      exportReportToPdf(andamentoPdf({ nome: mezzo.nome, dati: d, grafico: a.grafico, vista: a.vista, immagine, colori, oggi: oggiLocale() }));
    } catch (e) {
      toast?.danger({ title: 'PDF non creato', description: (e as Error).message });
    } finally {
      setPreparo(false);
    }
  };

  return (
    <Modal
      isOpen={aperto}
      onClose={onChiudi}
      size='xxxl'
      title={`Andamento dei costi · ${mezzo.nome}`}
      description='Come variano nel tempo possesso, manutenzione e guasti, rifornimenti e uso.'
      note={
        d && !d.nessunMeseChiuso
          ? d.obblighiRipartiti
            ? 'Gli obblighi (bollo, assicurazione, revisione) sono nel possesso ripartiti sui 12 mesi dal pagamento, perché valgono un anno: il possesso resta il costo fisso.'
            : 'Stesso periodo e stesse cifre della scheda dei costi: gli obblighi (bollo, assicurazione, revisione) contano per intero nel mese in cui si pagano.'
          : undefined
      }
    >
      <div className='space-y-4'>
        {/* periodo, grafico e vista */}
        <div className='flex flex-wrap items-end gap-3'>
          <div className='w-48'>
            <Select optionSize='sm' label='Periodo' value={a.periodo} onValueChange={v => a.setPeriodo(v as PeriodoAndamento)} options={PERIODI_ANDAMENTO} />
          </div>
          <div className='w-48'>
            <Select optionSize='sm' label='Grafico' value={a.grafico} onValueChange={v => a.setGrafico(v as TipoGraficoAndamento)} options={GRAFICI_ANDAMENTO} />
          </div>
          {a.periodo === 'personalizzato' && (
            <>
              <div className='w-40'>
                <DatePicker label='Dal' value={a.dal ? daGiorno(a.dal) : undefined} onChange={x => a.setDal(x ? aGiorno(x) : '')} maxDate={oggi} />
              </div>
              <div className='w-40'>
                <DatePicker label='Al' value={a.al ? daGiorno(a.al) : undefined} onChange={x => a.setAl(x ? aGiorno(x) : '')} maxDate={oggi} />
              </div>
            </>
          )}
          {/* mese per mese o cumulata: solo per le linee (le barre sono mensili, le aree cumulate) */}
          {a.grafico === 'linee' && (
            <div className='flex h-10 items-center rounded-lg border border-border-default p-0.5 text-sm' role='group' aria-label='Vista'>
              {VISTE.map(v => (
                <button
                  key={v.value}
                  type='button'
                  aria-pressed={a.vista === v.value}
                  onClick={() => a.setVista(v.value)}
                  className={cn('h-full rounded-md px-3 transition-colors', a.vista === v.value ? 'bg-action-primary text-action-primary-text' : 'text-text-secondary hover:bg-bg-hover')}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
          {/* a destra: il periodo in parole e il PDF */}
          <div className='ml-auto flex items-center gap-3'>
            {d && <p className='text-sm font-semibold text-text-primary'>{periodoTesto(d.periodo)}</p>}
            <Button
              variant='outline'
              size='sm'
              leftIcon={<FileText className='h-4 w-4' />}
              onClick={() => void esportaPdf()}
              disabled={!d || d.nessunMeseChiuso || a.caricamento}
              isLoading={preparo}
              loadingText='Preparo…'
            >
              PDF
            </Button>
          </div>
        </div>

        {a.errore ? (
          <Alert variant='danger' title='Andamento non letto'>
            {a.errore}
          </Alert>
        ) : !d ? (
          <Skeleton className='h-96 w-full' />
        ) : d.nessunMeseChiuso ? (
          <p className='rounded-lg border border-dashed border-border-default p-8 text-center text-sm text-text-secondary'>
            In questo periodo non c&apos;è ancora un mese chiuso: il grafico mostra solo dati consolidati. Scegli un altro periodo.
          </p>
        ) : (
          <>
            {d.troncato && <p className='text-sm text-text-secondary'>Il mezzo c&apos;è da più di 4 anni: si vedono gli ultimi 4.</p>}
            <div ref={contenitore} className={cn('space-y-1 transition-opacity', a.caricamento && 'opacity-50')}>
              <GraficoAndamento tipo={a.grafico} vista={a.vista} dati={d} />
            </div>

            <Table data={righeTotali(d)} columns={colonne} keyExtractor={r => r.chiave} size='sm' hoverable={false} />
          </>
        )}
      </div>
    </Modal>
  );
};
