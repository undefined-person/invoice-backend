export interface IInvoicesResponse {
  data: Array<IInvoicesItem>
  count: number
}

export interface IInvoicesItem {
  id: number
  orderId: string
  paymentDue: string
  clientName: string
  total: number
}
