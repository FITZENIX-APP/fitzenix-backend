import { RequestHandler } from 'express'
import { ZodSchema } from 'zod'

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    req.body = schema.parse(req.body) as unknown as typeof req.body
    next()
  }
}

export function validateQuery<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    req.query = schema.parse(req.query) as unknown as typeof req.query
    next()
  }
}

export function validateParams<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    req.params = schema.parse(req.params) as unknown as typeof req.params
    next()
  }
}
