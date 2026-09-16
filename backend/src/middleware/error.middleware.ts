import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  errors: any[];

  constructor(message: string, statusCode = 400, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`${req.method} ${req.originalUrl} - Error:`, err);

  // Custom application error
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Prisma unique constraint violation (e.g. duplicate email/code)
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[])?.join(', ') || 'field';
    return sendError(res, `A record with this ${target} already exists.`, 409);
  }

  // Prisma foreign key constraint failure
  if (err.code === 'P2003') {
    return sendError(res, 'Related record not found.', 400);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return sendError(res, 'Requested record not found.', 404);
  }

  // Default internal server error
  return sendError(
    res,
    err.message || 'Internal server error',
    500
  );
};
