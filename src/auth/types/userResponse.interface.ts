import { Tokens, UserType } from 'auth/types'

export interface IUserWithTokensResponse {
  user: UserType
  tokens: Tokens
}

export interface IUserResponse {
  user: UserType
  accessToken: string
}
