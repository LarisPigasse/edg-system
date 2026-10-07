// src/features/sistema/components/ModuleDetailModal.tsx
//
// Scheda di un modulo del catalogo (ADR054): i dati e le scelte grafiche in
// vigore, con un'anteprima di come appare (header e home del modulo, tessera
// della home della piattaforma). Da qui si passa alla modifica dei dati o
// dell'aspetto.
import React from 'react';
import {
  Badge,
  Button,
  HomeModuleTile,
  HomeTileGrid,
  Modal,
  ModuleBrand,
  Palette,
  BRAND_ELEMENTS,
  BRAND_ELEMENT_LABELS,
  BRAND_FILE_NAMES,
  EMPTY_BRAND_ELEMENT,
  formatDate,
} from '@edg/ui';
import type { BrandElement, ModuleBrandImages } from '@edg/ui';

import type { CatalogModule } from '../types/modules';
import {
  MODULE_STATUS,
  isInShowcase,
  moduleNames,
  productLabel,
  showcaseLabel,
  staffHomeStatus,
} from '../utils/moduleFormat';
import { moduleImages } from '../../../assets/moduli';

interface ModuleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogModule | null;
  /** Catalogo: per i nomi delle dipendenze */
  catalog: CatalogModule[];
  onEdit: (item: CatalogModule) => void;
  onEditBranding: (item: CatalogModule) => void;
}

/** Da dove viene un elemento: immagine (presente o mancante) o testo con le sue classi */
const BrandSource: React.FC<{ element: BrandElement; item: CatalogModule; images: ModuleBrandImages }> = ({
  element,
  item,
  images,
}) => {
  const config = item.branding?.[element] ?? EMPTY_BRAND_ELEMENT;
  const file = BRAND_FILE_NAMES[element];

  let source: React.ReactNode;
  if (config.mode === 'file' && images[element]) {
    source = (
      <>
        Immagine <code>{file}</code>
      </>
    );
  } else {
    const text = config.text?.trim() ? `"${config.text.trim()}"` : 'predefinito';
    source = (
      <>
        {config.mode === 'file' && (
          <span className='text-text-warning'>
            Immagine <code>{file}</code> mancante, si vede il testo ·{' '}
          </span>
        )}
        Testo {text} · {config.classes ? <code>{config.classes}</code> : 'stile predefinito'}
      </>
    );
  }

  return (
    <div className='flex gap-2 text-xs'>
      <dt className='w-12 shrink-0 font-medium text-text-primary'>{BRAND_ELEMENT_LABELS[element].label}</dt>
      <dd className='min-w-0 break-words text-text-secondary'>{source}</dd>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className='flex gap-3 py-1.5'>
    <dt className='w-32 shrink-0 text-sm text-text-secondary'>{label}</dt>
    <dd className='min-w-0 text-sm text-text-primary'>{children}</dd>
  </div>
);

const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  catalog,
  onEdit,
  onEditBranding,
}) => {
  if (!item) return null;
  const images = moduleImages(item.key);
  const brand = { name: item.name, branding: item.branding, images };
  const tile = { ...brand, subtitle: item.description, version: item.version };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Modulo "${item.name}"`}
      size='xxxl'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose}>
            Chiudi
          </Button>
          <Button variant='outline' onClick={() => onEditBranding(item)}>
            <Palette className='mr-2 h-4 w-4' />
            Aspetto
          </Button>
          <Button variant='primary' onClick={() => onEdit(item)}>
            Modifica
          </Button>
        </div>
      }
    >
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Dati e provenienza delle scelte grafiche */}
        <div className='space-y-6 lg:col-span-1'>
          <section>
            <h3 className='mb-2 text-sm font-semibold uppercase tracking-wide text-text-secondary'>Dati</h3>
            <dl className='divide-y divide-surface-border'>
              <Field label='Chiave'>
                <code>{item.key}</code>
              </Field>
              <Field label='Versione'>{item.version}</Field>
              <Field label='Prodotto'>{productLabel(item.product)}</Field>
              <Field label='Stato'>
                <Badge variant={MODULE_STATUS[item.status].variant}>{MODULE_STATUS[item.status].label}</Badge>
              </Field>
              <Field label='In vetrina'>{showcaseLabel(item)}</Field>
              <Field label='Prova'>{item.trialDays} giorni</Field>
              <Field label='Richiede'>
                {item.dependencies?.length ? moduleNames(item.dependencies, catalog) : '—'}
              </Field>
              <Field label='Attivazioni'>{Number(item.activationCount ?? 0)}</Field>
              <Field label='Sottotitolo'>{item.description || '—'}</Field>
              <Field label='Aggiornato'>{formatDate(item.updatedAt)}</Field>
            </dl>
          </section>

          <section>
            <h3 className='mb-2 text-sm font-semibold uppercase tracking-wide text-text-secondary'>
              Aspetto in vigore
            </h3>
            <dl className='space-y-2'>
              {BRAND_ELEMENTS.map(el => (
                <BrandSource key={el} element={el} item={item} images={images} />
              ))}
            </dl>
          </section>
        </div>

        {/* Anteprima: home del modulo con il suo header, riquadri della home (acceso e, se in vetrina, spento), icona */}
        <div className='space-y-4 lg:col-span-2'>
          <div className='overflow-hidden rounded-lg border border-surface-border'>
            <div className='flex h-14 items-center border-b border-surface-border bg-bg-primary px-4'>
              <ModuleBrand element='title' {...brand} />
            </div>
            <div className='flex min-h-64 items-center justify-center overflow-hidden bg-surface-1 p-8'>
              <ModuleBrand element='logo' {...brand} />
            </div>
          </div>

          <HomeTileGrid>
            <li>
              <HomeModuleTile {...tile} status={staffHomeStatus(item)} />
            </li>
            {isInShowcase(item) && (
              <li>
                <HomeModuleTile {...tile} status='non-attivo' />
              </li>
            )}
          </HomeTileGrid>

          <div className='flex items-center justify-center gap-4'>
            <ModuleBrand element='icon' {...brand} />
            <ModuleBrand element='icon' size='sm' {...brand} />
            <span className='text-xs text-text-secondary'>Icona a 64 e 32 px</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModuleDetailModal;
