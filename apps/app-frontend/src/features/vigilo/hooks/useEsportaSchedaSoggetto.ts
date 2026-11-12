// src/features/vigilo/hooks/useEsportaSchedaSoggetto.ts
//
// La scheda del soggetto in PDF (report, 2026-11-12): dati e scadenze aperte
// li ha già la pagina; qui si leggono insieme i controlli, le ultime
// registrazioni, le assegnazioni (mezzi e persone) e, con vigilo.costi, il
// costo dei 12 mesi (veicoli, macchine e attrezzature). Il contenuto lo
// compone utils/pdfSoggetto.ts.
import { useState } from 'react';
import { exportReportToPdf, useToast } from '@edg/ui';

import { leggiControlliSoggetto } from '../api/controlliSoggetto';
import { leggiCostoMezzi } from '../api/resoconti';
import { leggiAssegnazioni, leggiStorico } from '../api/soggetti';
import { TIPI_CON_POSSESSO } from '../constants/costoMezzi';
import type { Assegnazione } from '../types/soggetti';
import type { TipoSoggetto } from '../types/valori';
import { oggiLocale } from '../utils/giorni';
import { REGISTRAZIONI_SCHEDA, schedaSoggettoPdf } from '../utils/pdfSoggetto';
import type { StatoSoggettoAperto } from './useSoggetto';

/** Le assegnazioni del soggetto, se il suo tipo ne ha (mezzi e persone) */
const assegnazioniDi = (uuid: string, tipo: TipoSoggetto): Promise<Assegnazione[] | null> =>
  tipo === 'persona' ? leggiAssegnazioni({ persona: uuid }) : TIPI_CON_POSSESSO.includes(tipo) ? leggiAssegnazioni({ soggetto: uuid }) : Promise.resolve(null);

export function useEsportaSchedaSoggetto(x: StatoSoggettoAperto, conCosti: boolean) {
  const [inCorso, setInCorso] = useState(false);
  const toast = useToast();

  const esporta = async () => {
    const s = x.soggetto;
    if (!s) return;
    setInCorso(true);
    try {
      const [controlli, storico, assegnazioni, costo] = await Promise.all([
        leggiControlliSoggetto(s.uuid).catch(() => null),
        leggiStorico(s.uuid, 1, REGISTRAZIONI_SCHEDA),
        assegnazioniDi(s.uuid, s.tipo),
        conCosti && TIPI_CON_POSSESSO.includes(s.tipo) ? leggiCostoMezzi({ periodo: '12m', soggetto: s.uuid }).catch(() => null) : Promise.resolve(null),
      ]);
      exportReportToPdf(
        schedaSoggettoPdf({
          s,
          campi: x.campi,
          scadenze: x.scadenze,
          controlli,
          registrazioni: storico.righe,
          registrazioniTotali: storico.totale,
          assegnazioni,
          costo: costo?.mezzi[0] ? { mezzo: costo.mezzi[0], soglia: costo.sogliaScostamento } : null,
          oggi: oggiLocale(),
        })
      );
    } catch (e) {
      toast?.danger({ title: 'Scheda non creata', description: (e as Error).message });
    } finally {
      setInCorso(false);
    }
  };

  return { esporta, inCorso };
}
