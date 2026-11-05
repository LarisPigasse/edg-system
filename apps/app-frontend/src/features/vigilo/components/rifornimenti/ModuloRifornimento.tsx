// src/features/vigilo/components/rifornimenti/ModuloRifornimento.tsx
//
// "Registra un rifornimento" (o la sua correzione) in un pannello laterale,
// per l'ufficio e per l'addetto nei suoi mezzi (tappa 2): che cosa
// (carburante, AdBlue, pedaggi, altro), quando, quanto; i litri per carburante
// e AdBlue, con il prezzo al litro calcolato; i km o le ore letti, che
// diventano una lettura del contatore principale; il fornitore (solo chi ha
// vigilo.write), il riferimento, le note e lo scontrino. Pronto in pochi
// tocchi: data di oggi e carburante già scelti.
import React, { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Input, RadioGroup, Sheet, TextArea } from '@edg/ui';

import { LIMITI_RIFORNIMENTO, NOMI_VOCI, VOCI_RIFORNIMENTO } from '../../constants/rifornimenti';
import { useAllegati } from '../../hooks/useAllegati';
import { useFornitori } from '../../hooks/useFornitori';
import { useModuloRifornimento } from '../../hooks/useModuloRifornimento';
import type { Fornitore } from '../../types/fornitori';
import type { Rifornimento, VoceRifornimento } from '../../types/rifornimenti';
import type { Contatore } from '../../types/scadenze';
import { aGiorno, daGiorno, giornoBreve, oggiLocale } from '../../utils/giorni';
import { misura } from '../../utils/misure';
import { conLitri, contatorePrincipale, leggiCampi, prezzoAlLitro, prezzoLitroTesto, type CampiRifornimento } from '../../utils/rifornimenti';
import { CampoFornitore, NESSUN_FORNITORE } from '../scadenza/CampoFornitore';
import { ScontriniRifornimento } from './ScontriniRifornimento';

export interface MezzoRifornimento {
  uuid: string;
  nome: string;
  identificativo?: string | null;
  contatori: Contatore[];
}

interface Props {
  aperto: boolean;
  mezzo: MezzoRifornimento;
  /** In correzione */
  rifornimento?: Rifornimento | null;
  /** vigilo.write: il fornitore e la rubrica */
  conFornitore: boolean;
  onChiudi: () => void;
  onSalvato: (r: Rifornimento) => void;
}

const VUOTI = (oggi: string): CampiRifornimento => ({ voce: 'carburante', fattoIl: oggi, litri: '', importo: '', lettura: '' });

const comeTesto = (n: number | null | undefined): string => (n == null ? '' : n.toLocaleString('it-IT', { maximumFractionDigits: 2 }));

const daRifornimento = (r: Rifornimento): CampiRifornimento => ({
  voce: r.voce,
  fattoIl: r.fattoIl,
  litri: comeTesto(r.litri),
  importo: r.importo == null ? '' : r.importo.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  lettura: r.lettura ? String(r.lettura.valore) : '',
});

