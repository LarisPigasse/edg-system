// src/pages/Explorer.tsx
import React, { useState, useMemo } from 'react';
import { InfoCard } from '../components/ui';
import { HeaderGroup } from '../components/layout';
import type { ComponentCategory } from '../components/ui/info-card/InfoCard';
import type { ComponentData } from '../types';
import ExplorerModal from './ExplorerModal';

// ✅ IMPORT DIRETTI - Non usare barrel files per showcase
// Ogni showcase viene importato direttamente dal suo file
// Questo evita di caricare tutti gli showcase quando non servono

// DATA Components
import { tableData } from '../components/data/table/Table.data';
import { TableShowcase } from '../components/data/table/Table.showcase';
import { tableLinkData } from '../components/data/table-link/TableLink.data';
import { TableLinkShowcase } from '../components/data/table-link/TableLink.showcase';
import { statCardData } from '../components/data/stat-card/StatCard.data';
import { StatCardShowcase } from '../components/data/stat-card/StatCard.showcase';
import { statTileData } from '../components/data/stat-tile/StatTile.data';
import { StatTileShowcase } from '../components/data/stat-tile/StatTile.showcase';

// LAYOUT Components
import { cardData } from '../components/layout/card/Card.data';
import CardShowcase from '../components/layout/card/Card.showcase';
import { separatorData } from '../components/layout/separator/Separator.data';
import { SeparatorShowcase } from '../components/layout/separator/Separator.showcase';
import { sheetData } from '../components/layout/sheet/Sheet.data';
import { SheetShowcase } from '../components/layout/sheet/Sheet.showcase';

// NAVIGATION Components
import { commandData } from '../components/navigation/command/Command.data';
import { CommandShowcase } from '../components/navigation/command/Command.showcase';
import { navigationMenuData } from '../components/navigation/navigation-menu/NavigationMenu.data';
import { NavigationMenuShowcase } from '../components/navigation/navigation-menu/NavigationMenu.showcase';
import { tabsData } from '../components/navigation/tabs/Tabs.data';
import { TabsShowcase } from '../components/navigation/tabs/Tabs.showcase';

// FORM Components
import { checkboxData } from '../components/form/checkbox/Checkbox.data';
import CheckboxShowcase from '../components/form/checkbox/Checkbox.showcase';
import { datePickerData } from '../components/form/date-picker/DatePicker.data';
import { DatePickerShowcase } from '../components/form/date-picker/DatePicker.showcase';
import { formFieldData } from '../components/form/form-field/FormField.data';
import { FormFieldShowcase } from '../components/form/form-field/FormField.showcase';
import { labelData } from '../components/form/label/Label.data';
import { LabelShowcase } from '../components/form/label/Label.showcase';
import { inputData } from '../components/form/input/Input.data';
import { InputShowcase } from '../components/form/input/Input.showcase';
import { multiSelectData } from '../components/form/multi-select/MultiSelect.data';
import { MultiSelectShowcase } from '../components/form/multi-select/MultiSelect.showcase';
import { radioGroupData } from '../components/form/radio-group/RadioGroup.data';
import { RadioGroupShowcase } from '../components/form/radio-group/RadioGroup.showcase';
import { selectData } from '../components/form/select/Select.data';
import { SelectShowcase } from '../components/form/select/Select.showcase';
import { switchData } from '../components/form/switch/Switch.data';
import { SwitchShowcase } from '../components/form/switch/Switch.showcase';
import { textAreaData } from '../components/form/textarea/TextArea.data';
import { TextAreaShowcase } from '../components/form/textarea/TextArea.showcase';
import { timePickerData } from '../components/form/time-picker/TimePicker.data';
import { TimePickerShowcase } from '../components/form/time-picker/TimePicker.showcase';

// FEEDBACK Components
import { alertData } from '../components/feedback/alert/Alert.data';
import AlertShowcase from '../components/feedback/alert/Alert.showcase';
import { progressData } from '../components/feedback/progress/Progress.data';
import { ProgressShowcase } from '../components/feedback/progress/Progress.showcase';
import { skeletonData } from '../components/feedback/skeleton/Skeleton.data';
import { SkeletonShowcase } from '../components/feedback/skeleton/Skeleton.showcase';
import { spinnerData } from '../components/feedback/spinner/Spinner.data';
import { SpinnerShowcase } from '../components/feedback/spinner/Spinner.showcase';
import { toastData } from '../components/feedback/toast/Toast.data';
import { ToastShowcase } from '../components/feedback/toast/Toast.showcase';
import { tooltipData } from '../components/feedback/tooltip/Tooltip.data';
import { TooltipShowcase } from '../components/feedback/tooltip/Tooltip.showcase';

