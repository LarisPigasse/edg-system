// src/features/vigilo/components/scadenza/FormRegistra.tsx
//
// "Fatto": quando, con che esito e, se il controllo li prevede, lettura,
// importo, fornitore e riferimento. Pronto in due clic: data di oggi ed esito
// positivo sono già impostati, i dettagli facoltativi stanno chiusi in "Altri
// dettagli" (aperti da soli se qualcuno è obbligatorio). Sotto, la prossima
// scadenza che Vigilo aprirà, correggibile. Se il controllo lo prevede, il
// documento (obbligatorio o facoltativo): si carica qui e passa alla
// registrazione (B9a).
import React, { useState } from 'react';
import { DatePicker, FileText, ImageIcon, Input, RadioGroup, Select, TextArea, X } from '@edg/ui';

import { useDocumentiRegistra } from '../../hooks/useDocumentiRegistra';
import { useFornitori } from '../../hooks/useFornitori';
import type { Capacita } from '../../types/io';
import type { DatiEsecuzione, DatoRegistrazione, DettaglioScadenza, Esito } from '../../types/scadenze';
import { dimensioneLeggibile, eImmagine } from '../../utils/allegati';
import { aGiorno, daGiorno, giornoEsteso, oggiLocale } from '../../utils/giorni';
import { misura } from '../../utils/misure';
import { importo as leggiImporto, intero } from '../../utils/numeri';
import { InArrivo, PulsantiCarica } from '../documenti/CaricaDocumenti';
import { PulsantiForm } from './PulsantiForm';

const NESSUNO = 'nessuno';

interface Props {
  s: DettaglioScadenza;
  capacita: Capacita;
  inCorso: boolean;
  onRegistra: (dati: DatiEsecuzione) => void;
  onAnnulla: () => void;
}

