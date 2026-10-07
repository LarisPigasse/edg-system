// Immagini dei moduli (ADR054)
//
// Una cartella per modulo, con il nome della sua chiave nel catalogo:
//   src/assets/moduli/<chiave>/icon.png     immagine piccola (64x64)
//   src/assets/moduli/<chiave>/logo.png     immagine grande (home del modulo)
//   src/assets/moduli/<chiave>/titolo.png   scritta dell'header
// Tutti facoltativi: se il catalogo chiede un'immagine che qui non c'è, il
// modulo si mostra con il testo. Aggiunto un file, serve una nuova build.
import { buildModuleImages, type ModuleBrandImages } from '@edg/ui';

const files = import.meta.glob<string>('./*/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const MODULE_IMAGES: Record<string, ModuleBrandImages> = buildModuleImages(files);

/** Le immagini di un modulo presenti in questo frontend */
export const moduleImages = (key: string): ModuleBrandImages => MODULE_IMAGES[key] ?? {};
