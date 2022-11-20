import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Not, Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { hash, verify } from 'argon2'

import { CreateUserDto, LoginUserDto } from './dto/'
import { UserEntity } from './auth.entity'
import { IUserWithTokensResponse, Tokens } from './types'
import { AT_AGE, RT_AGE } from './constants'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService
  ) {}

  /**
   * It creates a new user, generates JWT tokens, and returns the user and tokens
   * @param {CreateUserDto} createUserDto - CreateUserDto
   * @returns {
   *     user: {
   *       id: '1',
   *       email: 'test@test.com',
   *       username: 'test',
   *     },
   *     tokens: {
   *       accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJp',
   *       refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJp'
   *     }
   * }
   */
  async signUp(createUserDto: CreateUserDto): Promise<IUserWithTokensResponse> {
    const userByEmail = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    })

    const userByUsername = await this.userRepository.findOne({
      where: {
        username: createUserDto.username,
      },
    })

    if (userByEmail || userByUsername) {
      throw new HttpException('Email or username is already taken', HttpStatus.UNPROCESSABLE_ENTITY)
    }

    const newUser = new UserEntity()

    Object.assign(newUser, createUserDto)

    const user = await this.userRepository.save(newUser)

    const tokens = await this.generateJWT(user.id, user.email)

    await this.updateRtHash(user.id, tokens.refreshToken)

    delete user.password
    delete user.hashedRt

    return { user, tokens }
  }

  /**
   * It takes an email and password, finds a user with that email, checks if the password is correct,
   * generates JWT tokens, updates the refresh token hash, and returns the user and tokens
   * @param {LoginUserDto}  - LoginUserDto - the object that will be passed to the method.
   * @returns {
   *     user: {
   *       id: '1',
   *       email: 'test@test.com',
   *       username: 'test',
   *     },
   *     tokens: {
   *       accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJp',
   *       refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJp'
   *     }
   * }
   */
  async signIn({ email, password }: LoginUserDto): Promise<IUserWithTokensResponse> {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
      select: ['id', 'email', 'username', 'password'],
    })

    if (!user) {
      throw new HttpException('User is not exist', HttpStatus.UNPROCESSABLE_ENTITY)
    }

    const isPasswordCorrect = await verify(user.password, password)

    if (!isPasswordCorrect) {
      throw new HttpException('Credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY)
    }

    const tokens = await this.generateJWT(user.id, user.email)

    await this.updateRtHash(user.id, tokens.refreshToken)

    delete user.password

    return { user, tokens }
  }

  /**
   * It updates the user with the given id, if the user has a hashedRt value, and sets the hashedRt value
   * to null
   * @param {number} userId - The user's ID.
   */
  async logout(userId: number) {
    await this.userRepository.update(
      {
        id: userId,
        hashedRt: Not(IsNull()),
      },
      {
        hashedRt: null,
      }
    )
  }

  /**
   * It takes a userId and a refreshToken, finds the user in the database, verifies the refreshToken,
   * generates new tokens, updates the refreshToken hash in the database, and returns the user and the
   * new tokens
   * @param {number} userId - The user's id
   * @param {string} rt - refresh token
   * @returns An object with the user and tokens.
   */
  async refreshTokens(userId: number, rt: string): Promise<IUserWithTokensResponse> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    })

    if (!user || !user.hashedRt) {
      throw new HttpException('Access Denied', HttpStatus.UNAUTHORIZED)
    }

    const rtMatches = await verify(user.hashedRt, rt)

    if (!rtMatches) {
      throw new HttpException('Access Denied', HttpStatus.UNAUTHORIZED)
    }

    const tokens = await this.generateJWT(user.id, user.email)

    await this.updateRtHash(user.id, tokens.refreshToken)

    delete user.hashedRt

    return { user, tokens }
  }

  /**
   * It generates a pair of JWT tokens, one for access and one for refresh, and returns them as an object
   * @param {number} id - The user's id
   * @param {string} email - The email of the user
   * @returns An object with two properties, accessToken and refreshToken.
   */
  async generateJWT(id: number, email: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id,
          email,
        },
        {
          secret: `${process.env.AT_SECRET}`,
          expiresIn: AT_AGE,
        }
      ),
      this.jwtService.signAsync(
        {
          id,
          email,
        },
        {
          secret: `${process.env.RT_SECRET}`,
          expiresIn: RT_AGE,
        }
      ),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  /**
   * It takes a string as input and returns a hash of that string
   * @param {string} data - The data to be hashed.
   * @returns The hash of the data
   */
  hashData(data: string) {
    return hash(data)
  }

  /**
   * It takes a userId and a refresh token, hashes the refresh token, and then saves the hash to the
   * database
   * @param {number} userId - The user's id
   * @param {string} rt - The refresh token that was sent to the client
   * @returns The user object with the updated hashedRt
   */
  async updateRtHash(userId: number, rt: string) {
    const hash = await this.hashData(rt)
    const user = await this.userRepository.findOne({ where: { id: userId } })

    user.hashedRt = hash

    return await this.userRepository.save(user)
  }
}
