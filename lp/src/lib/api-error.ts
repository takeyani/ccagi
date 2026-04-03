import { NextResponse } from "next/server";

type ErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INVENTORY_EXHAUSTED"
  | "EXPIRED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const STATUS_MAP: Record<ErrorCode, number> = {
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  INVENTORY_EXHAUSTED: 400,
  EXPIRED: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export function apiError(code: ErrorCode, message: string) {
  return NextResponse.json(
    { error: message, code },
    { status: STATUS_MAP[code] }
  );
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
