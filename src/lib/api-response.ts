import type { ActiveErrorCode } from "./error-catalog";

export type ApiSuccess<T> = { data: T };
export type ApiFailure = { error: string; code: ActiveErrorCode };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
