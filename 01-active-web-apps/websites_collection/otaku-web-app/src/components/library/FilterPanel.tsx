import React from 'react';
import { X, Check } from 'lucide-react';
import { FilterOptions } from '../../types/types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: any) => void;
  onToggleMultiSelect: (key: 'genres' | 'studios' | 'resolutions' | 'types' | 'statuses' | 'years', value: any) => void;
  onClose: () => void;
  availableGenres: string[];
  availableStudios: string[];
  availableYears: number[];
  availableResolutions: string[];
  availableTypes: string[];
  availableStatuses: string[];
  authors: string[];
  directors: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onToggleMultiSelect,
  onClose,
  availableGenres,
  availableStudios,
  availableYears,
  availableResolutions,
  availableTypes,
  availableStatuses,
  authors,
  directors
}) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-gray-900 border-l border-gray-800 z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold uppercase tracking-tight text-white">Filtrai</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Sections */}
        <div className="p-4 space-y-6">
          {/* Genres */}
          <FilterSection title="Žanrai" count={filters.genres.length}>
            <div className="grid grid-cols-2 gap-2">
              {availableGenres.map(genre => (
                <FilterCheckbox
                  key={genre}
                  label={genre}
                  checked={filters.genres.includes(genre)}
                  onChange={() => onToggleMultiSelect('genres', genre)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Studios */}
          <FilterSection title="Studijos" count={filters.studios.length}>
            <div className="space-y-2">
              {availableStudios.map(studio => (
                <FilterCheckbox
                  key={studio}
                  label={studio}
                  checked={filters.studios.includes(studio)}
                  onChange={() => onToggleMultiSelect('studios', studio)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Resolution */}
          <FilterSection title="Skiriamoji geba" count={filters.resolutions.length}>
            <div className="grid grid-cols-2 gap-2">
              {availableResolutions.map(resolution => (
                <FilterCheckbox
                  key={resolution}
                  label={resolution}
                  checked={filters.resolutions.includes(resolution)}
                  onChange={() => onToggleMultiSelect('resolutions', resolution)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Type */}
          <FilterSection title="Tipas" count={filters.types.length}>
            <div className="grid grid-cols-2 gap-2">
              {availableTypes.map(type => (
                <FilterCheckbox
                  key={type}
                  label={type}
                  checked={filters.types.includes(type)}
                  onChange={() => onToggleMultiSelect('types', type)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Status */}
          <FilterSection title="Būsena" count={filters.statuses.length}>
            <div className="space-y-2">
              {availableStatuses.map(status => (
                <FilterCheckbox
                  key={status}
                  label={status}
                  checked={filters.statuses.includes(status)}
                  onChange={() => onToggleMultiSelect('statuses', status)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Years */}
          <FilterSection title="Metai" count={filters.years.length}>
            <div className="grid grid-cols-3 gap-2">
              {availableYears.map(year => (
                <FilterCheckbox
                  key={year}
                  label={year.toString()}
                  checked={filters.years.includes(year)}
                  onChange={() => onToggleMultiSelect('years', year)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Authors (Info only) */}
          {authors.length > 0 && (
            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
                Autoriai bibliotekoje ({authors.length})
              </h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {authors.map(author => (
                  <div key={author} className="text-xs text-gray-500 font-mono">
                    • {author}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Directors (Info only) */}
          {directors.length > 0 && (
            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
                Režisieriai bibliotekoje ({directors.length})
              </h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {directors.map(director => (
                  <div key={director} className="text-xs text-gray-500 font-mono">
                    • {director}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Filter Section Component
const FilterSection: React.FC<{ title: string; count?: number; children: React.ReactNode }> = ({ title, count, children }) => (
  <div>
    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between">
      <span>{title}</span>
      {count !== undefined && count > 0 && (
        <span className="px-2 py-0.5 bg-violet-600 text-white text-[10px] rounded-full font-mono">
          {count}
        </span>
      )}
    </h3>
    {children}
  </div>
);

// Filter Checkbox Component
const FilterCheckbox: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition">
    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
      checked ? 'bg-violet-600 border-violet-500' : 'border-gray-700'
    }`}>
      {checked && <Check className="w-3 h-3 text-white" />}
    </div>
    <span className={`text-sm ${checked ? 'text-white font-medium' : 'text-gray-400'}`}>
      {label}
    </span>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
  </label>
);

export default FilterPanel;

