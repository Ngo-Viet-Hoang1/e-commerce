import type { Response } from 'express'

export class AuthUtils {
  static setRefreshTokenCookie = (res: Response, token: string): void => {
    res.cookie('refreshToken', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/v1/auth/refresh-token',
    })
  }
}
