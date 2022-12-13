import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as RandExp from 'randexp'

import { CreateInvoiceDto, DraftInvoiceDto } from './dto/'
import { InvoiceEntity } from './invoice.entity'
import { addDays } from 'utils'
import { IInvoiceStatus, IInvoicesQuery, IInvoicesResponse } from './types'
import { UserEntity } from 'auth/auth.entity'

@Injectable()
export class InvoiceService {
  constructor(@InjectRepository(InvoiceEntity) private readonly invoiceRepository: Repository<InvoiceEntity>) {}

  /**
   * It returns a list of invoices for a given user, with optional filtering by status and pagination.
   *
   * The function takes two arguments:
   *
   * query: IInvoicesQuery - an object containing the query parameters
   * currentUserId: number - the ID of the user whose invoices we want to retrieve
   * The function returns an object of type IInvoicesResponse, which contains the following properties:
   *
   * data: Invoice[] - an array of Invoice objects
   * count: number - the total number of invoices for the given user, ignoring pagination
   * The query object has the following properties:
   *
   * status: string[] - an array of invoice statuses to filter by
   * limit: number - the maximum number of invoices to return
   * offset: number - the number of invoices to skip before returning results
   * The function uses the
   * @param {IInvoicesQuery} query - IInvoicesQuery
   * @param {number} currentUserId - number - this is the user id of the user who is logged in
   * @returns An array of Invoice entities and the total count of Invoice entities.
   */
  async getInvoices(query: IInvoicesQuery, currentUserId: number): Promise<IInvoicesResponse> {
    const queryBuilder = this.invoiceRepository.createQueryBuilder('invoices').where('invoices.ownerId = :id', { id: currentUserId })

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
   * "Create a new invoice with the given data, set the status to pending, and return the invoice."
   * @param {CreateInvoiceDto} createInvoiceDto - CreateInvoiceDto
   * @param {UserEntity} currentUser - UserEntity
   * @returns The return type is InvoiceEntity.
   */
  async createNewInvoice(createInvoiceDto: CreateInvoiceDto, currentUser: UserEntity): Promise<InvoiceEntity> {
    return await this.createInvoice(createInvoiceDto, IInvoiceStatus.PENDING, currentUser)
  }

  /**
   * This function takes a DraftInvoiceDto and a UserEntity and returns a Promise of an InvoiceEntity.
   * @param {DraftInvoiceDto} draftInvoiceDto - DraftInvoiceDto
   * @param {UserEntity} currentUser - UserEntity
   * @returns The return type is InvoiceEntity.
   */
  async addDraftInvoice(draftInvoiceDto: DraftInvoiceDto, currentUser: UserEntity): Promise<InvoiceEntity> {
    return await this.createInvoice(draftInvoiceDto, IInvoiceStatus.DRAFT, currentUser)
  }

  /**
   * "If the invoice exists, and the current user is the owner of the invoice, then update the
   * invoice."
   * @param {InvoiceEntity} invoiceToUpdate - InvoiceEntity - this is the invoice object that is passed
   * in from the frontend.
   * @param {number} currentUserId - number - this is the id of the user who is currently logged in.
   * @returns The updated invoice
   */
  async editInvoice(invoiceToUpdate: InvoiceEntity, currentUserId: number): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findOne({
      where: {
        id: invoiceToUpdate.id,
      },
    })

    if (!invoice) {
      throw new HttpException('Invoice is not exist', HttpStatus.NOT_FOUND)
    }

    if (invoice.owner.id !== currentUserId) {
      throw new HttpException('You are not an owner of invoice', HttpStatus.FORBIDDEN)
    }

    return await this.invoiceRepository.save({
      ...invoiceToUpdate,
    })
  }

  /**
   * Mark an invoice as paid by its id and the id of the current user.
   * @param {number} invoiceId - number - the id of the invoice to be marked as paid
   * @param {number} currentUserId - number - this is the id of the user who is currently logged in.
   * @returns The invoice entity with the updated status.
   */
  async markInvoiceAsPaid(invoiceId: number, currentUserId: number): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findOne({
      where: {
        id: invoiceId,
      },
    })

    if (!invoice) {
      throw new HttpException('Invoice is not exist', HttpStatus.NOT_FOUND)
    }

    if (invoice.owner.id !== currentUserId) {
      throw new HttpException('You are not an owner of invoice', HttpStatus.FORBIDDEN)
    }

    invoice.status = IInvoiceStatus.PAID

    return await this.invoiceRepository.save(invoice)
  }

  /**
   * "Create a new invoice, assign it a random orderId, assign it a paymentDue date if the user has
   * provided a createdAt and paymentTerms, assign it a status, assign it an owner, and then assign it
   * the rest of the properties from the createInvoiceDto."
   * </code>
   * @param {DraftInvoiceDto | CreateInvoiceDto} createInvoiceDto - DraftInvoiceDto | CreateInvoiceDto
   * @param {IInvoiceStatus} status - IInvoiceStatus
   * @param {UserEntity} currentUser - UserEntity
   * @returns The newInvoice object is being returned.
   */
  async createInvoice(
    createInvoiceDto: DraftInvoiceDto | CreateInvoiceDto,
    status: IInvoiceStatus,
    currentUser: UserEntity
  ): Promise<InvoiceEntity> {
    const newInvoice = new InvoiceEntity()
    newInvoice.orderId = new RandExp(/([A-Z]{2}[0-9]{4})/).gen()

    if (createInvoiceDto.createdAt && createInvoiceDto.paymentTerms) {
      newInvoice.paymentDue = addDays(createInvoiceDto.createdAt, createInvoiceDto.paymentTerms)
    }

    newInvoice.status = status
    newInvoice.owner = currentUser

    Object.assign(newInvoice, createInvoiceDto)
    return await this.invoiceRepository.save(newInvoice)
  }

  /**
   * Delete an invoice by id, if the invoice exists and the current user is the owner of the invoice.
   * @param {number} invoiceId - number - the id of the invoice to be deleted
   * @param {number} currentUserId - number - this is the id of the user who is currently logged in.
   * @returns The return value is the number of rows affected by the delete query.
   */
  async deleteInvoice(invoiceId: number, currentUserId: number) {
    const invoice = await this.invoiceRepository.findOne({
      where: {
        id: invoiceId,
      },
    })

    if (!invoice) {
      throw new HttpException('Invoice is not exist', HttpStatus.NOT_FOUND)
    }

    if (invoice.owner.id !== currentUserId) {
      throw new HttpException('You are not an owner of invoice', HttpStatus.FORBIDDEN)
    }

    return await this.invoiceRepository.delete({ id: invoiceId })
  }
}
