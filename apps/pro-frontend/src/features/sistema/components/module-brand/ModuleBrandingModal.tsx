// Finestra "Aspetto" di un modulo del catalogo (solo root, ADR054)
import React, { useEffect, useState } from 'react';
import { Button, Modal } from '@edg/ui';
import type { ModuleBranding } from '@edg/ui';

import BrandingEditor from './BrandingEditor';
import { brandingHasErrors, brandingToForm, formToBranding } from './brandingForm';
import type { BrandingForm } from './brandingForm';
import type { CatalogModule } from '../../types/modules';

interface ModuleBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogModule | null;
  onSave: (branding: ModuleBranding) => Promise<void>;
  isSaving: boolean;
}

const ModuleBrandingModal: React.FC<ModuleBrandingModalProps> = ({ isOpen, onClose, item, onSave, isSaving }) => {
  const [form, setForm] = useState<BrandingForm>(() => brandingToForm(null));

  useEffect(() => {
    if (isOpen) setForm(brandingToForm(item?.branding));
  }, [isOpen, item]);

  const hasErrors = brandingHasErrors(form);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Aspetto del modulo "${item?.name ?? ''}"`}
      size='xxxl'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose} disabled={isSaving}>
            Annulla
          </Button>
          <Button
            variant='primary'
            onClick={() => void onSave(formToBranding(form))}
            disabled={hasErrors}
            isLoading={isSaving}
            loadingText='Salvataggio...'
          >
            Salva
          </Button>
        </div>
      }
    >
      {item && <BrandingEditor moduleKey={item.key} name={item.name} value={form} onChange={setForm} />}
    </Modal>
  );
};

export default ModuleBrandingModal;
