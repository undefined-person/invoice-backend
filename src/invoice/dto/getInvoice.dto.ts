import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class GetInvoiceDto {
  @ApiProperty({ type: Array<string>, description: 'Status' })
  @IsString({ each: true })
  @IsOptional()
  readonly status?: Array<string>

  @ApiProperty({ type: Number, description: 'Limit' })
  @IsNumber()
  readonly limit?: number

  @ApiProperty({ type: Number, description: 'Offset' })
  @IsNumber()
  readonly offset?: number
}
