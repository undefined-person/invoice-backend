import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { JwtPayload } from 'auth/types'
import { AuthService } from 'auth/auth.service'
import { UserEntity } from 'auth/auth.entity'
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: `${process.env.AT_SECRET}`,
    })
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    return await this.authService.getUserById(payload.id)
  }
}
