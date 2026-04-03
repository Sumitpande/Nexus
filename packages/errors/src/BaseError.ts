
export class BaseError extends Error {
    public statusCode: number
    public code: string
    public meta?: Record<string, any>
    public isOperational: boolean

    constructor(
        message: string,
        statusCode: number,
        options: { code?: string; meta?: Record<string, any> } = {}
    ) {
        super(message)

        this.statusCode = statusCode
        this.code = options.code || 'GENERIC_ERROR'
        this.meta = options.meta
        this.isOperational = true

        // Safe check (works in Node, avoids TS error)
        if ((Error as any).captureStackTrace) {
            (Error as any).captureStackTrace(this, this.constructor)
        }
    }
}
