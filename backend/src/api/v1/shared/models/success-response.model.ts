import type { Response } from 'express'
import type {
  IApiResponse,
  IPaginatedResponse,
  PaginationMetadata,
} from '../interfaces/base-response.interface'
import { PaginationBuilder } from './pagination-builder.model'

export class SuccessResponse {
  static send<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: PaginationMetadata,
  ): void {
    const response: IApiResponse<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
    }

    res.status(statusCode).json(response)
  }

  static sendNoContent(res: Response, message = 'Operation successful'): void {
    res.status(204).json({
      success: true,
      message,
      timestamp: new Date().toISOString(),
    } as IApiResponse)
  }

  static created<T>(
    res: Response,
    data: T,
    message = 'Resource created',
  ): void {
    this.send(res, data, message, 201)
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number
      limit: number
      total: number
    },
    message = 'Success',
  ): void {
    const { page, limit, total } = pagination

    const meta = PaginationBuilder.calculateMeta(page, limit, total)

    const response: IPaginatedResponse<T> = {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
    }

    res.status(200).json(response)
  }
}
