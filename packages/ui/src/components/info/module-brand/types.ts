// Identità visiva dei moduli (ADR054)
//
// Ogni modulo ha tre elementi grafici, ciascuno da immagine o da testo:
//   icon   immagine piccola (64x64): tessere, elenchi, tabelle
//   logo   immagine grande: centro della home del modulo
//   title  scritta dell'header, in alto a sinistra
// Le immagini stanno in ogni frontend, in src/assets/moduli/<chiave>/
// (icon.png, logo.png, titolo.png); il catalogo dice solo quale usare e,
// per il testo, cosa scrivere e con quali classi Tailwind.

export const BRAND_ELEMENTS = ['icon', 'logo', 'title'] as const;
export type BrandElement = (typeof BRAND_ELEMENTS)[number];

export type BrandMode = 'file' | 'text';

export interface BrandElementConfig {
  mode: BrandMode;
  /** Testo da mostrare; vuoto = nome del modulo (iniziale per l'icona) */
  text: string | null;
  /** Classi Tailwind del testo; vuote = stile predefinito dell'elemento */
  classes: string | null;
}

/** Come arriva dal catalogo: un elemento assente vale "testo predefinito" */
export type ModuleBranding = Partial<Record<BrandElement, BrandElementConfig>>;

/** URL delle immagini trovate per un modulo (solo quelle presenti) */
export type ModuleBrandImages = Partial<Record<BrandElement, string>>;
