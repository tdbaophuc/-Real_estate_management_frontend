export type ApiFieldError = {
  field?: string;
  message: string;
};

export type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
  errors?: ApiFieldError[];
  path?: string;
  timestamp: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type PaginatedResponse<T> = PageResponse<T>;

export type NormalizedApiError = {
  code: string;
  details: string[];
  fieldErrors: Record<string, string>;
  message: string;
  path?: string;
  status: number;
  timestamp?: string;
};

export type QueryValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export type FormDataValue =
  | Blob
  | File
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export type FormDataFields = Record<string, FormDataValue | FormDataValue[]>;
