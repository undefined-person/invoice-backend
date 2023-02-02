import { IsNumber, IsOptional, IsString } from 'class-validator'

export class GetInvoiceDto {
  @IsString({ each: true })
  @IsOptional()
  readonly status?: Array<string>

  @IsNumber()
  readonly limit?: number

  @IsNumber()
  readonly offset?: number
}
