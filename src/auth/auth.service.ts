import { Injectable } from '@nestjs/common'
import { SigninUserDtoDto } from './dto/signin-user.dto'
import { UserService } from '../user/user.service'
import * as argon2 from 'argon2'
import { BusinessException } from '../exceptions/business.exception'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}
  async signin(userName: string, password: string) {
    const user = await this.userService.findByName(userName)
    console.log(user)
    if (!user) {
      throw new BusinessException('用户不存在，请注册')
    }

    const isPasswordValid = await argon2.verify(user.password, password)
    if (!isPasswordValid) {
      throw new BusinessException('用户名或密码不正确')
    }

    const payload = { sub: user.id, userName: user.userName }
    const accessToken = await this.jwtService.signAsync(payload)
    return {
      accessToken,
    }
  }

  async signup(dto: SigninUserDtoDto) {
    const user = await this.userService.findByName(dto.userName)
    if (user) {
      throw new BusinessException('用户已存在')
    }
    return await this.userService.create(dto)
  }
}
