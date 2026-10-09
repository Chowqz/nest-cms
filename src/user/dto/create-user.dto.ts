import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator'
import { RoleType } from '@/enum/user.enum'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  userName: string

  @IsString()
  @IsNotEmpty()
  @Length(6, 64)
  password: string

  @IsEnum(RoleType)
  roleId: RoleType
}
