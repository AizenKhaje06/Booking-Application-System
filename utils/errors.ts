export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = "APP_ERROR",
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

export function toActionError(error: unknown) {
  return {
    success: false as const,
    error: getErrorMessage(error),
  };
}