export const FormRegistra: React.FC<Props> = ({ s, capacita, inCorso, onRegistra, onAnnulla }) => {
  const oggi = oggiLocale();
  const r = s.richieste;
  const c = s.contatore;
  const vede = (k: DatoRegistrazione) => r[k] !== 'nascosto';
  const chiede = (k: DatoRegistrazione) => r[k] === 'obbligatorio';

  const conLettura = !!c && vede('lettura');
  const conImporto = capacita.costi && vede('importo');
  const fornitori = useFornitori(vede('fornitore'));
  const conFornitore = vede('fornitore') && fornitori.length > 0;
  const conRiferimento = vede('riferimento');
  const conDocumento = vede('allegato');
  const doc = useDocumentiRegistra(s.uuid);

  const [eseguitaIl, setEseguitaIl] = useState(oggi);
  const [esito, setEsito] = useState<Esito>('positivo');
  const [lettura, setLettura] = useState('');
  const [euro, setEuro] = useState('');
  const [fornitore, setFornitore] = useState(NESSUNO);
  const [riferimento, setRiferimento] = useState('');
  const [note, setNote] = useState('');
  const [altri, setAltri] = useState(['importo', 'fornitore', 'riferimento'].some(k => chiede(k as DatoRegistrazione)));
  const [correggi, setCorreggi] = useState(false);
  const [prossimaIl, setProssimaIl] = useState(s.prossimaSeRegistrataOggi?.scadeIl ?? '');
  const [prossimaSoglia, setProssimaSoglia] = useState(String(s.prossimaSeRegistrataOggi?.sogliaUso ?? ''));
  const [dataNuova, setDataNuova] = useState('');

  const positivo = esito === 'positivo';
  const valoreLettura = intero(lettura);
  const valoreEuro = leggiImporto(euro);
  const soglia = intero(prossimaSoglia);

  // obbligatori solo con esito positivo, come nel servizio
  const manca = (k: DatoRegistrazione, vuoto: boolean) => positivo && chiede(k) && vuoto;
  const pronto =
    !!eseguitaIl &&
    !Number.isNaN(valoreLettura) &&
    !Number.isNaN(valoreEuro) &&
    !(correggi && Number.isNaN(soglia)) &&
    !manca('lettura', conLettura && valoreLettura === null) &&
    !manca('importo', conImporto && valoreEuro === null) &&
    !manca('fornitore', conFornitore && fornitore === NESSUNO) &&
    !manca('riferimento', conRiferimento && !riferimento.trim()) &&
    !manca('allegato', conDocumento && !doc.caricati.length) &&
    !doc.inArrivo.length;

  const invia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pronto) return;
    const prossima = positivo && correggi ? { ...(prossimaIl ? { scadeIl: prossimaIl } : {}), ...(soglia !== null ? { sogliaUso: soglia } : {}) } : undefined;
    onRegistra({
      eseguitaIl,
      esito,
      ...(conLettura ? { lettura: valoreLettura } : {}),
      ...(conImporto ? { importo: valoreEuro } : {}),
      ...(conFornitore ? { fornitore: fornitore === NESSUNO ? null : fornitore } : {}),
      ...(conRiferimento ? { riferimento: riferimento.trim() || null } : {}),
      note: note.trim() || null,
      ...(prossima && Object.keys(prossima).length ? { prossima } : {}),
      ...(!positivo && dataNuova ? { dataNuova } : {}),
      ...(conDocumento && doc.caricati.length ? { allegati: doc.consegna() } : {}),
    });
  };

  const proposta = s.prossimaSeRegistrataOggi;
  const testoProposta = !proposta
    ? 'Con questa registrazione la serie finisce: non ci sono altre scadenze dopo questa.'
    : eseguitaIl !== oggi
      ? 'Vigilo calcolerà la prossima scadenza dalla data di esecuzione.'
      : proposta.scadeIl
        ? `Vigilo aprirà la prossima scadenza: ${giornoEsteso(proposta.scadeIl)}.`
        : proposta.sogliaUso !== null && c
          ? `Vigilo aprirà la prossima scadenza a ${misura(proposta.sogliaUso, c.unita)}.`
          : 'Vigilo aprirà la prossima scadenza.';

  return (
    <form onSubmit={invia} className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <DatePicker
          label='Eseguita il'
          value={eseguitaIl ? daGiorno(eseguitaIl) : undefined}
          onChange={d => setEseguitaIl(d ? aGiorno(d) : '')}
          maxDate={daGiorno(oggi)}
          required
        />
        <RadioGroup
          label='Esito'
          orientation='horizontal'
          size='sm'
          value={esito}
          onValueChange={v => setEsito(v as Esito)}
          options={[
            { value: 'positivo', label: 'Positivo' },
            { value: 'negativo', label: 'Negativo' },
          ]}
        />
        {conLettura && c && (
          <Input
            label={`Lettura (${c.unita})`}
            inputMode='numeric'
            value={lettura}
            onChange={e => setLettura(e.target.value)}
            required={positivo && chiede('lettura')}
            error={Number.isNaN(valoreLettura) ? 'Un numero intero' : undefined}
            helperText={c.valore !== null ? `Ultima: ${misura(c.valore, c.unita)}` : undefined}
          />
        )}
      </div>

      {positivo ? (
        <div className='rounded-lg bg-bg-secondary p-3 text-sm text-text-secondary'>
          <p>
            {testoProposta}
            {proposta && (
              <button type='button' onClick={() => setCorreggi(!correggi)} className='ml-1.5 font-semibold text-action-primary hover:underline'>
                {correggi ? 'Lascia calcolare' : 'Correggi'}
              </button>
            )}
          </p>
          {correggi && proposta && (
            <div className='mt-4 grid gap-4 sm:grid-cols-2'>
              {(proposta.scadeIl || !c) && (
                <DatePicker label='Prossima scadenza' value={prossimaIl ? daGiorno(prossimaIl) : undefined} onChange={d => setProssimaIl(d ? aGiorno(d) : '')} />
              )}
              {c && proposta.sogliaUso !== null && (
                <Input
                  label={`Prossima soglia (${c.unita})`}
                  inputMode='numeric'
                  value={prossimaSoglia}
                  onChange={e => setProssimaSoglia(e.target.value)}
                  error={Number.isNaN(soglia) ? 'Un numero intero' : undefined}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <div className='space-y-4 rounded-lg bg-bg-secondary p-3 text-sm text-text-secondary'>
          <p>Con esito negativo la scadenza resta aperta. Se il controllo va ripetuto entro una certa data, indicala qui.</p>
          <DatePicker label='Nuova data (facoltativa)' value={dataNuova ? daGiorno(dataNuova) : undefined} onChange={d => setDataNuova(d ? aGiorno(d) : '')} />
        </div>
      )}

      {(conImporto || conFornitore || conRiferimento) && (
        <div>
          <button type='button' aria-expanded={altri} onClick={() => setAltri(!altri)} className='text-sm font-semibold text-action-primary hover:underline'>
            {altri ? 'Nascondi altri dettagli' : 'Altri dettagli'}
          </button>
          {altri && (
            <div className='mt-4 grid gap-4 sm:grid-cols-2'>
              {conImporto && (
                <Input
                  label='Importo (€)'
                  inputMode='decimal'
                  value={euro}
                  onChange={e => setEuro(e.target.value)}
                  required={positivo && chiede('importo')}
                  error={Number.isNaN(valoreEuro) ? 'Un importo, es. 1.250,50' : undefined}
                />
              )}
              {conFornitore && (
                <Select
                  label='Fornitore'
                  value={fornitore}
                  onValueChange={setFornitore}
                  options={[{ value: NESSUNO, label: 'Nessuno' }, ...fornitori.map(f => ({ value: f.uuid, label: f.nome }))]}
                />
              )}
              {conRiferimento && (
                <Input
                  label='Riferimento'
                  value={riferimento}
                  onChange={e => setRiferimento(e.target.value)}
                  maxLength={128}
                  required={positivo && chiede('riferimento')}
                  helperText='Fattura, verbale, protocollo…'
                />
              )}
            </div>
          )}
        </div>
      )}

      {conDocumento && (
        <div className='space-y-2'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <p className='text-sm font-medium text-text-primary'>
              Documento
              {chiede('allegato') ? <span className='text-text-danger'> *</span> : <span className='font-normal text-text-secondary'> (facoltativo)</span>}
            </p>
            <PulsantiCarica onFile={files => void doc.carica(files)} disabilitato={doc.inArrivo.length > 0 || inCorso} etichetta='Allega' />
          </div>
          <InArrivo voci={doc.inArrivo} />
          {doc.caricati.length > 0 && (
            <ul className='divide-y divide-border-thin rounded-lg border border-border-default'>
              {doc.caricati.map(a => {
                const Icona = eImmagine(a.tipo) ? ImageIcon : FileText;
                return (
                  <li key={a.uuid} className='flex items-center gap-3 px-3 py-2 text-sm'>
                    <Icona className='h-4 w-4 shrink-0 text-text-secondary' aria-hidden />
                    <span className='min-w-0 flex-1 truncate text-text-primary'>{a.nome}</span>
                    <span className='shrink-0 text-xs text-text-secondary'>{dimensioneLeggibile(a.dimensione)}</span>
                    <button
                      type='button'
                      onClick={() => void doc.togli(a)}
                      aria-label={`Togli ${a.nome}`}
                      title='Togli'
                      className='rounded-md p-1 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {positivo && chiede('allegato') && !doc.caricati.length && !doc.inArrivo.length && (
            <p className='text-xs text-text-secondary'>Questo controllo chiede un documento: il certificato, la ricevuta o una foto.</p>
          )}
        </div>
      )}

      <TextArea label='Note' value={note} onChange={e => setNote(e.target.value)} maxLength={4096} minRows={1} autoResize />

      <PulsantiForm pronto={pronto} inCorso={inCorso} onAnnulla={onAnnulla} />
    </form>
  );
};
