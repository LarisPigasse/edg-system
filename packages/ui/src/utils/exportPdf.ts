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
  doc.text(title, 14, 15);

  let tableStartY = 22;
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(subtitle, 14, 21);
    tableStartY = 26;
  }

  // --- Tabella ------------------------------------------------------------
  autoTable(doc, {
    startY: tableStartY,
    head: [columns.map(c => c.header)],
    body: data.map(item => columns.map(c => c.accessor(item))),
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
