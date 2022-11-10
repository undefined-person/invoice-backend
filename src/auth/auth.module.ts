import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AtStrategy, RtStrategy } from './strategies'
import { UserEntity } from './auth.entity'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

@Module({
  providers: [AuthService, AtStrategy, RtStrategy],
  controllers: [AuthController],
  imports: [TypeOrmModule.forFeature([UserEntity]), JwtModule.register({})],
})
export class AuthModule {}
