export * from './date';
export * from './exportPdf';
export * from './errors';
export * from './icons';

import { House, Settings, Puzzle, LayoutGrid, Palette, ArrowBigLeft, ArrowBigRight, Check, Upload, Download, Timer, File, X, RefreshCw } from './icons';

/**
 * Utility per combinare classi CSS condizionalmente
 * Versione robusta che gestisce stringhe, undefined, null, boolean
 */
export function cn(...inputs: (string | undefined | null | false | 0)[]): string {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Mapping delle icone Lucide per concetto (chiave semantica → icona).
 * Le icone arrivano da './icons', il catalogo unico del progetto.
 *
 * Da usare per le icone che ricorrono con lo stesso significato in punti
 * distanti dell'app (navigazione, azioni standard come "chiudi" o
 * "aggiorna"): un solo punto dove cambiarle. Le icone che sono invece
 * cromo di un singolo componente (frecce di ordinamento di una tabella,
 * chevron di una select, ...) restano import diretti da './icons'.
 */
export const iconMap = {
  home: House,
  dashboard: LayoutGrid,
  settings: Settings,
  components: Puzzle,
  showcase: Palette, // Icona più appropriata per showcase
  back: ArrowBigLeft,
  forward: ArrowBigRight,
  check: Check,
  upload: Upload,
  download: Download,
  timer: Timer,
  file: File,
  close: X,
  refresh: RefreshCw,
} as const;

export type IconName = keyof typeof iconMap;
