// Identità visiva nel modulo di catalogo: stato del form e controlli (ADR054)
//
// Nel form i tre elementi ci sono sempre; al salvataggio testi e classi vuoti
// diventano null (= predefiniti). Le regole sono quelle di auth-service.
import { BRAND_ELEMENTS, EMPTY_BRAND_ELEMENT } from '@edg/ui';
import type { BrandElement, BrandElementConfig, ModuleBranding } from '@edg/ui';

export type BrandingForm = Record<BrandElement, BrandElementConfig>;

export const BRAND_TEXT_MAX = 64;
export const BRAND_CLASSES_MAX = 256;
/** Caratteri ammessi nelle classi (gli stessi di auth-service) */
const CLASSES_REGEX = /^[a-zA-Z0-9\s\-:/.[\]#%_!]*$/;

export function brandingToForm(branding: ModuleBranding | null | undefined): BrandingForm {
  return Object.fromEntries(
    BRAND_ELEMENTS.map(el => [el, { ...EMPTY_BRAND_ELEMENT, ...(branding?.[el] ?? {}) }])
  ) as BrandingForm;
}

export function formToBranding(form: BrandingForm): ModuleBranding {
  return Object.fromEntries(
    BRAND_ELEMENTS.map(el => [
      el,
      {
        mode: form[el].mode,
        text: form[el].text?.trim() || null,
        classes: form[el].classes?.trim().replace(/\s+/g, ' ') || null,
      },
    ])
  ) as ModuleBranding;
}

/** Errore sulle classi di un elemento, o undefined */
export function classesError(classes: string | null): string | undefined {
  if (classes && !CLASSES_REGEX.test(classes)) return 'Caratteri non ammessi in una classe Tailwind';
  return undefined;
}

export const brandingHasErrors = (form: BrandingForm): boolean =>
  BRAND_ELEMENTS.some(el => classesError(form[el].classes) !== undefined);
