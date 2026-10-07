// Scheda di un modulo (fase 4, ADR056): si apre dal riquadro della home
//
// Serve soprattutto ai moduli che non si possono aprire: in vetrina, sospesi o
// scaduti. Mostra logo, stato, descrizione, un messaggio che spiega la
// situazione e i contatti EDG per chiedere informazioni, una prova o la
// riattivazione. Per un modulo utilizzabile offre "Apri il modulo".
import React from 'react';

import Modal from '../../ui/modal/Modal';
import Button from '../../ui/button/Button';
import Badge from '../../ui/badge/Badge';
import ScaleToFit from '../../layout/custom/ScaleToFit';
import { formatDate } from '../../../utils/date';
import { Mail, Phone } from '../../../utils/icons';
import { ModuleBrand } from './ModuleBrand';
import { HOME_MODULE_STATUS, homeModuleStatusLabel, type HomeModuleStatus } from './moduleStatus';
import type { ModuleBrandImages, ModuleBranding } from './types';

/** Recapiti per chiedere informazioni sui moduli (es. l'ufficio commerciale) */
export interface ModuleContact {
  /** Chi risponde (es. "Ufficio commerciale EDG") */
  name?: string;
  email?: string;
  phone?: string;
}

export interface ModuleInfo {
  key: string;
  name: string;
  description?: string | null;
  version?: string | null;
  status: HomeModuleStatus;
  endsAt?: string | Date | null;
  branding?: ModuleBranding | null;
}

export interface ModuleInfoModalProps {
  /** Modulo da mostrare; null = chiusa */
  module: ModuleInfo | null;
  onClose: () => void;
  images?: ModuleBrandImages;
  contact?: ModuleContact;
  /** Apre il modulo (solo per quelli utilizzabili) */
  onOpen?: (key: string) => void;
}

/** Cosa dire per ogni stato; null = nessun messaggio */
const statusMessage = (m: ModuleInfo): string | null => {
  const until = m.endsAt ? formatDate(String(m.endsAt), 'long') : null;
  switch (m.status) {
    case 'non-attivo':
      return 'Questo modulo non è attivo per la tua azienda. Contattaci per una presentazione o per provarlo gratuitamente.';
    case 'prova':
      return until
        ? `Stai provando il modulo fino al ${until}. Contattaci per continuare a usarlo senza interruzioni.`
        : 'Stai provando il modulo. Contattaci per continuare a usarlo.';
    case 'sospeso':
      return 'Il modulo è sospeso: i tuoi dati sono conservati. Contattaci per riattivarlo.';
    case 'scaduto':
      return 'Il periodo di utilizzo è terminato. I dati restano conservati per un tempo limitato: contattaci per riattivare il modulo e ritrovarli.';
    case 'sviluppo':
      return 'Modulo in sviluppo: non è ancora disponibile in questa applicazione.';
    default:
      return null;
  }
};

/** I contatti servono a chi non può usare il modulo o lo sta provando */
const wantsContact = (status: HomeModuleStatus): boolean => status !== 'attivo' && status !== 'sviluppo';

export const ModuleInfoModal: React.FC<ModuleInfoModalProps> = ({ module, onClose, images, contact, onOpen }) => {
  if (!module) return null;

  const { variant, usable } = HOME_MODULE_STATUS[module.status];
  const message = statusMessage(module);
  const showContact = wantsContact(module.status) && Boolean(contact?.email || contact?.phone);
  const mailto = contact?.email
    ? `mailto:${contact.email}?subject=${encodeURIComponent(`Informazioni sul modulo ${module.name}`)}`
    : null;

  const footer = (
    <div className='flex w-full justify-end gap-2'>
      <Button variant='secondary' onClick={onClose}>
        Chiudi
      </Button>
      {usable && onOpen && <Button onClick={() => onOpen(module.key)}>Apri il modulo</Button>}
    </div>
  );

  return (
    <Modal isOpen onClose={onClose} title={module.name} size='md' footer={footer}>
      <div className='space-y-4'>
        {/* Logo, sempre a colori: la scheda serve a far conoscere il modulo */}
        <div className='h-32 w-full rounded-xl border border-home-module-border bg-home-module-bg p-4'>
          <ScaleToFit>
            <ModuleBrand element='logo' name={module.name} branding={module.branding} images={images} />
          </ScaleToFit>
        </div>

        <div className='flex items-center justify-between gap-2 text-sm text-text-secondary'>
          <Badge variant={variant} size='sm'>
            {homeModuleStatusLabel(module.status, module.endsAt)}
          </Badge>
          {module.version && <span className='tabular-nums'>Versione {module.version}</span>}
        </div>

        {module.description && <p className='text-text-primary'>{module.description}</p>}

        {message && (
          <p className='rounded-lg border border-surface-border bg-surface-1 px-4 py-3 text-sm text-text-secondary'>
            {message}
          </p>
        )}

        {showContact && (
          <div className='space-y-2'>
            <p className='text-sm font-semibold text-text-primary'>{contact?.name ?? 'Contatti'}</p>
            <div className='flex flex-wrap gap-2'>
              {mailto && (
                <a
                  href={mailto}
                  className='inline-flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm text-text-link transition-colors hover:bg-bg-hover'
                >
                  <Mail className='h-4 w-4' />
                  {contact?.email}
                </a>
              )}
              {contact?.phone && (
                <a
                  href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
                  className='inline-flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm text-text-link transition-colors hover:bg-bg-hover'
                >
                  <Phone className='h-4 w-4' />
                  {contact.phone}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ModuleInfoModal;
