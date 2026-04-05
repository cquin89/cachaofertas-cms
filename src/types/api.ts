/** Envoltorio estándar del backend para respuestas exitosas */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Respuesta paginada con offset */
export interface PageResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/** Respuesta paginada con cursor */
export interface CursorPageResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** Parámetros comunes de listado */
export interface ListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
}

/** Error tipado del backend */
export interface ApiError {
  errorCode: string;
  message: string;
  details?: Record<string, string>;
  timestamp?: string;
}

/** Rango de fechas para filtros */
export interface DateRange {
  from: string;
  to: string;
}
