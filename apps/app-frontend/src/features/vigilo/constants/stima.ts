// src/features/vigilo/constants/stima.ts — stima dei costi di un servizio (2026-11-18)
import type { VoceCosti } from '../types/stima';

/**
 * Che cosa mettere in ciascuna voce dei costi aziendali, e che cosa no: ciò
 * che la stima conta già a parte (conducenti e operatori a ore, le spese dei
 * mezzi, la manodopera interna registrata sui mezzi) non va ripetuto qui,
 * altrimenti ogni stima lo pagherebbe due volte.
 */
export const AIUTI_VOCI_COSTI: Record<VoceCosti, string> = {
  personale:
    'Uffici, magazzino, officina, direzione: costo aziendale (lordo, contributi, TFR). Esclusi conducenti e operatori dei mezzi, che la stima conta a parte con il loro costo orario, e le ore di officina già registrate come manodopera sui mezzi.',
  struttura: 'Affitti, canoni, utenze e manutenzione di sedi e piazzali. Esclusi i costi dei mezzi (possesso, bollo, assicurazione): sono già nel costo del mezzo.',
  servizi: 'Software, telefonia, cancelleria, pulizie, assicurazioni non dei mezzi. Esclusi carburante e pedaggi: sono nel costo del mezzo o nella stima.',
  consulenze: 'Commercialista, consulente del lavoro, certificazioni, sicurezza, adempimenti fiscali e amministrativi.',
  finanziari: 'Interessi, commissioni bancarie, fideiussioni. Esclusi leasing e finanziamenti dei mezzi: sono nel loro costo di possesso.',
  altro: 'Tutto il resto che serve all’azienda e non sta nelle altre voci, né nei costi dei mezzi o dei conducenti.',
};
