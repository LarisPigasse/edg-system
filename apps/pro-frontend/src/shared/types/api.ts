// src/shared/types/api.ts

/**
 * Forma della risposta usata da tutti i backend della piattaforma (auth-service,
 * system-service, ...): un solo tipo condiviso, non uno per feature.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field: string; message: string }[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
