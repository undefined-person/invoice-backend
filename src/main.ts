import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'

async function start() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser())
  app.enableCors({ credentials: true, origin: process.env.CLIENT_URL })
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT || 3000)
}

start()
