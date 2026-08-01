import { NextResponse } from "next/server"

/**
 * Base API error class with HTTP status code.
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

/**
 * 401 Unauthorized — authentication required or failed.
 */
export class AuthError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message)
  }
}

/**
 * 403 Forbidden — authenticated but insufficient permissions.
 */
export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, message)
  }
}

/**
 * 404 Not Found.
 */
export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(404, message)
  }
}

/**
 * 400 Bad Request — validation error.
 */
export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message)
  }
}

/**
 * Unified error handler for API routes.
 * Converts ApiError instances to appropriate JSON responses.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode })
  }

  console.error("Unhandled error:", error)
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}
