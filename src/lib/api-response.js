import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(message, status = 400, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function success(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function failure(error) {
  const status = error instanceof ApiError ? error.status : 500;
  const message = error instanceof ApiError ? error.message : "Ocurrió un error inesperado.";
  const errors = error instanceof ApiError ? error.errors : [];

  return NextResponse.json({ success: false, message, errors }, { status });
}
