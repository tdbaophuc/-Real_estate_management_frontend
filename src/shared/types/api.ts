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
  timestamp: string;
};

export type PaginatedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type NormalizedApiError = {
  code: string;
  fieldErrors: Record<string, string>;
  message: string;
  status: number;
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

