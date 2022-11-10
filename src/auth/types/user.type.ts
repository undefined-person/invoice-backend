import { UserEntity } from 'auth/auth.entity'

export type UserType = Omit<UserEntity, 'hashedRt' | 'hashPassword'>
