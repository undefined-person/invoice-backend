import { User } from './decorators/user.decorator'
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common'
import { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { REFRESH_COOKIE_AGE } from './constants'
import { Public } from './decorators'
import { CreateUserDto, LoginUserDto } from './dto'
import { AtGuard, RtGuard } from './guards'
import { IUserResponse } from './types'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.signUp(createUserDto)

    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: REFRESH_COOKIE_AGE,
      httpOnly: true,
    })

    return { user, accessToken: tokens.accessToken }
  }

  @Public()
  @Post('signin')
  async signIn(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response): Promise<IUserResponse> {
    const { user, tokens } = await this.authService.signIn(loginUserDto)

    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: REFRESH_COOKIE_AGE,
      httpOnly: true,
    })

    return { user, accessToken: tokens.accessToken }
  }

  @UseGuards(AtGuard)
  @Post('logout')
  async logout(@User('id') userId: number, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(userId)
    res.clearCookie('refreshToken')
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  async refreshTokens(
    @User('id') userId: number,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<IUserResponse> {
    const { user, tokens } = await this.authService.refreshTokens(userId, request.cookies.refreshToken)

    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: REFRESH_COOKIE_AGE,
      httpOnly: true,
    })

    return { user, accessToken: tokens.accessToken }
  }
}
