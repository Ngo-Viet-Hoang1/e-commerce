import api from '..'

class AuthService {
  static register = async (
    email: string,
    password: string,
    username?: string,
  ) => {
    return api.post('auth/register', { email, password, username })
  }
}

export default AuthService
