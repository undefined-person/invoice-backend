import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as RandExp from 'randexp'

import { CreateInvoiceDto, DraftInvoiceDto } from './dto/'
import { InvoiceEntity } from './invoice.entity'
import { addDays } from 'utils'
import { IInvoiceStatus, IInvoicesQuery, IInvoicesResponse } from './types'

@Injectable()
export class InvoiceService {
  constructor(@InjectRepository(InvoiceEntity) private readonly invoiceRepository: Repository<InvoiceEntity>) {}

  /**
   * It takes an object of type IInvoicesQuery, and returns an object of type IInvoicesResponse
   * @param {IInvoicesQuery} query - IInvoicesQuery
   * @returns An array of invoices and the total count of invoices.
   */
  async getInvoices(query: IInvoicesQuery): Promise<IInvoicesResponse> {
    const queryBuilder = this.invoiceRepository.createQueryBuilder('invoices')

    if (query.status?.length > 0) {
      queryBuilder.andWhere('invoices.status IN (:...status)', { status: query.status })
    }

    if (query.limit) {
      queryBuilder.limit(query.limit)
    }

    if (query.offset) {
      queryBuilder.offset(query.offset)
    }

    const [data, count] = await queryBuilder.getManyAndCount()

    return {
      data,
      count,
    }
  }

  /**
   * It creates a new invoice with the status of pending
   * @param {CreateInvoiceDto} createInvoiceDto - CreateInvoiceDto - This is the DTO that we created
   * earlier.
   */
  async createNewInvoice(createInvoiceDto: CreateInvoiceDto): Promise<void> {
    await this.createInvoice(createInvoiceDto, IInvoiceStatus.PENDING)
  }

  /**
   * It creates an invoice with the status of draft
   * @param {DraftInvoiceDto} draftInvoiceDto - This is the data that we're going to pass to the
   * createInvoice method.
   */
  async addDraftInvoice(draftInvoiceDto: DraftInvoiceDto): Promise<void> {
    await this.createInvoice(draftInvoiceDto, IInvoiceStatus.DRAFT)
  }

  /**
   * It finds an invoice by its id, and if it exists, it updates it with the new data
   * @param {InvoiceEntity} invoiceToUpdate - InvoiceEntity
   * @returns The updated invoice
   */
  async editInvoice(invoiceToUpdate: InvoiceEntity): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findOne({
      where: {
        id: invoiceToUpdate.id,
      },
    })

    if (!invoice) {
      throw new HttpException('Invoice is not exist', HttpStatus.NOT_FOUND)
    }

    return await this.invoiceRepository.save({
      ...invoiceToUpdate,
    })
  }

  /**
   * It finds an invoice by its ID, checks if it exists, and if it does, it changes its status to PAID
   * @param {number} invoiceId - number - the id of the invoice to be marked as paid
   * @returns InvoiceEntity
   */
  async markInvoiceAsPaid(invoiceId: number): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findOne({
      where: {
        id: invoiceId,
      },
    })

    if (!invoice) {
      throw new HttpException('Invoice is not exist', HttpStatus.NOT_FOUND)
    }

    invoice.status = IInvoiceStatus.PAID

    return await this.invoiceRepository.save(invoice)
  }

  /**
   * It creates a new invoice, assigns it a random order ID, calculates the payment due date, and saves
   * it to the database
   * @param {DraftInvoiceDto | CreateInvoiceDto} createInvoiceDto - DraftInvoiceDto | CreateInvoiceDto
   * @param {IInvoiceStatus} status - IInvoiceStatus
   * @returns The new invoice is being returned.
   */
  async createInvoice(createInvoiceDto: DraftInvoiceDto | CreateInvoiceDto, status: IInvoiceStatus): Promise<InvoiceEntity> {
    const newInvoice = new InvoiceEntity()
    newInvoice.orderId = new RandExp(/([A-Z]{2}[0-9]{4})/).gen()

    if (createInvoiceDto.createdAt && createInvoiceDto.paymentTerms) {
      newInvoice.paymentDue = addDays(createInvoiceDto.createdAt, createInvoiceDto.paymentTerms)
    }

    newInvoice.status = status

    Object.assign(newInvoice, createInvoiceDto)
    return await this.invoiceRepository.save(newInvoice)
  }

  /**
   * It deletes an invoice by its id.
   * @param {number} invoiceId - number - the id of the invoice to be deleted
   * @returns The return type is a Promise&lt;DeleteResult&gt;.
   */
  async deleteInvoice(invoiceId: number) {
    const invoice = await this.invoiceRepository.findOne({
      where: {
        id: invoiceId,
      },
    })

    if (!invoice) {
      throw new HttpException('Invoice is not exist', HttpStatus.NOT_FOUND)
    }

    return await this.invoiceRepository.delete({ id: invoiceId })
  }
}
