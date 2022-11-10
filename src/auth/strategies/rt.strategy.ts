import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { Injectable } from '@nestjs/common'

import { JwtPayload } from 'auth/types'

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshToken
        },
      ]),
      secretOrKey: `${process.env.RT_SECRET}`,
      passReqToCallback: true,
    })
  }

  validate(_: Request, payload: JwtPayload): JwtPayload {
    return payload
  }
}
