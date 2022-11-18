import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'

import { InvoiceController } from './invoice.controller'
import { InvoiceService } from './invoice.service'
import { InvoiceEntity } from './invoice.entity'

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService],
  imports: [TypeOrmModule.forFeature([InvoiceEntity])],
})
export class InvoiceModule {}
