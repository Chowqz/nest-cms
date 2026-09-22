import { IsString, IsNotEmpty, Length } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  userName: string

  @IsString()
  @IsNotEmpty()
  @Length(6, 64)
  password: string
}
