import type { Request } from 'express'

export class RequestUtils {
  static getRequestMetadata = (req: Request) => {
    return {
      ip:
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      deviceInfo: req.get('User-Agent'),
    }
  }
}
