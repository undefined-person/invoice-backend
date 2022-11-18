import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common'

import { AtGuard } from 'auth/guards'
import { CreateInvoiceDto, DraftInvoiceDto } from './dto'
import { InvoiceEntity } from './invoice.entity'
import { InvoiceService } from './invoice.service'
import { IInvoicesQuery } from './types'

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @UseGuards(AtGuard)
  @Get()
  async getInvoices(@Query() query: IInvoicesQuery) {
    return await this.invoiceService.getInvoices(query)
  }

  @UseGuards(AtGuard)
  @Post()
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return await this.invoiceService.createNewInvoice(createInvoiceDto)
  }

  @UseGuards(AtGuard)
  @Post('draft')
  async draftInvoice(@Body() draftInvoiceDto: DraftInvoiceDto) {
    return await this.invoiceService.addDraftInvoice(draftInvoiceDto)
  }

  @UseGuards(AtGuard)
  @Patch()
  async editInvoice(@Body() invoiceToUpdate: InvoiceEntity) {
    return await this.invoiceService.editInvoice(invoiceToUpdate)
  }

  @UseGuards(AtGuard)
  @Patch('paid')
  async markInvoiceAsPaid(@Body('id') invoiceId: number) {
    return await this.invoiceService.markInvoiceAsPaid(invoiceId)
  }
}
