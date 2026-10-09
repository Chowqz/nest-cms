import { IsString, IsNotEmpty, Length } from 'class-validator'

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  name: string

  @IsString()
  @IsNotEmpty()
  @Length(0, 200)
  description: string
}
