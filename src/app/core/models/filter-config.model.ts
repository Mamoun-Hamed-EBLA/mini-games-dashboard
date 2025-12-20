import { Lookup } from "./lookup";

export type FilterFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';



export interface FilterFieldConfig {
  name: string;
  label: string;
  type: FilterFieldType;
  placeholder?: string;
  options?: Lookup[];
  min?: number;
  max?: number;
  defaultValue?: any;
}

export interface FilterConfig {
  showSearch?: boolean;
  searchPlaceholder?: string;
  showSort?: boolean;
  sortOptions?: Lookup[];
  showDateFilters?: boolean;
  customFields?: FilterFieldConfig[];
  showPagination?: boolean;
  defaultPageSize?: number;
}
