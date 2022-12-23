import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'

import { AtGuard } from 'auth/guards'
import { CreateInvoiceDto, DraftInvoiceDto } from './dto'
import { InvoiceEntity } from './invoice.entity'
import { InvoiceService } from './invoice.service'
import { IInvoicesQuery } from './types'
import { UserEntity } from 'auth/auth.entity'
import { User } from 'auth/decorators'

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @UseGuards(AtGuard)
  @Get()
  async getInvoices(@User('id') currentUserId: number, @Query() query: IInvoicesQuery) {
    return await this.invoiceService.getInvoices(query, currentUserId)
  }

  @UseGuards(AtGuard)
  @Get(':invoiceId')
  async getInvoice(@User('id') currentUserId: number, @Param('invoiceId') invoiceId: number) {
    return await this.invoiceService.getInvoice(invoiceId, currentUserId)
  }

  @UseGuards(AtGuard)
  @Post()
  async createInvoice(@User() currentUser: UserEntity, @Body() createInvoiceDto: CreateInvoiceDto) {
    return await this.invoiceService.createNewInvoice(createInvoiceDto, currentUser)
  }

  @UseGuards(AtGuard)
  @Post('draft')
  async draftInvoice(@User() currentUser: UserEntity, @Body() draftInvoiceDto: DraftInvoiceDto) {
    return await this.invoiceService.addDraftInvoice(draftInvoiceDto, currentUser)
  }

  @UseGuards(AtGuard)
  @Patch()
  async editInvoice(@User('id') currentUserId: number, @Body() invoiceToUpdate: InvoiceEntity) {
    return await this.invoiceService.editInvoice(invoiceToUpdate, currentUserId)
  }

  @UseGuards(AtGuard)
  @Patch('paid')
  async markInvoiceAsPaid(@User('id') currentUserId: number, @Body('id') invoiceId: number) {
    return await this.invoiceService.markInvoiceAsPaid(invoiceId, currentUserId)
  }

  @UseGuards(AtGuard)
  @Delete()
  async deleteInvoice(@User('id') currentUserId: number, @Body('id') invoiceId: number) {
    return await this.invoiceService.deleteInvoice(invoiceId, currentUserId)
  }
}
