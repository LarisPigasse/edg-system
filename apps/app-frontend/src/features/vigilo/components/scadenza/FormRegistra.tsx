// src/features/vigilo/components/scadenza/FormRegistra.tsx
//
// "Fatto": quando, con che esito e, se il controllo li prevede, lettura,
// importo, fornitore e riferimento. Pronto in due clic: data di oggi ed esito
// positivo sono già impostati, i dettagli facoltativi stanno chiusi in "Altri
// dettagli" (aperti da soli se qualcuno è obbligatorio). Sotto, la prossima
// scadenza che Vigilo aprirà, correggibile. Se il controllo lo prevede, il
// documento (obbligatorio o facoltativo): si carica qui e passa alla
// registrazione (B9a).
// Con `segnalazione` è la conferma dell'ufficio (B9c): i campi partono dai
// dati dell'addetto, correggibili, e l'esito è positivo.
// Per l'ultimo guasto che blocca il mezzo, "Rimetti in servizio" (B10a).
// "Chi ha fatto il lavoro" e la manodopera interna, se il controllo la
// prevede (passo 8): lì sta anche il fornitore, con Esterno o Entrambi.
import React, { useState } from 'react';
import { Checkbox, DatePicker, Input, RadioGroup, Select, TextArea } from '@edg/ui';

import { useDocumentiRegistra } from '../../hooks/useDocumentiRegistra';
import { useFornitori } from '../../hooks/useFornitori';
import { usePersoneManodopera } from '../../hooks/usePersoneManodopera';
import type { Capacita } from '../../types/io';
import type { DatiEsecuzione, DatoRegistrazione, DettaglioScadenza, Esecuzione, Esito, SegnalazioneInAttesa } from '../../types/scadenze';
import { aGiorno, daGiorno, giornoEsteso, oggiLocale } from '../../utils/giorni';
import { nuovaRiga, righePronte, type RigaInModulo } from '../../utils/manodopera';
import { misura } from '../../utils/misure';
import { importo as leggiImporto, intero } from '../../utils/numeri';
import { CampoDocumento } from './CampoDocumento';
import { CampoManodopera } from './CampoManodopera';
import { PulsantiForm } from './PulsantiForm';

const NESSUNO = 'nessuno';

interface Props {
  s: DettaglioScadenza;
  capacita: Capacita;
  inCorso: boolean;
  onRegistra: (dati: DatiEsecuzione) => void;
  onAnnulla: () => void;
  /** La segnalazione dell'addetto da confermare: i campi partono dai suoi dati */
  segnalazione?: SegnalazioneInAttesa | null;
}

/** Un numero come testo per i campi ('' se manca) */
const testoDi = (n: number | null | undefined) => (n == null ? '' : String(n));

