import { Injectable } from '@nestjs/common'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Role } from './entities/role.entity'
import { Repository } from 'typeorm'

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const role = this.roleRepository.create(createRoleDto)
    const res = await this.roleRepository.save(role)
    return res
  }

  findAll() {
    return this.roleRepository.find({
      select: {
        id: true,
        name: true,
        description: true,
      },
    })
  }

  findOne(id: number) {
    return this.roleRepository.findOne({
      where: {
        id,
      },
    })
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`
  }

  remove(id: number) {
    return `This action removes a #${id} role`
  }
}
