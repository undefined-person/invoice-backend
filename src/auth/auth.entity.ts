import { hash } from 'argon2'
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'

import { InvoiceEntity } from 'invoice/invoice.entity'
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  email: string

  @Column()
  username: string

  @Column({ select: false })
  password: string

  @Column({ nullable: true, default: null })
  hashedRt: string

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.owner)
  invoices: Array<InvoiceEntity>

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password)
  }
}
