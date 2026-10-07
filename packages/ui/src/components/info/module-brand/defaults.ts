// Valori predefiniti e nomi dei file dell'identità visiva (ADR054)
import type { BrandElement, BrandElementConfig } from './types';

/** Nome del file png di ogni elemento, dentro src/assets/moduli/<chiave>/ */
export const BRAND_FILE_NAMES: Record<BrandElement, string> = {
  icon: 'icon.png',
  logo: 'logo.png',
  title: 'titolo.png',
};

export const BRAND_ELEMENT_LABELS: Record<BrandElement, { label: string; hint: string }> = {
  icon: {
    label: 'Icona',
    hint: 'Immagine 64x64 px: tessere, elenchi, tabelle',
  },
  logo: {
    label: 'Logo',
    hint: 'Immagine grande: centro della home del modulo',
  },
  title: { label: 'Titolo', hint: "Scritta dell'header, in alto a sinistra" },
};

/** Stile del testo quando le classi sono vuote */
export const BRAND_DEFAULT_CLASSES: Record<BrandElement, string> = {
  icon: 'bg-violet-600 text-white text-2xl font-bold rounded-lg',
  logo: 'text-5xl font-bold tracking-tight text-violet-600',
  title: 'text-xl font-semibold text-text-primary',
};

/** Testo quando il campo è vuoto: il nome, o la sua iniziale per l'icona */
export function brandDefaultText(element: BrandElement, name: string): string {
  if (element !== 'icon') return name;
  return (name.trim()[0] ?? '?').toUpperCase();
}

export const EMPTY_BRAND_ELEMENT: BrandElementConfig = {
  mode: 'text',
  text: null,
  classes: null,
};
