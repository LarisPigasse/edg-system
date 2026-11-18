// =============================================================================
// CORE UTILS: esportazione PDF di un elenco tabellare
// core/utils/exportPdf.ts
// =============================================================================
//
// Genera ed avvia il download di un PDF a partire dai dati correnti di una
// Table (già filtrati/ordinati lato pagina), lato browser — nessuna
// generazione server-side. Pensata per essere riusata da qualsiasi elenco
// dell'app: le colonne per il PDF sono definite a parte da quelle di Table
// (`TableColumn.accessor` può restituire ReactNode, qui serve testo puro).
//
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/** Colore primario del brand EDG (violet-600, vedi globals.css --action-primary) */
const BRAND_COLOR: [number, number, number] = [124, 58, 237];

export interface PdfColumn<T> {
  header: string;
  /** Valore testuale della colonna per la riga — niente componenti React, solo testo per la stampa */
  accessor: (item: T) => string;
  /** Allineamento di valori e intestazione (i numeri a destra); predefinito a sinistra */
  align?: 'left' | 'center' | 'right';
}

export interface ExportPdfOptions<T> {
  /** Nome del file, senza estensione (viene aggiunta automaticamente ".pdf") */
  filename: string;
  /** Titolo mostrato in testa al documento */
  title: string;
  /** Sottotitolo opzionale — utile per indicare i filtri attivi (es. "Stato: Attivi") */
  subtitle?: string;
  columns: PdfColumn<T>[];
  data: T[];
}

/**
 * Esporta l'elenco corrente in un PDF con intestazione, tabella e piè di
 * pagina con data di generazione e numero di record — pronto per la stampa
 * o l'archiviazione.
 */
