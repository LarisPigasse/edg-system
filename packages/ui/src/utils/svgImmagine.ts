// src/utils/svgImmagine.ts
//
// Un disegno SVG della pagina (es. un grafico Recharts) come immagine PNG,
// per metterlo in un PDF (exportReportToPdf, `image`). Gli stili si copiano
// dagli elementi veri come valori calcolati, così i colori scritti come
// variabili CSS del tema (var(--color-…)) restano colori anche fuori dalla
// pagina; il fondo è bianco. `scala` raddoppia i pixel per una stampa nitida.

/** Le proprietà di stile che servono a un grafico */
const PROPRIETA = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'stroke-opacity',
  'opacity',
  'font-size',
  'font-family',
  'font-weight',
  'text-anchor',
  'dominant-baseline',
] as const;

export interface ImmagineSvg {
  dataUrl: string;
  width: number;
  height: number;
}

export async function svgInImmagine(svg: SVGSVGElement, scala = 2): Promise<ImmagineSvg> {
  const { width, height } = svg.getBoundingClientRect();
  const copia = svg.cloneNode(true) as SVGSVGElement;
  const veri = [svg, ...Array.from(svg.querySelectorAll('*'))];
  const copiati = [copia, ...Array.from(copia.querySelectorAll('*'))];
  veri.forEach((el, i) => {
    const cs = getComputedStyle(el);
    (copiati[i] as Element).setAttribute('style', PROPRIETA.map(p => `${p}:${cs.getPropertyValue(p)}`).join(';'));
  });
  copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  copia.setAttribute('width', String(width));
  copia.setAttribute('height', String(height));

  const img = new Image();
  await new Promise<void>((ok, ko) => {
    img.onload = () => ok();
    img.onerror = () => ko(new Error('Il grafico non si può trasformare in immagine'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copia))}`;
  });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scala);
  canvas.height = Math.round(height * scala);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Il grafico non si può trasformare in immagine');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scala, scala);
  ctx.drawImage(img, 0, 0, width, height);
  return { dataUrl: canvas.toDataURL('image/png'), width, height };
}

/** Il valore di una variabile CSS del tema (es. \"--color-action-primary\"), per i colori nei PDF */
export const coloreDelTema = (variabile: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(variabile).trim() || '#000000';
