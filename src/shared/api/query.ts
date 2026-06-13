import type { FormDataFields, FormDataValue, QueryParams, QueryValue } from "../types/api";

function isEmptyQueryValue(value: QueryValue) {
  return value === null || value === undefined || value === "";
}

function stringifyQueryValue(value: Exclude<QueryValue, null | undefined>) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

export function buildQueryString(params?: QueryParams) {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];

    values.forEach((item) => {
      if (!isEmptyQueryValue(item)) {
        searchParams.append(key, stringifyQueryValue(item));
      }
    });
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

function appendFormDataValue(formData: FormData, key: string, value: FormDataValue) {
  if (value === null || value === undefined || value === "") {
    return;
  }

  if (value instanceof Date) {
    formData.append(key, value.toISOString());
    return;
  }

  if (value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  formData.append(key, String(value));
}

export function buildFormData(fields: FormDataFields) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];
    values.forEach((item) => appendFormDataValue(formData, key, item));
  });

  return formData;
}

