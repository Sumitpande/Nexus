import { Request, Response, NextFunction } from "express";
import { BaseError } from "./BaseError";

/**
 * Centralized Express error‑handling middleware.
 *
 * - If the error is an instance of `BaseError` (or a subclass) we use its
 *   `statusCode` and `message`.
 * - Otherwise we treat it as an internal server error (500).
 * - The response shape is consistent across all services.
 */
export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    // Known application error (extends BaseError)
    if (err instanceof BaseError) {
        const { statusCode, message, code, meta } = err;
        return res.status(statusCode).json({
            error: {
                message,
                code,
                ...(meta && { meta }),
            },
        });
    }

    // Unexpected error – log it (you can replace this with a logger)
    console.error("Unexpected error:", err);

    // Generic 500 response
    return res.status(500).json({
        error: {
            message: "Internal Server Error",
            code: "INTERNAL_ERROR",
        },
    });
};