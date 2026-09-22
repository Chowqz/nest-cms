import { Injectable } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Repository } from 'typeorm'
import * as argon2 from 'argon2'

@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    const useList = await this.userRepository.find({
      select: {
        id: true,
        userName: true,
        createTime: true,
      },
    })

    return useList.map((item) => ({
      ...item,
      createTime: item.createTime.getTime(),
    }))
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
