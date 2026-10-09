import { Injectable } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ListUserDto } from './dto/list-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm'
import * as argon2 from 'argon2'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(query: ListUserDto) {
    const pageNum = query.pageNum ?? 1
    const pageSize = query.pageSize ?? 10
    const where: FindOptionsWhere<User> = {}
    const userName = query.userName?.trim()
    const createTimeStart =
      query.createTimeStart !== undefined
        ? new Date(query.createTimeStart)
        : undefined
    const createTimeEnd =
      query.createTimeEnd !== undefined
        ? new Date(query.createTimeEnd)
        : undefined

    if (userName) {
      where.userName = Like(`%${userName}%`)
    }

    if (query.roleId !== undefined) {
      where.roleId = query.roleId
    }

    if (createTimeStart && createTimeEnd) {
      where.createTime = Between(createTimeStart, createTimeEnd)
    } else if (createTimeStart) {
      where.createTime = MoreThanOrEqual(createTimeStart)
    } else if (createTimeEnd) {
      where.createTime = LessThanOrEqual(createTimeEnd)
    }

    const [userList, total] = await this.userRepository.findAndCount({
      where,
      select: {
        id: true,
        userName: true,
        roleId: true,
        createTime: true,
      },
      order: {
        id: 'DESC',
      },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    })

    return {
      total,
      list: userList.map((item) => ({
        ...item,
        createTime: item.createTime.toLocaleString(),
      })),
    }
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      select: {
        id: true,
        userName: true,
      },
      where: {
        id,
      },
    })

    if (!user) {
      throw new NotFoundException(`user #${id} not found`)
    }

    return user
  }

  async findByName(userName: string) {
    const user = await this.userRepository.findOne({
      where: {
        userName,
      },
    })
    return user
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto)

    user.password = await argon2.hash(user.password)

    const res = await this.userRepository.save(user)

    return res
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto)
    return `This action updates a #${id} user`
  }

  remove(id: number) {
    return `This action removes a #${id} user`
  }
}
