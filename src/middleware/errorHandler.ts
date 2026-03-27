import { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import config from '../config'
import { AppError } from '../utils/AppError'

/**
 * Central error handler: AppError, Zod, and unknown errors.
 */
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err)

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            code: err.code,
        })
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: err.flatten(),
        })
    }

    const status = typeof (err as { status?: number }).status === 'number'
        ? (err as { status: number }).status
        : 500

    return res.status(status).json({
        message: config.nodeEnv === 'production' && status === 500
            ? 'unknown error'
            : err instanceof Error
                ? err.message
                : String(err),
    })
}

export default errorHandler