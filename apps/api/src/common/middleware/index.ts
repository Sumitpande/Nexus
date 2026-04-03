import rateLimit from "express-rate-limit";
import { BaseError } from '@nexus/errors'
import { Request, Response, NextFunction } from 'express'

import { randomUUID } from 'crypto'
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many auth requests.",
});

export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many messages.",
});



interface ErrorResponse {
  message: string
  code: string
  meta?: Record<string, any> | null
  requestId?: string | null
}

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  req.id = randomUUID()
  next()
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): Response<ErrorResponse> => {
  if (err instanceof BaseError) {

    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      meta: err.meta ?? null, // @ts-ignore
      requestId: req.id ?? null
    })
  }

  // Optional: narrow unknown error
  const message =
    err instanceof Error ? err.message : 'Internal Server Error'

  console.error(err)

  return res.status(500).json({
    message: message,
    code: 'INTERNAL_ERROR', // @ts-ignore
    requestId: req.id ?? null
  })
}