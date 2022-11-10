import { IsEmail, IsNotEmpty, Length, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty()
  @Length(4, 20)
  readonly username: string

  @IsNotEmpty()
  @IsEmail()
  readonly email: string

  @MinLength(6)
  @IsNotEmpty()
  readonly password: string
}
