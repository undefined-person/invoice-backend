import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { UserEntity } from 'auth/auth.entity'
import { IInvoiceClient, IInvoiceItem, IInvoiceStatus } from './types'

@Entity('invoice')
export class InvoiceEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  orderId: string

  @Column({ nullable: true })
  createdAt: Date

  @Column({ nullable: true })
  paymentDue: Date

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  paymentTerms: number

  @Column({ nullable: true })
  clientName: string

  @Column({ nullable: true })
  clientEmail: string

  @Column({ type: 'enum', enum: IInvoiceStatus, default: IInvoiceStatus.DRAFT })
  status: IInvoiceStatus

  @Column({ type: 'jsonb', nullable: true })
  senderAddress: IInvoiceClient

  @Column({ type: 'jsonb', nullable: true })
  clientAddress: IInvoiceClient

  @Column({ type: 'jsonb', nullable: true })
  items: Array<IInvoiceItem>

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number

  @ManyToOne(() => UserEntity, (user) => user.invoices, { eager: true })
  owner: UserEntity
}
