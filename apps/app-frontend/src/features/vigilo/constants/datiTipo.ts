// src/features/vigilo/constants/datiTipo.ts
//
// I dati fissi di ogni tipo di soggetto (vigilo-service, datiTipo.ts), con
// l'etichetta e il modo di mostrarli. Stesse chiavi del servizio.
import type { TipoSoggetto } from '../types/valori';

export type FormatoDato = 'testo' | 'data' | 'email' | 'elenco';

export interface DatoTipo {
  chiave: string;
  etichetta: string;
  formato: FormatoDato;
  /** Per gli elenchi: i valori ammessi (come nel servizio) */
  opzioni?: string[];
}

const t = (chiave: string, etichetta: string, formato: FormatoDato = 'testo'): DatoTipo => ({ chiave, etichetta, formato });

export const DATI_TIPO: Record<TipoSoggetto, DatoTipo[]> = {
  veicolo: [t('marca', 'Marca'), t('modello', 'Modello'), t('telaio', 'Telaio'), t('immatricolazione', 'Immatricolazione', 'data'), { chiave: 'alimentazione', etichetta: 'Alimentazione', formato: 'elenco', opzioni: ['gasolio', 'benzina', 'metano', 'gpl', 'elettrico', 'ibrido', 'altro'] }],
  macchina: [t('marca', 'Marca'), t('modello', 'Modello'), t('fabbricazione', 'Fabbricazione', 'data'), t('messaInServizio', 'Messa in servizio', 'data')],
  attrezzatura: [
    t('marca', 'Marca'),
    t('modello', 'Modello'),
    t('fabbricazione', 'Fabbricazione', 'data'),
    t('messaInServizio', 'Messa in servizio', 'data'),
    t('ubicazione', 'Ubicazione'),
  ],
  sede: [t('indirizzo', 'Indirizzo'), t('comune', 'Comune'), t('cap', 'CAP'), t('provincia', 'Provincia'), t('conformitaImpianto', 'Conformità impianto', 'data')],
  persona: [t('mansione', 'Mansione'), t('nascita', 'Data di nascita', 'data'), t('assunzione', 'Assunzione', 'data'), t('email', 'Email', 'email'), t('telefono', 'Telefono')],
  azienda: [t('codiceFiscale', 'Codice fiscale'), t('pec', 'PEC', 'email'), t('indirizzo', 'Indirizzo')],
};