// UI Components
import { buttonData } from '../components/ui/button/Button.data';
import ButtonShowcase from '../components/ui/button/Button.showcase';
import { avatarData } from '../components/ui/avatar/Avatar.data';
import AvatarShowcase from '../components/ui/avatar/Avatar.showcase';
import { accordionData } from '../components/ui/accordion/Accordion.data';
import AccordionShowcase from '../components/ui/accordion/Accordion.showcase';
import { badgeData } from '../components/ui/badge/Badge.data';
import BadgeShowcase from '../components/ui/badge/Badge.showcase';
import { confirmModalData } from '../components/ui/confirm-modal/ConfirmModal.data';
import ConfirmModalShowcase from '../components/ui/confirm-modal/ConfirmModal.showcase';
import { detailModalData } from '../components/ui/detail-modal/DetailModal.data';
import DetailModalShowcase from '../components/ui/detail-modal/DetailModal.showcase';
import { technicalDetailsModalData } from '../components/ui/technical-details-modal/TechnicalDetailsModal.data';
import TechnicalDetailsModalShowcase from '../components/ui/technical-details-modal/TechnicalDetailsModal.showcase';
import { infoCardData } from '../components/ui/info-card/InfoCard.data';
import { InfoCardShowcase } from '../components/ui/info-card/InfoCard.showcase';
import { modalData } from '../components/ui/modal/Modal.data';
import { ModalShowcase } from '../components/ui/modal/Modal.showcase';

// Definizione dei componenti ristrutturati
interface RestructuredComponent {
  data: ComponentData;
  showcase: React.ComponentType;
}

// Registry dei componenti ristrutturati (con import diretti)
const RESTRUCTURED_COMPONENTS: Record<string, RestructuredComponent> = {
  accordion: {
    data: accordionData,
    showcase: AccordionShowcase,
  },
  alert: {
    data: alertData,
    showcase: AlertShowcase,
  },
  avatar: {
    data: avatarData,
    showcase: AvatarShowcase,
  },
  badge: {
    data: badgeData,
    showcase: BadgeShowcase,
  },
  button: {
    data: buttonData,
    showcase: ButtonShowcase,
  },
  card: {
    data: cardData,
    showcase: CardShowcase,
  },
  checkbox: {
    data: checkboxData,
    showcase: CheckboxShowcase,
  },
  command: {
    data: commandData,
    showcase: CommandShowcase,
  },
  confirmModal: {
    data: confirmModalData,
    showcase: ConfirmModalShowcase,
  },
  detailModal: {
    data: detailModalData,
    showcase: DetailModalShowcase,
  },
  technicalDetailsModal: {
    data: technicalDetailsModalData,
    showcase: TechnicalDetailsModalShowcase,
  },
  datePicker: {
    data: datePickerData,
    showcase: DatePickerShowcase,
  },
  formField: {
    data: formFieldData,
    showcase: FormFieldShowcase,
  },
  infoCard: {
    data: infoCardData,
    showcase: InfoCardShowcase,
  },
  input: {
    data: inputData,
    showcase: InputShowcase,
  },
  label: {
    data: labelData,
    showcase: LabelShowcase,
  },
  modal: {
    data: modalData,
    showcase: ModalShowcase,
  },
  multiSelect: {
    data: multiSelectData,
    showcase: MultiSelectShowcase,
  },
  navigationMenu: {
    data: navigationMenuData,
    showcase: NavigationMenuShowcase,
  },
  progress: {
    data: progressData,
    showcase: ProgressShowcase,
  },
  radioGroup: {
    data: radioGroupData,
    showcase: RadioGroupShowcase,
  },
  select: {
    data: selectData,
    showcase: SelectShowcase,
  },
  separator: {
    data: separatorData,
    showcase: SeparatorShowcase,
  },
  sheet: {
    data: sheetData,
    showcase: SheetShowcase,
  },
  skeleton: {
    data: skeletonData,
    showcase: SkeletonShowcase,
  },
  spinner: {
    data: spinnerData,
    showcase: SpinnerShowcase,
  },
  statCard: {
    data: statCardData,
    showcase: StatCardShowcase,
  },
  statTile: {
    data: statTileData,
    showcase: StatTileShowcase,
  },
  switch: {
    data: switchData,
    showcase: SwitchShowcase,
  },
  table: {
    data: tableData,
    showcase: TableShowcase,
  },
  tableLink: {
    data: tableLinkData,
    showcase: TableLinkShowcase,
  },
  tabs: {
    data: tabsData,
    showcase: TabsShowcase,
  },
  textArea: {
    data: textAreaData,
    showcase: TextAreaShowcase,
  },
  timePicker: {
    data: timePickerData,
    showcase: TimePickerShowcase,
  },
  toast: {
    data: toastData,
    showcase: ToastShowcase,
  },
  tooltip: {
    data: tooltipData,
    showcase: TooltipShowcase,
  },
};

