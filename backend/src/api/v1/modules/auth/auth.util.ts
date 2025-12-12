import type { Response } from 'express'

export class AuthUtils {
  static setRefreshToken = (
    res: Response,
    name: string,
    token: string,
    maxAge: number,
    httpOnly: boolean,
    sameSite: 'lax' | 'strict' | 'none',
    secure: boolean,
    path: string,
  ): void => {
    res.cookie(name, token, {
      maxAge,
      httpOnly,
      sameSite,
      secure,
      path,
    })
  }

  static clearRefreshToken = (
    res: Response,
    name: string,
    httpOnly: boolean,
    sameSite: 'lax' | 'strict' | 'none',
    secure: boolean,
    path: string,
  ) => {
    res.clearCookie(name, {
      httpOnly,
      sameSite,
      secure,
      path,
    })
  }

  static setAdminRefreshToken = (res: Response, token: string): void => {
    res.cookie('adminRefreshToken', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/v1/admin/auth',
    })
  }

  static clearAdminRefreshToken = (res: Response) => {
    res.clearCookie('adminRefreshToken', {
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/v1/admin/auth',
    })
  }

  static setUserRefreshToken = (res: Response, token: string): void => {
    res.cookie('userRefreshToken', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/v1/auth',
    })
  }

  static clearUserRefreshToken = (res: Response) => {
    res.clearCookie('userRefreshToken', {
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/v1/auth',
    })
  }
}
