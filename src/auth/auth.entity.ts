import { hash } from 'argon2'
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

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

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password)
  }
}
