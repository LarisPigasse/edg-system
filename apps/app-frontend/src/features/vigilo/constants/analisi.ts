// src/features/vigilo/constants/analisi.ts — la vista Analisi (2026-11-23)
import type { SoglieAnalisi } from '../types/analisi';
import { COLORI_ANDAMENTO } from './costoMezzi';

/** Le tre voci del costo pieno: il mezzo con il colore del possesso, poi conducente e struttura */
export const COLORI_COSTO_PIENO = { mezzo: COLORI_ANDAMENTO.possesso, conducente: COLORI_ANDAMENTO.uso, aziendali: COLORI_ANDAMENTO.manutenzione } as const;

export const NOMI_COSTO_PIENO = { mezzo: 'Mezzo (per ora di impiego)', conducente: 'Conducente', aziendali: 'Costi aziendali' } as const;

/** Le soglie dei segnali: nome e che cosa fanno scattare (l'unità è nel nome) */
export const SOGLIE_ANALISI: { chiave: keyof SoglieAnalisi; nome: string; aiuto: string }[] = [
  { chiave: 'consumoAlto', nome: 'Consumo alto (% sulla categoria)', aiuto: 'Un veicolo che consuma più di così rispetto ai veicoli della sua categoria.' },
  { chiave: 'consumoCrescita', nome: 'Consumo in crescita (%)', aiuto: 'Il consumo della flotta negli ultimi 3 mesi rispetto ai 9 prima.' },
  { chiave: 'kmMeseMinimi', nome: 'Mezzo poco usato (km al mese)', aiuto: 'Un veicolo che fa meno km al mese costa anche quando è fermo.' },
  { chiave: 'disponibilitaMinima', nome: 'Disponibilità minima (%)', aiuto: 'Sotto, un veicolo è troppo spesso fermo per guasti che bloccano l’uso.' },
  { chiave: 'quotaGuastiMassima', nome: 'Peso massimo dei guasti (%)', aiuto: 'Le riparazioni sul totale di riparazioni e manutenzione programmata.' },
  { chiave: 'strutturaMassima', nome: 'Aumento massimo di una voce (%)', aiuto: 'Una voce dei costi aziendali che cresce più di così sull’anno prima.' },
  { chiave: 'strutturaMinimaEuro', nome: 'Aumento minimo di una voce (€)', aiuto: 'Sotto questo importo una voce non si segnala, anche se cresce molto in %.' },
  { chiave: 'margineMinimo', nome: 'Margine minimo (%)', aiuto: 'Il margine dell’anno sui ricavi; serve indicare i ricavi.' },
];