// Lista componenti per l'Explorer
const RESTRUCTURED_COMPONENTS_LIST = Object.values(RESTRUCTURED_COMPONENTS).map(comp => comp.data);

interface ExplorerProps {
  /** Categoria da filtrare (opzionale) */
  categoryFilter?: ComponentCategory;
  /** Query di ricerca iniziale */
  initialSearch?: string;
  /** Titolo personalizzato */
  title?: string;

  /** Classi CSS aggiuntive */
  className?: string;
}

/**
 * Explorer - Esplora componenti ristrutturati con co-locazione.
 *
 * Features:
 * - Lista solo componenti ristrutturati (cartella + 3 files)
 * - Search e filtri per categoria
 * - Modal con tabs: Informazioni + Esempi live
 * - Import diretti per data + showcase (non barrel files)
 * - Gradual migration - aggiungiamo componenti quando ristrutturati
 */
const Explorer: React.FC<ExplorerProps> = ({
  categoryFilter,
  initialSearch = '',
  title = 'Component Explorer',
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>(categoryFilter || 'all');
  const [selectedComponent, setSelectedComponent] = useState<RestructuredComponent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filtra e cerca componenti
  const filteredComponents = useMemo(() => {
    let components = RESTRUCTURED_COMPONENTS_LIST;

    // Filtra per categoria
    if (selectedCategory !== 'all') {
      components = components.filter(comp => comp.category === selectedCategory);
    }

    // Filtra per ricerca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      components = components.filter(
        comp =>
          comp.title.toLowerCase().includes(query) ||
          comp.description.toLowerCase().includes(query) ||
          comp.id.toLowerCase().includes(query)
      );
    }

    return components;
  }, [searchQuery, selectedCategory]);

  // Categorie disponibili per il filtro
  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(RESTRUCTURED_COMPONENTS_LIST.map(comp => comp.category)));
    return categories.sort();
  }, []);

  // Handle card click
  const handleCardClick = (componentData: ComponentData) => {
    const componentKey = componentData.id;
    const restructuredComponent = RESTRUCTURED_COMPONENTS[componentKey];

    if (restructuredComponent) {
      setSelectedComponent(restructuredComponent);
      setModalOpen(true);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedComponent(null);
  };

  // Get stats

  const filteredCount = filteredComponents.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <HeaderGroup
          title={title}
          // subtitle={`${filteredCount} ${subtitle} • ${filteredCount} di ${totalComponents} componenti`}
          spacing='tight'
        />
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        {/* Search Input */}
        <div className='flex-1'>
          <input
            type='text'
            placeholder='Cerca componenti ...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full px-4 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary placeholder-text-placeholder focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
          />
        </div>

        {/* Category Filter */}
        <div className='sm:w-48'>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as ComponentCategory | 'all')}
            className='w-full px-4 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
          >
            <option value='all'>Tutte le categorie</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Info */}
      {searchQuery && (
        <div className='text-sm text-text-secondary'>
          {filteredCount > 0 ? (
            <>
              Trovati <strong>{filteredCount}</strong> componenti per "{searchQuery}"
            </>
          ) : (
            <>Nessun componente trovato per "{searchQuery}"</>
          )}
        </div>
      )}

      {/* Components Grid */}
      {filteredComponents.length > 0 ? (
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2'>
          {filteredComponents.map(component => (
            <InfoCard
              key={component.id}
              title={component.title}
              description={component.description}
              category={component.category}
              onClick={() => handleCardClick(component)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className='text-center py-12'>
          <div className='text-6xl mb-4'>🔧</div>
          <h3 className='text-lg font-semibold text-text-primary mb-2'>Nessun componente ristrutturato trovato</h3>
          <p className='text-text-secondary mb-4'>
            {searchQuery || selectedCategory !== 'all'
              ? 'Prova a modificare i filtri di ricerca o la categoria selezionata.'
              : 'I componenti verranno aggiunti man mano che vengono ristrutturati.'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className='px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors'
            >
              Mostra tutti i componenti
            </button>
          )}

          {/* Next Components Preview */}
          {!searchQuery && selectedCategory === 'all' && (
            <div className='mt-8 p-4 bg-bg-secondary rounded-lg'>
              <div className='text-sm font-medium text-text-primary mb-2'>Prossimi Componenti da Ristrutturare:</div>
              <div className='flex flex-wrap gap-2 justify-center'>
                {['Avatar', 'TimePicker', 'NavigationMenu', 'DatePicker', 'Skeleton'].map(name => (
                  <span
                    key={name}
                    className='px-2 py-1 bg-bg-primary text-text-secondary text-xs rounded border border-border-default'
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explorer Modal */}
      {selectedComponent && <ExplorerModal isOpen={modalOpen} component={selectedComponent} onClose={handleModalClose} />}
    </div>
  );
};

export default Explorer;