export function exportTableToPdf<T>({ filename, title, subtitle, columns, data }: ExportPdfOptions<T>): void {
  const orientation = columns.length > 5 ? 'landscape' : 'portrait';
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Intestazione -----------------------------------------------------
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLOR);
  doc.text(testoPdf(title), 14, 15);

  let tableStartY = 22;
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(testoPdf(subtitle), 14, 21);
    tableStartY = 26;
  }

  // --- Tabella ------------------------------------------------------------
  // l'intestazione segue l'allineamento dei valori della colonna (i numeri a destra)
  const allineate = Object.fromEntries(columns.flatMap((c, i) => (c.align && c.align !== 'left' ? [[i, { halign: c.align }]] : [])));
  autoTable(doc, {
    startY: tableStartY,
    head: [columns.map(c => testoPdf(c.header))],
    body: data.map(item => columns.map(c => testoPdf(c.accessor(item)))),
    columnStyles: allineate,
    didParseCell: cella => {
      const a = columns[cella.column.index]?.align;
      if (cella.section === 'head' && a && a !== 'left') cella.cell.styles.halign = a;
    },
    styles: { fontSize: 9, cellPadding: 3, lineColor: [230, 226, 219], lineWidth: 0.1 },
    headStyles: { fillColor: BRAND_COLOR, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 242, 234] },
    margin: { top: tableStartY, left: 14, right: 14 },
    didDrawPage: () => {
      // --- Piè di pagina: data di generazione, numero di record, numero pagina ---
      const generatedAt = new Date().toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
      const pageCount = doc.getNumberOfPages();
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150);
      doc.text(`Generato il ${generatedAt} — ${data.length} record`, 14, pageHeight - 8);
      doc.text(`Pagina ${currentPage} di ${pageCount}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
    },
  });

  doc.save(`${filename}.pdf`);
}

// =============================================================================
// Resoconto a più sezioni (es. Spese e consumi di Vigilo)
// =============================================================================
//
// Intestazione con titolo e sottotitolo, una fila di riquadri con le cifre
// principali (facoltativa) e poi una tabella per sezione, ognuna col suo
// titolo, intestazioni, righe ed eventuale riga dei totali. Le righe sono già
// testo: chi chiama decide formati e parole. Piè di pagina con data e
// "Pagina n di m" su ogni pagina. Facoltativi un'immagine (es. un grafico,
// svgImmagine.ts) dopo le cifre, con la sua legenda, e una nota in fondo.

export interface PdfSummaryItem {
  label: string;
  value: string;
  /** Riga piccola sotto la cifra (es. "+12% rispetto all'anno prima") */
  note?: string;
}

export interface PdfSection {
  title: string;
  head: string[];
  body: string[][];
  /** Riga dei totali, in grassetto in fondo alla tabella */
  foot?: string[];
  /** Colonne allineate a destra (indici), di solito le cifre */
  rightAligned?: number[];
  /** Testo al posto della tabella quando non ci sono righe */
  empty?: string;
}

/** Un'immagine nel resoconto (es. un grafico): larga quanto la pagina, con la legenda sotto */
export interface PdfImage {
  /** PNG come data URL */
  dataUrl: string;
  /** Dimensioni originali (per le proporzioni) */
  width: number;
  height: number;
  /** Voci della legenda: un quadratino del colore e l'etichetta */
  legend?: { label: string; color: string }[];
}

export interface ExportReportOptions {
  /** Nome del file, senza estensione */
  filename: string;
  title: string;
  subtitle?: string;
  summary?: PdfSummaryItem[];
  /** Dopo le cifre principali e prima delle sezioni */
  image?: PdfImage;
  sections: PdfSection[];
  /** Testo piccolo dopo l'ultima sezione (avvertenze, come si legge) */
  footnote?: string;
  orientation?: 'portrait' | 'landscape';
}

/**
 * I caratteri che i font standard del PDF (WinAnsi) non hanno: meno
 * tipografico, spazi stretti e unificatori che Intl mette in alcune cifre,
 * frecce (es. "Nereto → Milano" nelle descrizioni scritte a mano) che
 * diventano › e ‹, che il font ha.
 */
export const testoPdf = (s: string): string =>
  s
    .replace(/\u2212/g, '-')
    .replace(/[\u202F\u2009]/g, ' ')
    .replace(/[\u2192\u21D2\u2794\u279C\u27A1]/g, '\u203A')
    .replace(/[\u2190\u21D0\u2B05]/g, '\u2039');

/** Esporta un resoconto a più sezioni in PDF e ne avvia il download */
export function exportReportToPdf({ filename, title, subtitle, summary, image, sections, footnote, orientation = 'portrait' }: ExportReportOptions): void {
  // compresso: un resoconto di poche pagine resta di pochi kB
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4', compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const fine = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // --- Intestazione -------------------------------------------------------
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLOR);
  doc.text(testoPdf(title), margin, 16);
  let y = 22;
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(doc.splitTextToSize(testoPdf(subtitle), pageWidth - margin * 2), margin, y);
    y += 7;
  }

  // --- Cifre principali: una cella per voce -----------------------------------
  if (summary?.length) {
    autoTable(doc, {
      startY: y,
      theme: 'plain',
      body: [
        summary.map(s => testoPdf(s.label)),
        summary.map(s => testoPdf(s.value)),
        summary.map(s => testoPdf(s.note ?? '')),
      ],
      styles: { cellPadding: { top: 1, bottom: 1, left: 3, right: 3 }, lineColor: [230, 226, 219] },
      didParseCell: data => {
        const riga = data.row.index;
        data.cell.styles.fillColor = [248, 242, 234];
        if (riga === 0) Object.assign(data.cell.styles, { fontSize: 9, fontStyle: 'bold', textColor: 60, cellPadding: { top: 3, bottom: 1, left: 3, right: 3 } });
        if (riga === 1) Object.assign(data.cell.styles, { fontSize: 16, fontStyle: 'bold', textColor: 30 });
        if (riga === 2) Object.assign(data.cell.styles, { fontSize: 8, textColor: 100, cellPadding: { top: 1, bottom: 3, left: 3, right: 3 } });
      },
      margin: { left: margin, right: margin },
    });
    y = fine() + 8;
  }

  // --- Immagine (un grafico) con la legenda -------------------------------------
  if (image) {
    const larghezza = pageWidth - margin * 2;
    const altezza = (larghezza * image.height) / Math.max(image.width, 1);
    if (y + altezza + 12 > doc.internal.pageSize.getHeight() - 16) {
      doc.addPage();
      y = 16;
    }
    doc.addImage(image.dataUrl, 'PNG', margin, y, larghezza, altezza);
    y += altezza + 4;
    if (image.legend?.length) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60);
      let x = margin;
      for (const voce of image.legend) {
        doc.setFillColor(voce.color);
        doc.rect(x, y - 2.6, 4, 2.6, 'F');
        doc.text(testoPdf(voce.label), x + 6, y);
        x += 6 + doc.getTextWidth(testoPdf(voce.label)) + 8;
      }
      y += 8;
    }
  }

  // --- Sezioni --------------------------------------------------------------
  for (const s of sections) {
    // il titolo non resta da solo in fondo alla pagina
    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = 16;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLOR);
    doc.text(testoPdf(s.title), margin, y);
    y += 3;
    if (!s.body.length) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(testoPdf(s.empty ?? 'Nessun dato.'), margin, y + 5);
      y += 16;
      continue;
    }
    const destra = Object.fromEntries((s.rightAligned ?? []).map(i => [i, { halign: 'right' as const }]));
    autoTable(doc, {
      startY: y,
      head: [s.head.map(testoPdf)],
      body: s.body.map(r => r.map(testoPdf)),
      ...(s.foot ? { foot: [s.foot.map(testoPdf)] } : {}),
      showFoot: 'lastPage',
      styles: { fontSize: 9, cellPadding: 2.5, lineColor: [230, 226, 219], lineWidth: 0.1 },
      headStyles: { fillColor: BRAND_COLOR, textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [237, 233, 254], textColor: 30, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 242, 234] },
      columnStyles: destra,
      didParseCell: data => {
        if ((data.section === 'head' || data.section === 'foot') && (s.rightAligned ?? []).includes(data.column.index)) data.cell.styles.halign = 'right';
      },
      margin: { left: margin, right: margin, top: 16, bottom: 16 },
    });
    y = fine() + 10;
  }

  // --- Nota in fondo ------------------------------------------------------------
  if (footnote) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    const righe = doc.splitTextToSize(testoPdf(footnote), pageWidth - margin * 2);
    if (y + righe.length * 4 > doc.internal.pageSize.getHeight() - 16) {
      doc.addPage();
      y = 16;
    }
    doc.text(righe, margin, y);
  }

  // --- Piè di pagina su tutte le pagine ------------------------------------------
  const generatedAt = new Date().toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
  const pagine = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pagine; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text(`Generato il ${generatedAt}`, margin, pageHeight - 8);
    doc.text(`Pagina ${i} di ${pagine}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  doc.save(`${filename}.pdf`);
}
