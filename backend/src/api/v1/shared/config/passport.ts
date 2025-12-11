import passport from 'passport'
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  type StrategyOptionsWithoutRequest,
} from 'passport-jwt'
import type { AccessTokenPayload } from '../interfaces/jwt-payload.interface'

const opts: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'secret',
}

passport.use(
  new JwtStrategy(
    opts,
    async (accessTokenPayload: AccessTokenPayload, done) => {
      return done(null, accessTokenPayload)
    },
  ),
)

export default passport
