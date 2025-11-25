export interface BaseCriteria {
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  isDescending?: boolean;
  createdFrom?: Date | string;
  createdTo?: Date | string;
  updatedFrom?: Date | string;
  updatedTo?: Date | string;
  createdBy?: string;
  updatedBy?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface NormalizedCriteria {
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  isDescending?: boolean;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  createdBy?: string;
  updatedBy?: string;
  pageNumber?: number;
  pageSize?: number;
  [key: string]: any;
}
