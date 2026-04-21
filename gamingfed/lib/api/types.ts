export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export class ApiError extends Error {
  status: number;
  errors?: unknown;
  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}