export const ModuloRifornimento: React.FC<Props> = ({ aperto, mezzo, rifornimento, conFornitore, onChiudi, onSalvato }) => {
  const m = useModuloRifornimento();
  const oggi = oggiLocale();
  const { fornitori, aggiungi } = useFornitori(aperto && conFornitore);
  const allegati = useAllegati('rifornimento', rifornimento?.uuid ?? null, aperto && !!rifornimento);
  const contatore = contatorePrincipale(mezzo.contatori);

  const [campi, setCampi] = useState<CampiRifornimento>(() => VUOTI(oggi));
  const [fornitore, setFornitore] = useState(NESSUN_FORNITORE);
  const [riferimento, setRiferimento] = useState('');
  const [note, setNote] = useState('');
  const [scelti, setScelti] = useState<File[]>([]);

  // a ogni apertura: da capo, o i dati del rifornimento da correggere
  useEffect(() => {
    if (!aperto) return;
    setCampi(rifornimento ? daRifornimento(rifornimento) : VUOTI(oggiLocale()));
    setFornitore(rifornimento?.fornitore?.uuid ?? NESSUN_FORNITORE);
    setRiferimento(rifornimento?.riferimento ?? '');
    setNote(rifornimento?.note ?? '');
    setScelti([]);
  }, [aperto, rifornimento]);

  const imposta = (c: Partial<CampiRifornimento>) => setCampi(v => ({ ...v, ...c }));
  // in correzione, chi ha vigilo.write senza i costi non vede l'importo: non lo tocca
  const importoNascosto = !!rifornimento && rifornimento.importo === undefined;
  const l = leggiCampi(campi, oggi);
  const pronto = importoNascosto ? Object.values(l.errori).every(e => !e) : l.pronto;
  const prezzo = prezzoAlLitro(l.importo, l.litri);

  // un fornitore disattivato resta scelto in correzione
  const scelta: Fornitore[] = useMemo(() => {
    const f = rifornimento?.fornitore;
    return f && !fornitori.some(x => x.uuid === f.uuid) ? [...fornitori, { uuid: f.uuid, nome: f.nome } as Fornitore] : fornitori;
  }, [fornitori, rifornimento]);

  const salva = async () => {
    if (!pronto || m.inCorso) return;
    const r = await m.salva(
      {
        ...(rifornimento ? {} : { soggetto: mezzo.uuid }),
        fattoIl: campi.fattoIl,
        voce: campi.voce,
        litri: conLitri(campi.voce) ? l.litri : null,
        ...(importoNascosto ? {} : { importo: l.importo! }),
        lettura: contatore ? l.lettura : null,
        ...(conFornitore ? { fornitore: fornitore === NESSUN_FORNITORE ? null : fornitore } : {}),
        riferimento: riferimento.trim() || null,
        note: note.trim() || null,
      },
      scelti,
      rifornimento?.uuid
    );
    if (r) {
      onChiudi();
      onSalvato(r);
    }
  };

  const ultima = contatore?.valore != null ? `Ultima: ${misura(contatore.valore, contatore.unita)}${contatore.lettoIl ? ` il ${giornoBreve(contatore.lettoIl)}` : ''}` : undefined;

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && !m.inCorso && onChiudi()}
      title={rifornimento ? 'Correggi il rifornimento' : 'Registra un rifornimento'}
      description={[mezzo.nome, mezzo.identificativo].filter(Boolean).join(' · ')}
      className='w-full! sm:max-w-lg!'
      footer={
        <>
          <Button variant='secondary' onClick={onChiudi} disabled={m.inCorso}>
            Annulla
          </Button>
          <Button onClick={() => void salva()} disabled={!pronto} isLoading={m.inCorso} loadingText='Salvo…'>
            {rifornimento ? 'Salva' : 'Registra'}
          </Button>
        </>
      }
    >
      <form
        className='space-y-5'
        onSubmit={e => {
          e.preventDefault();
          void salva();
        }}
      >
        <RadioGroup
          label='Che cosa'
          orientation='horizontal'
          value={campi.voce}
          onValueChange={v => imposta({ voce: v as VoceRifornimento })}
          options={VOCI_RIFORNIMENTO.map(v => ({ value: v, label: NOMI_VOCI[v] }))}
        />
        <div className='grid gap-4 sm:grid-cols-2'>
          <DatePicker
            label='Il'
            value={campi.fattoIl ? daGiorno(campi.fattoIl) : undefined}
            onChange={d => imposta({ fattoIl: d ? aGiorno(d) : '' })}
            maxDate={daGiorno(oggi)}
            error={l.errori.fattoIl}
            required
          />
          {!importoNascosto && (
            <Input
              label='Importo (€)'
              inputMode='decimal'
              value={campi.importo}
              onChange={e => imposta({ importo: e.target.value })}
              error={l.errori.importo}
              required
            />
          )}
          {conLitri(campi.voce) && (
            <Input
              label='Litri'
              inputMode='decimal'
              value={campi.litri}
              onChange={e => imposta({ litri: e.target.value })}
              error={l.errori.litri}
              helperText={prezzo != null && !l.errori.litri ? prezzoLitroTesto(prezzo) : 'Servono al consumo medio'}
            />
          )}
          {contatore && (
            <Input
              label={contatore.unita === 'km' ? 'Km letti' : 'Ore lette'}
              inputMode='numeric'
              value={campi.lettura}
              onChange={e => imposta({ lettura: e.target.value })}
              error={l.errori.lettura}
              helperText={ultima ?? 'Diventano una lettura del contatore'}
            />
          )}
        </div>
        {importoNascosto && <p className='text-sm text-text-secondary'>L’importo lo vede solo chi segue i costi: resta com’è.</p>}
        <div className='grid gap-4 sm:grid-cols-2'>
          {conFornitore && <CampoFornitore fornitori={scelta} valore={fornitore} onValore={setFornitore} puoAggiungere onCreato={aggiungi} />}
          <Input
            label='Riferimento'
            value={riferimento}
            onChange={e => setRiferimento(e.target.value)}
            maxLength={LIMITI_RIFORNIMENTO.riferimento}
            helperText='N. di scontrino, fattura o carta'
          />
        </div>
        <TextArea label='Note' value={note} onChange={e => setNote(e.target.value)} maxLength={LIMITI_RIFORNIMENTO.note} minRows={2} autoResize />
        <div className='border-t border-border-thin pt-4'>
          <ScontriniRifornimento
            esistenti={allegati.voci ?? []}
            scelti={scelti}
            inArrivo={m.inArrivo}
            disabilitato={m.inCorso}
            onScegli={f => setScelti(s => [...s, ...f])}
            onTogli={i => setScelti(s => s.filter((_, j) => j !== i))}
            onApri={a => void allegati.apri(a)}
            onElimina={allegati.elimina}
            eliminabile={a => conFornitore || a.tuo}
          />
        </div>
      </form>
    </Sheet>
  );
};
