export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any[];
  timestamp: string;
}

export interface PagedData<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type PagedResponse<T> = ApiResponse<PagedData<T>>;
