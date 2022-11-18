import { InvoiceEntity } from 'invoice/invoice.entity'

export interface IInvoicesResponse {
  data: Array<InvoiceEntity>
  count: number
}