export const FormRegistra: React.FC<Props> = ({ s, capacita, inCorso, onRegistra, onAnnulla, segnalazione = null }) => {
  const seg = segnalazione;
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
  const conManodopera = vede('manodopera');
  const fornitoreInSezione = conManodopera && conFornitore;
  const pm = usePersoneManodopera(conManodopera, capacita.costi);

  const [eseguitaIl, setEseguitaIl] = useState(seg?.eseguitaIl ?? oggi);
  const [esito, setEsito] = useState<Esito>('positivo');
  const [lettura, setLettura] = useState(testoDi(seg?.lettura));
  const [euro, setEuro] = useState(seg?.importo != null ? seg.importo.toLocaleString('it-IT') : '');
  const [fornitore, setFornitore] = useState(seg?.fornitore?.uuid ?? NESSUNO);
  const [riferimento, setRiferimento] = useState(seg?.riferimento ?? '');
  const [note, setNote] = useState(seg?.note ?? '');
  const gia = seg?.documenti ?? 0;
  const [rimetti, setRimetti] = useState(s.rimettiInServizio);
  // chi ha fatto il lavoro: già scelto se il controllo chiede il fornitore o la manodopera
  const [esecuzione, setEsecuzione] = useState<Esecuzione | ''>(conManodopera && chiede('fornitore') ? 'esterna' : conManodopera && chiede('manodopera') ? 'interna' : '');
  const [righe, setRighe] = useState<RigaInModulo[]>(() => (conManodopera && chiede('manodopera') ? [nuovaRiga()] : []));
  const [altri, setAltri] = useState(['importo', 'fornitore', 'riferimento'].some(k => chiede(k as DatoRegistrazione)));
  const [correggi, setCorreggi] = useState(false);
  const [prossimaIl, setProssimaIl] = useState(s.prossimaSeRegistrataOggi?.scadeIl ?? '');
  const [prossimaSoglia, setProssimaSoglia] = useState(String(s.prossimaSeRegistrataOggi?.sogliaUso ?? ''));
  const [dataNuova, setDataNuova] = useState('');

  const positivo = esito === 'positivo';
  const interna = conManodopera && (esecuzione === 'interna' || esecuzione === 'entrambe');
  const manodopera = righePronte(interna ? righe : []);
  // con Esterno ed Entrambi il fornitore; se la rubrica è vuota lo si dice (si scrive nelle note)
  const mostraFornitore = conManodopera && vede('fornitore') && (esecuzione === 'esterna' || esecuzione === 'entrambe' || chiede('fornitore'));
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
    !manca('allegato', conDocumento && !doc.caricati.length && !gia) &&
    !manca('manodopera', conManodopera && !manodopera.pronte.length) &&
    !manodopera.errore &&
    !manodopera.incompleta &&
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
      ...(conFornitore && (!fornitoreInSezione || mostraFornitore) ? { fornitore: fornitore === NESSUNO ? null : fornitore } : {}),
      ...(conManodopera && esecuzione ? { esecuzione } : {}),
      ...(manodopera.pronte.length ? { manodopera: manodopera.pronte } : {}),
      ...(conRiferimento ? { riferimento: riferimento.trim() || null } : {}),
      note: note.trim() || null,
      ...(prossima && Object.keys(prossima).length ? { prossima } : {}),
      ...(!positivo && dataNuova ? { dataNuova } : {}),
      ...(conDocumento && doc.caricati.length ? { allegati: doc.consegna() } : {}),
      ...(positivo && s.rimettiInServizio ? { rimettiInServizio: rimetti } : {}),
    });
  };

  const campoFornitore = (
    <Select
      label='Fornitore'
      value={fornitore}
      onValueChange={setFornitore}
      options={[{ value: NESSUNO, label: 'Nessuno' }, ...fornitori.map(f => ({ value: f.uuid, label: f.nome }))]}
    />
  );

  const proposta = s.prossimaSeRegistrataOggi;
  const testoProposta = !proposta
    ? s.natura === 'riparazione'
      ? 'Con questa registrazione il guasto risulta riparato.'
      : 'Con questa registrazione la serie finisce: non ci sono altre scadenze dopo questa.'
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
        {!seg && (
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
        )}
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

      {conManodopera && (
        <CampoManodopera
          esecuzione={esecuzione}
          onEsecuzione={setEsecuzione}
          righe={righe}
          onRighe={setRighe}
          persone={pm.persone}
          costi={capacita.costi}
          costoPredefinito={pm.costoPredefinito}
          obbligatoria={chiede('manodopera')}
          mostraFornitore={mostraFornitore}
          fornitore={conFornitore ? campoFornitore : <p className='text-xs text-text-secondary'>Nessun fornitore in rubrica: scrivi nelle note chi ha fatto il lavoro.</p>}
        />
      )}

      {(conImporto || (conFornitore && !fornitoreInSezione) || conRiferimento) && (
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
              {conFornitore && !fornitoreInSezione && campoFornitore}
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
        <CampoDocumento doc={doc} obbligatorio={chiede('allegato')} avvisaSeManca={positivo} disabilitato={inCorso} gia={gia} />
      )}

      {positivo && s.rimettiInServizio && (
        <Checkbox
          label='Rimetti in servizio il mezzo'
          description='Era sospeso per questo guasto e non ce ne sono altri che lo bloccano.'
          checked={rimetti}
          onCheckedChange={v => setRimetti(v === true)}
        />
      )}

      <TextArea label='Note' value={note} onChange={e => setNote(e.target.value)} maxLength={4096} minRows={1} autoResize />

      <PulsantiForm pronto={pronto} inCorso={inCorso} onAnnulla={onAnnulla} />
    </form>
  );
};
