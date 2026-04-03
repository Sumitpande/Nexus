
import { BaseError } from './BaseError'

// 400
export class BadRequestError extends BaseError {
    constructor(message = 'Bad Request', meta?: any) {
        super(message, 400, { code: 'BAD_REQUEST', meta })
    }
}

// 401
export class UnauthorizedError extends BaseError {
    constructor(message = 'Unauthorized', meta?: any) {
        super(message, 401, { code: 'UNAUTHORIZED', meta })
    }
}

// 403
export class ForbiddenError extends BaseError {
    constructor(message = 'Forbidden', meta?: any) {
        super(message, 403, { code: 'FORBIDDEN', meta })
    }
}

// 404
export class NotFoundError extends BaseError {
    constructor(message = 'Not Found', meta?: any) {
        super(message, 404, { code: 'NOT_FOUND', meta })
    }
}

// 409
export class ConflictError extends BaseError {
    constructor(message = 'Conflict', meta?: any) {
        super(message, 409, { code: 'CONFLICT', meta })
    }
}

// 500
export class InternalServerError extends BaseError {
    constructor(message = 'Internal Server Error', meta?: any) {
        super(message, 500, { code: 'INTERNAL_ERROR', meta })
    }
}