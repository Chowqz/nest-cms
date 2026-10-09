import { Transform } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { RoleType } from '@/enum/user.enum'

export class ListUserDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  pageNum?: number

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number

  @IsOptional()
  @IsString()
  @MaxLength(50)
  userName?: string

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsEnum(RoleType)
  roleId?: RoleType

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  createTimeStart?: number

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  createTimeEnd?: number
}
