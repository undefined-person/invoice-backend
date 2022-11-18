import { Type } from 'class-transformer'
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator'

import { IInvoiceClient, IInvoiceItem } from 'invoice/types'

class InvoiceCreateDto {
  @IsNotEmpty()
  @IsString()
  street: string

  @IsNotEmpty()
  @IsString()
  city: string

  @IsNotEmpty()
  @IsString()
  postCode: string

  @IsNotEmpty()
  @IsString()
  country: string
}

class IInvoiceItemDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsNumber()
  quantity: number

  @IsNotEmpty()
  @IsNumber()
  price: number

  @IsNotEmpty()
  @IsNumber()
  total: number
}

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsDateString({})
  createdAt: Date

  @IsNotEmpty()
  @IsString()
  description: string

  @IsNotEmpty()
  @IsNumber()
  paymentTerms: number

  @IsNotEmpty()
  @IsString()
  clientName: string

  @IsNotEmpty()
  @IsEmail()
  clientEmail: string

  @ValidateNested()
  @Type(() => InvoiceCreateDto)
  senderAddress: IInvoiceClient

  @ValidateNested()
  @Type(() => InvoiceCreateDto)
  clientAddress: IInvoiceClient

  @ValidateNested()
  @Type(() => IInvoiceItemDto)
  items: Array<IInvoiceItem>
}
