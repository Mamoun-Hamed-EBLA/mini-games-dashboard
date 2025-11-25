export type FilterFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export interface FilterFieldOption {
  label: string;
  value: any;
}

export interface FilterFieldConfig {
  name: string;
  label: string;
  type: FilterFieldType;
  placeholder?: string;
  options?: FilterFieldOption[];
  min?: number;
  max?: number;
  defaultValue?: any;
}

export interface FilterConfig {
  showSearch?: boolean;
  searchPlaceholder?: string;
  showSort?: boolean;
  sortOptions?: FilterFieldOption[];
  showDateFilters?: boolean;
  customFields?: FilterFieldConfig[];
  showPagination?: boolean;
  defaultPageSize?: number;
}
