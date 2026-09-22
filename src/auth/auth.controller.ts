import { Controller, Post, Body, Get, Request } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SigninUserDtoDto } from './dto/signin-user.dto'
import { Public } from '@/decorators/public.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  signIn(@Body() dto: SigninUserDtoDto) {
    const { userName, password } = dto
    return this.authService.signin(userName, password)
  }

  @Public()
  @Post('signup')
  signup(@Body() dto: SigninUserDtoDto) {
    return this.authService.signup(dto)
  }

  @Get('profile')
  getProfile(@Request() req) {
    return {
      profile: req.user,
    }
  }
}
