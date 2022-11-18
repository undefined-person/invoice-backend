import { Type } from 'class-transformer'
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

import { IInvoiceClient, IInvoiceItem } from 'invoice/types'

class InvoiceDraftDto {
  @IsOptional()
  @IsString()
  street: string

  @IsOptional()
  @IsString()
  city: string

  @IsOptional()
  @IsString()
  postCode: string

  @IsOptional()
  @IsString()
  country: string
}

class IInvoiceItemDto {
  @IsOptional()
  @IsString()
  name: string

  @IsOptional()
  @IsNumber()
  quantity: number

  @IsOptional()
  @IsNumber()
  price: number

  @IsOptional()
  @IsNumber()
  total: number
}

export class DraftInvoiceDto {
  @IsOptional()
  @IsDateString({})
  createdAt: Date

  @IsOptional()
  @IsString()
  description: string

  @IsOptional()
  @IsNumber()
  paymentTerms: number

  @IsOptional()
  @IsString()
  clientName: string

  @IsOptional()
  @IsEmail()
  clientEmail: string

  @ValidateNested()
  @Type(() => InvoiceDraftDto)
  senderAddress: IInvoiceClient

  @ValidateNested()
  @Type(() => InvoiceDraftDto)
  clientAddress: IInvoiceClient

  @ValidateNested()
  @Type(() => IInvoiceItemDto)
  items: Array<IInvoiceItem>
}
