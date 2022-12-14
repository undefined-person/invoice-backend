import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'

import { dataSourceOptions } from '../db/database.config'
import { AuthModule } from './auth/auth.module'
import { AtGuard } from 'auth/guards'
import { InvoiceModule } from './invoice/invoice.module'

@Module({
  imports: [AuthModule, ConfigModule.forRoot(), TypeOrmModule.forRoot(dataSourceOptions), InvoiceModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
